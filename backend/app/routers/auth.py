from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from app.db import get_db, get_auth_client
from app.services.auth import get_current_user
from app.models.user import UserSignup, UserLogin, Profile, ReferralStats
from app.config import settings
import logging
import uuid
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup")
async def signup(user_data: UserSignup):
    db = get_db()
    auth_client = get_auth_client()

    # Check if email exists
    existing = db.table("profiles").select("id").eq("email", user_data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Sign up via Supabase Auth (use anon client to avoid polluting service client)
    try:
        auth_response = auth_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {"name": user_data.name}
            }
        })
    except Exception as e:
        logger.error(f"Supabase signup error: {e}")
        raise HTTPException(status_code=400, detail="Signup failed")

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    user_id = str(auth_response.user.id)

    # Handle referral code
    bonus_credits = 0
    if user_data.referral_code:
        referrer = db.table("profiles").select("id").eq(
            "referral_code", user_data.referral_code.upper()
        ).execute()

        if referrer.data:
            referrer_id = referrer.data[0]["id"]
            bonus_credits = 20

            # Award referrer 50 credits
            referrer_profile = db.table("profiles").select("credits, total_referrals, referral_credits_earned").eq(
                "id", referrer_id
            ).single().execute()

            if referrer_profile.data:
                db.table("profiles").update({
                    "credits": referrer_profile.data["credits"] + 50,
                    "total_referrals": referrer_profile.data["total_referrals"] + 1,
                    "referral_credits_earned": referrer_profile.data["referral_credits_earned"] + 50,
                }).eq("id", referrer_id).execute()

            # Log referral
            db.table("referrals").insert({
                "referrer_id": referrer_id,
                "referred_user_id": user_id,
                "referred_user_name": user_data.name,
                "referral_code": user_data.referral_code.upper(),
                "credits_awarded": 50,
            }).execute()

            # Update new user's referral info
            db.table("profiles").update({
                "referred_by": referrer_id,
                "credits": 100 + bonus_credits,
            }).eq("id", user_id).execute()

    # If bonus credits but profile wasn't updated above (no referrer found)
    if bonus_credits > 0:
        pass  # Already handled above

    # Get the profile
    profile = db.table("profiles").select("*").eq("id", user_id).single().execute()

    token = auth_response.session.access_token if auth_response.session else ""

    return {
        "token": token,
        "user": profile.data,
    }


@router.post("/login")
async def login(credentials: UserLogin):
    db = get_db()
    auth_client = get_auth_client()

    try:
        auth_response = auth_client.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(auth_response.user.id)
    profile = db.table("profiles").select("*").eq("id", user_id).single().execute()

    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "token": auth_response.session.access_token,
        "user": profile.data,
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/apply-referral")
async def apply_referral(request: Request, current_user: dict = Depends(get_current_user)):
    body = await request.json()
    referral_code = body.get("referral_code", "").strip().upper()

    if not referral_code:
        raise HTTPException(status_code=400, detail="Referral code is required")

    db = get_db()
    user_id = current_user["id"]

    # Check if user already used a referral
    if current_user.get("referred_by"):
        raise HTTPException(status_code=400, detail="Referral already applied")

    # Find referrer
    referrer = db.table("profiles").select("id, credits, total_referrals, referral_credits_earned").eq(
        "referral_code", referral_code
    ).maybe_single().execute()

    if not referrer.data:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    referrer_id = referrer.data["id"]

    # Can't refer yourself
    if referrer_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot use your own referral code")

    # Award referrer 50 credits
    db.table("profiles").update({
        "credits": referrer.data["credits"] + 50,
        "total_referrals": referrer.data["total_referrals"] + 1,
        "referral_credits_earned": referrer.data["referral_credits_earned"] + 50,
    }).eq("id", referrer_id).execute()

    # Award referred user 20 bonus credits
    db.table("profiles").update({
        "referred_by": referrer_id,
        "credits": current_user["credits"] + 20,
    }).eq("id", user_id).execute()

    # Log referral
    db.table("referrals").insert({
        "referrer_id": referrer_id,
        "referred_user_id": user_id,
        "referred_user_name": current_user.get("name", ""),
        "referral_code": referral_code,
        "credits_awarded": 50,
    }).execute()

    return {"success": True, "bonus_credits": 20}


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    # Supabase handles token invalidation client-side
    return {"success": True}
