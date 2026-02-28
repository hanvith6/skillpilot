"""Supabase client helper functions for database operations."""
from supabase import Client
from app.db import get_db


def get_supabase() -> Client:
    """Get the Supabase client instance."""
    return get_db()
