from fastapi import APIRouter, Depends
from app.services.auth import get_current_user
from app.db import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = db.table("generation_history").select("*").eq(
        "user_id", current_user["id"]
    ).order("created_at", desc=True).limit(50).execute()

    return result.data or []


@router.get("/history/stats")
async def get_history_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = db.table("generation_history").select("type, credits_used").eq(
        "user_id", current_user["id"]
    ).execute()

    rows = result.data or []
    breakdown = {}
    total_credits = 0
    for row in rows:
        t = row.get("type", "unknown")
        c = row.get("credits_used", 0)
        breakdown[t] = breakdown.get(t, 0) + 1
        total_credits += c

    most_used = max(breakdown, key=breakdown.get) if breakdown else None

    return {
        "total_generations": len(rows),
        "total_credits_used": total_credits,
        "breakdown": breakdown,
        "most_used_tool": most_used,
    }
