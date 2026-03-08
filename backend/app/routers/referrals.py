from fastapi import APIRouter, Depends
from app.services.auth import get_current_user
from app.db import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/referrals", tags=["referrals"])


@router.get("/stats")
async def get_referral_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()

    recent = db.table("referrals").select("*").eq(
        "referrer_id", current_user["id"]
    ).order("created_at", desc=True).limit(10).execute()

    return {
        "referral_code": current_user.get("referral_code", ""),
        "total_referrals": current_user.get("total_referrals", 0),
        "credits_earned": current_user.get("referral_credits_earned", 0),
        "recent_referrals": recent.data or [],
    }
