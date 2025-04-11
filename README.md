# TaskFlow

TaskFlow — это клиент-серверное приложение для отслеживания совместной работы над бизнес-задачами. 
Аналог упрощенного трекера задач.

## Технологический стек

- **Фронтенд**: React
- **Бэкенд**: FastAPI (Python)
- **База данных**: PostgreSQL
- **Инфраструктура**: Docker, Docker Compose, Nginx

## Основные возможности

- Создание и управление задачами
- Назначение исполнителей
- Добавление наблюдателей
- Комментирование задач в реальном времени через WebSockets
- Изменение статусов
- Управление пользователями

## Запуск проекта

### Требования

- Docker и Docker Compose
- Git

### Подготовка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/SonderLor/TaskFlow.git
   cd TaskFlow
   ```

2. Создайте файл .env на основе примера:
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл с вашими настройками
   ```

### Запуск

Используйте скрипт запуска:
```bash
./infra/start.sh
```

После запуска:
- Фронтенд будет доступен по адресу: http://localhost (порт настраивается в .env)
- API документация: http://localhost/api/docs
- PGAdmin: http://localhost:5050 (порт настраивается в .env)

### Остановка

Для остановки сервисов:
```bash
./infra/stop.sh
```

## Структура проекта

- `/frontend` - React приложение
- `/backend` - FastAPI сервер
- `/infra` - Файлы инфраструктуры (docker-compose, nginx и т.д.)

## Разработка

### Фронтенд

```bash
cd frontend
npm install
npm run dev
```

### Бэкенд

```bash
cd backend
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Лицензия

[MIT](LICENSE)
