from fastapi import Request, HTTPException
from app.db import get_db, get_auth_client
import logging
import asyncio

logger = logging.getLogger(__name__)


async def get_current_user(request: Request) -> dict:
    """Verify Supabase JWT and return user profile."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.split(" ")[1]

    try:
        # Use anon client for auth verification (doesn't pollute service client state)
        auth_client = get_auth_client()
        user_response = auth_client.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = str(user_response.user.id)

        # Use service client for data operations (bypasses RLS)
        db = get_db()

        # Retry profile fetch — the DB trigger may not have completed yet
        # on brand-new signups
        profile_data = None
        for attempt in range(3):
            result = db.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
            if result.data:
                profile_data = result.data
                break
            if attempt < 2:
                await asyncio.sleep(0.5)

        if not profile_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        return profile_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
