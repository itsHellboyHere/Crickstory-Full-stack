# Dockerfile
FROM python:3.11-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PYTHONPATH=/app

CMD ["bash", "-c", "python manage.py migrate && daphne --verbosity 2 --access-log - --proxy-headers -b 0.0.0.0 -p 8000 crickstory.asgi:application"]
