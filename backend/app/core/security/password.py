from passlib.context import CryptContext

# Контекст для хэширования и проверки паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет соответствие простого пароля хэшу"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Создает хэш из пароля"""
    return pwd_context.hash(password)
