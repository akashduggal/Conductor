from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.config import settings


def _normalize_asyncpg_url(url: str) -> str:
    """For postgresql+asyncpg, asyncpg expects ssl= not sslmode= (sslmode causes TypeError)."""
    if "postgresql+asyncpg" not in url:
        return url
    parsed = urlparse(url)
    if not parsed.query:
        return url
    qs = parse_qs(parsed.query, keep_blank_values=True)
    if "sslmode" not in qs:
        return url
    # Replace sslmode with ssl for asyncpg
    qs["ssl"] = qs.pop("sslmode")
    new_query = urlencode(qs, doseq=True)
    return urlunparse(parsed._replace(query=new_query))


# NullPool: no connection pooling — required for serverless (Vercel) to avoid "Device or resource busy"
_engine_kw: dict = {"echo": False, "future": True}
if "postgresql+asyncpg" in settings.database_url:
    _engine_kw["poolclass"] = NullPool

engine = create_async_engine(
    _normalize_asyncpg_url(settings.database_url),
    **_engine_kw,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
