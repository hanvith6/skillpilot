import stripe as stripe_lib
import logging
from app.config import settings

logger = logging.getLogger(__name__)


def _init_stripe():
    stripe_lib.api_key = settings.STRIPE_SECRET_KEY


async def create_checkout_session(
    amount: float,
    currency: str,
    success_url: str,
    cancel_url: str,
    metadata: dict,
) -> dict:
    """Create a Stripe Checkout Session."""
    _init_stripe()
    session = stripe_lib.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": currency.lower(),
                "product_data": {
                    "name": f"SkillPilot Credits ({metadata.get('credits', '')})",
                    "description": f"Package: {metadata.get('package_id', '')}",
                },
                "unit_amount": int(amount * 100),
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    return {"session_id": session.id, "url": session.url}


async def get_checkout_status(session_id: str) -> dict:
    """Get status of a Checkout Session."""
    _init_stripe()
    session = stripe_lib.checkout.Session.retrieve(session_id)
    return {
        "session_id": session.id,
        "payment_status": session.payment_status,
        "status": session.status,
    }


def verify_webhook_signature(payload: bytes, sig_header: str) -> dict:
    """Verify and parse a Stripe webhook event."""
    _init_stripe()
    event = stripe_lib.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )
    return event
