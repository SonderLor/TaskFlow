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

# Останавливаем предыдущие контейнеры, если они запущены
echo "Stopping existing containers..."
docker-compose down

# Пересобираем и запускаем контейнеры с флагом --build
echo "Rebuilding and starting containers..."
docker-compose up -d --build

echo "TaskFlow services started successfully"
echo "Access the application at http://localhost:${NGINX_PORT}"
echo "Access PGAdmin at http://localhost:${PGADMIN_PORT}"
echo "API documentation available at http://localhost:${NGINX_PORT}/api/docs"
