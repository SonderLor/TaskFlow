#!/bin/bash

# Создаем начальную миграцию
alembic revision --autogenerate -m "Initial migration"

echo "Initial migration created successfully"
