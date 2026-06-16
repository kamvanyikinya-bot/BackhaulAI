#!/bin/bash
# Production start script for BackhaulAI Intelligence Layer
# Usage: bash start.sh

echo "Starting BackhaulAI Intelligence Layer..."
cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start with gunicorn + uvicorn workers
exec gunicorn api:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:${PORT:-8004} \
    --workers ${WEB_CONCURRENCY:-2} \
    --max-requests 1000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -