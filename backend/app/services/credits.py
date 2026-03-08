import logging
from app.db import get_db

logger = logging.getLogger(__name__)

CREDIT_COSTS = {
    "resume": 5,
    "project": 8,
    "english": 2,
    "interview": 3,
}


def calculate_credits_needed(tool_type: str, emergent_mode: bool) -> int:
    base_cost = CREDIT_COSTS[tool_type]
    if emergent_mode:
        return int(base_cost * 1.3 + 0.5)  # round to nearest
    return base_cost


async def deduct_credits(user_id: str, amount: int) -> int:
    """Atomically deduct credits using Supabase RPC. Returns new balance."""
    db = get_db()
    result = db.rpc("deduct_credits", {"p_user_id": user_id, "p_amount": amount}).execute()
    return result.data


async def save_generation(user_id: str, gen_type: str, title: str, content: dict, credits_needed: int) -> str:
    """Deduct credits and save generation to history. Returns history ID."""
    import uuid

    await deduct_credits(user_id, credits_needed)

    history_id = str(uuid.uuid4())
    db = get_db()
    db.table("generation_history").insert({
        "id": history_id,
        "user_id": user_id,
        "type": gen_type,
        "title": title,
        "content": content,
        "credits_used": credits_needed,
    }).execute()

    return history_id
