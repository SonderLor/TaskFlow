#!/bin/bash

# Переходим в директорию infra
cd "$(dirname "$0")"

# Останавливаем контейнеры и удаляем неиспользуемые сети
docker-compose down --remove-orphans

echo "TaskFlow services stopped successfully"
