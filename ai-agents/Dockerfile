# BackhaulAI Intelligence Layer — Production Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api.py .
COPY core/ core/

# Expose port
EXPOSE 8004

# Production start: Gunicorn with Uvicorn workers
CMD ["gunicorn", "api:app", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8004", "--workers", "4", "--max-requests", "1000", "--timeout", "120"]