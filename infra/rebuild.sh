#!/bin/bash

# Переходим в директорию infra
cd "$(dirname "$0")"

# Загружаем переменные окружения
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo "File .env not found!"
    exit 1
fi

# Полная остановка и удаление контейнеров
echo "Stopping and removing containers..."
docker-compose down --volumes --remove-orphans

# Удаление кеша сборки
echo "Removing build cache..."
docker builder prune -f

# Пересобираем и запускаем контейнеры с флагом --no-cache
echo "Rebuilding containers from scratch..."
docker-compose build --no-cache
docker-compose up -d

echo "TaskFlow services rebuilt and started successfully"
echo "Access the application at http://localhost:${NGINX_PORT}"
echo "Access PGAdmin at http://localhost:${PGADMIN_PORT}"
echo "API documentation available at http://localhost:${NGINX_PORT}/api/docs"
