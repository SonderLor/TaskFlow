#!/bin/bash

# Создание новой миграции
if [ -z "$1" ]; then
  echo "Usage: $0 \"Migration message\""
  exit 1
fi

poetry run alembic revision --autogenerate -m "$1"

echo "Migration created: $1"
