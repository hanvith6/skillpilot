from fastapi import APIRouter, Depends, HTTPException, Request
from app.services.auth import get_current_user
from app.services.stripe_native import create_checkout_session, get_checkout_status, verify_webhook_signature
from app.models.payment import (
    PurchaseRequest, RazorpayOrderResponse, RazorpayVerifyRequest,
    StripeCheckoutRequest, StripeCheckoutResponse, StripeStatusResponse,
    CREDIT_PACKAGES,
)
from app.db import get_db
from app.config import settings
import razorpay
import logging
import uuid
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["payments"])

_razorpay_client = None


def _get_razorpay():
    global _razorpay_client
    if _razorpay_client is None:
        _razorpay_client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
    return _razorpay_client


@router.get("/payments/packages")
async def get_packages():
    """Return available credit packages."""
    return CREDIT_PACKAGES


# --- Razorpay ---

@router.post("/payments/razorpay/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    request: PurchaseRequest,
    current_user: dict = Depends(get_current_user),
):
    package = CREDIT_PACKAGES.get(request.package_id)
    if not package or package["currency"] != "INR":
        raise HTTPException(status_code=400, detail="Invalid package")

    amount_paise = int(package["price"] * 100)

    try:
        rz = _get_razorpay()
        order = rz.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
        })

        # Save transaction
        db = get_db()
        db.table("payment_transactions").insert({
            "user_id": current_user["id"],
            "session_id": order["id"],
            "amount": package["price"],
            "currency": "INR",
            "package_id": request.package_id,
            "credits": package["credits"],
            "status": "pending",
            "payment_status": "initiated",
            "provider": "razorpay",
        }).execute()

        return RazorpayOrderResponse(
            order_id=order["id"],
            amount=amount_paise,
            currency="INR",
            key_id=settings.RAZORPAY_KEY_ID,
        )
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Order creation failed")


@router.post("/payments/razorpay/verify")
async def verify_razorpay_payment(
    request: RazorpayVerifyRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        rz = _get_razorpay()
        rz.utility.verify_payment_signature({
            "razorpay_order_id": request.order_id,
            "razorpay_payment_id": request.payment_id,
            "razorpay_signature": request.signature,
        })

        db = get_db()

        # Find pending transaction
        txn = db.table("payment_transactions").select("*").eq(
            "session_id", request.order_id
        ).eq("user_id", current_user["id"]).neq(
            "payment_status", "paid"
        ).single().execute()

        if not txn.data:
            raise HTTPException(status_code=404, detail="Transaction not found or already processed")

        # Update transaction
        db.table("payment_transactions").update({
            "payment_id": request.payment_id,
            "status": "completed",
            "payment_status": "paid",
        }).eq("id", txn.data["id"]).execute()

        # Credit user
        current_credits = current_user["credits"]
        db.table("profiles").update({
            "credits": current_credits + txn.data["credits"],
        }).eq("id", current_user["id"]).execute()

        return {"success": True, "credits_added": txn.data["credits"]}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Razorpay verification failed: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")


# --- Stripe ---

@router.post("/payments/stripe/create-checkout", response_model=StripeCheckoutResponse)
async def create_stripe_checkout(
    request: StripeCheckoutRequest,
    current_user: dict = Depends(get_current_user),
):
    package = CREDIT_PACKAGES.get(request.package_id)
    if not package or package["currency"] != "USD":
        raise HTTPException(status_code=400, detail="Invalid package")

    try:
        session = await create_checkout_session(
            amount=package["price"],
            currency="usd",
            success_url=f"{settings.FRONTEND_URL}/purchase?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/purchase",
            metadata={
                "user_id": current_user["id"],
                "package_id": request.package_id,
                "credits": str(package["credits"]),
            },
        )

        # Save transaction
        db = get_db()
        db.table("payment_transactions").insert({
            "user_id": current_user["id"],
            "session_id": session["session_id"],
            "amount": package["price"],
            "currency": "USD",
            "package_id": request.package_id,
            "credits": package["credits"],
            "status": "pending",
            "payment_status": "initiated",
            "provider": "stripe",
        }).execute()

        return StripeCheckoutResponse(
            session_id=session["session_id"],
            url=session["url"],
        )
    except Exception as e:
        logger.error(f"Stripe checkout creation failed: {e}")
        raise HTTPException(status_code=500, detail="Checkout creation failed")


@router.get("/payments/stripe/status/{session_id}", response_model=StripeStatusResponse)
async def get_stripe_status(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        checkout_status = await get_checkout_status(session_id)

        if checkout_status["payment_status"] == "paid":
            db = get_db()
            txn = db.table("payment_transactions").select("*").eq(
                "session_id", session_id
            ).eq("user_id", current_user["id"]).neq(
                "payment_status", "paid"
            ).execute()

            if txn.data:
                txn_data = txn.data[0]
                db.table("payment_transactions").update({
                    "status": "completed",
                    "payment_status": "paid",
                }).eq("id", txn_data["id"]).execute()

                current_credits = current_user["credits"]
                db.table("profiles").update({
                    "credits": current_credits + txn_data["credits"],
                }).eq("id", current_user["id"]).execute()

        return StripeStatusResponse(**checkout_status)

    except Exception as e:
        logger.error(f"Stripe status check failed: {e}")
        raise HTTPException(status_code=500, detail="Status check failed")


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        payload = await request.body()
        sig = request.headers.get("Stripe-Signature", "")

        event = verify_webhook_signature(payload, sig)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            metadata = session.get("metadata", {})
            user_id = metadata.get("user_id")
            credits = int(metadata.get("credits", 0))

            if user_id and credits:
                db = get_db()

                # Update transaction
                db.table("payment_transactions").update({
                    "status": "completed",
                    "payment_status": "paid",
                }).eq("session_id", session["id"]).execute()

                # Credit user
                profile = db.table("profiles").select("credits").eq("id", user_id).single().execute()
                if profile.data:
                    db.table("profiles").update({
                        "credits": profile.data["credits"] + credits,
                    }).eq("id", user_id).execute()

                logger.info(f"Stripe webhook: credited {credits} to user {user_id}")

        return {"status": "received"}

    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return {"status": "error"}
