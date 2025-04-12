from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# Создаем асинхронный движок SQLAlchemy
engine = create_async_engine(
    settings.DATABASE_URI,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

# Создаем асинхронную фабрику сессий
AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)


async def get_db() -> AsyncSession:
    """
    Зависимость для получения сессии базы данных
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
