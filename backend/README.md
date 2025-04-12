# TaskFlow Backend

FastAPI сервер для приложения TaskFlow.

## Используемые технологии

- FastAPI - современный фреймворк для разработки API
- SQLAlchemy 2.0 - ORM для работы с базой данных
- Alembic - инструмент для миграций базы данных
- Poetry - управление зависимостями и виртуальными окружениями
- PostgreSQL - реляционная база данных
- AsyncPG - асинхронный драйвер для PostgreSQL

## Настройка локальной разработки

### Требования

- Python 3.11+
- Poetry
- PostgreSQL

### Установка Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

### Установка зависимостей

```bash
cd backend
./scripts/install.sh
```

Или вручную:

```bash
poetry install
```

### Настройка .env

Создайте файл .env на основе .env.example:

```bash
cp .env.example .env
```

## Миграции

### Создание новой миграции

```bash
./scripts/create_migration.sh "Описание миграции"
```

### Применение миграций

```bash
./scripts/migrate.sh
```

## Запуск приложения

```bash
poetry run uvicorn app.main:app --reload
```

## Тестирование

```bash
./scripts/test.sh
```

## Форматирование кода

```bash
./scripts/format.sh
```

## Документация API

После запуска приложения, документация API доступна по адресу:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
