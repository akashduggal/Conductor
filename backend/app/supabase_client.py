"""
Supabase client for the ML Dashboard.
Uses SUPABASE_URL and SUPABASE_SERVICE_KEY from config (service role for full DB access).
"""
from supabase import create_client, Client
from app.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    """Return the Supabase client (singleton)."""
    global _client
    if _client is None:
        _client = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return _client
