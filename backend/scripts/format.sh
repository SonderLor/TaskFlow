#!/bin/bash

# Проверяем наличие инструментов форматирования
if ! poetry run black --version > /dev/null 2>&1; then
  echo "Error: black not found. Installing dev dependencies..."
  poetry install --with dev
fi

if ! poetry run isort --version > /dev/null 2>&1; then
  echo "Error: isort not found. Installing dev dependencies..."
  poetry install --with dev
fi

if ! poetry run ruff --version > /dev/null 2>&1; then
  echo "Error: ruff not found. Installing dev dependencies..."
  poetry install --with dev
fi

# Форматирование кода с исключениями
echo "Running black..."
poetry run black . --exclude "__init__.py"

echo "Running isort..."
poetry run isort .

echo "Running ruff..."
poetry run ruff check --fix .

echo "Code formatting completed"
