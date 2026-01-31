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
        url = settings.supabase_url or ""
        key = settings.supabase_service_key or ""
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. "
                "On Vercel: Settings → Environment Variables → add both for Production, then Redeploy."
            )
        _client = create_client(url, key)
    return _client
