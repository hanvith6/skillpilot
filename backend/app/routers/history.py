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
