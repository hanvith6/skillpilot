from supabase import create_client, Client
from app.config import settings

_service_client: Client = None
_anon_client: Client = None


def get_db() -> Client:
    """Get Supabase client with service role key (bypasses RLS). Use for all data operations."""
    global _service_client
    if _service_client is None:
        _service_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    return _service_client


def get_auth_client() -> Client:
    """Get Supabase client with anon key. Use for auth operations (signup, login, token verification)."""
    global _anon_client
    if _anon_client is None:
        _anon_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
    return _anon_client
