#!/bin/bash

# Проверка наличия параметров
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  <empty>       Apply all pending migrations (equivalent to 'alembic upgrade head')"
  echo "  -1, --one     Apply only the next pending migration (equivalent to 'alembic upgrade +1')"
  echo "  -h, --help    Show this help message"
  echo "  revision      Apply migration to the specified revision"
  echo ""
  echo "Examples:"
  echo "  $0            # Apply all pending migrations"
  echo "  $0 -1         # Apply only the next pending migration"
  echo "  $0 abc123     # Apply migrations to revision abc123"
  exit 0
fi

# Запуск миграций
if [ -z "$1" ]; then
  echo "Applying all pending migrations..."
  poetry run alembic upgrade head
elif [ "$1" = "-1" ] || [ "$1" = "--one" ]; then
  echo "Applying only the next migration..."
  poetry run alembic upgrade +1
else
  echo "Applying migrations to revision $1..."
  poetry run alembic upgrade "$1"
fi

# Показываем текущую версию базы данных
echo ""
echo "Current database version:"
poetry run alembic current

echo "Migration completed"
