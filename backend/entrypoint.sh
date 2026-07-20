#!/bin/bash
set -e
python manage.py makemigrations tests_app --noinput || true
python manage.py migrate --noinput
python manage.py collectstatic --noinput 2>/dev/null || true
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
