FROM python:3.11-slim

WORKDIR /app

# Установка Poetry
RUN pip install poetry==1.6.1

# Копирование только файлов зависимостей для кэширования слоя
COPY pyproject.toml poetry.lock* ./

# Настройка Poetry: не создавать виртуальное окружение внутри контейнера
RUN poetry config virtualenvs.create false

# Установка зависимостей
RUN poetry install --no-interaction --no-ansi --no-root

# Копирование остальных файлов проекта
COPY . .

# Запуск миграций и приложения
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
