# TaskFlow Backend

FastAPI сервер для приложения TaskFlow.

## Локальный запуск

1. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   source venv/bin/activate  # или venv\Scripts\activate на Windows
   ```

2. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

3. Запустите сервер разработки:
   ```bash
   uvicorn app.main:app --reload
   ```

4. API документация доступна по адресу http://localhost:8000/docs
