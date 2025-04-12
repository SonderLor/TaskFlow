FROM python:3.11-slim

WORKDIR /app

# Установка Poetry
RUN pip install --upgrade pip && \
    pip install poetry==2.1.2

# Копирование только файлов зависимостей для кэширования слоя
COPY pyproject.toml poetry.lock* ./

# Установка зависимостей через Poetry
RUN poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction --no-ansi --only main

# Копирование остальных файлов проекта
COPY . .

# Запуск миграций и приложения через Poetry
CMD ["sh", "-c", "poetry run alembic upgrade head && poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]