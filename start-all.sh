#!/bin/bash
# Start all BackhaulAI services
exec > /tmp/startup.log 2>&1
set -x

echo "=== Starting BackhaulAI ==="
date

# Start backend
cd /home/team/shared/backend
npx tsx src/index.ts &
echo "Backend PID: $!"

# Start AI agents
cd /home/team/shared/ai-agents
source venv/bin/activate
uvicorn api:app --host 0.0.0.0 --port 8004 &
echo "AI PID: $!"

# Start unified server
cd /home/team/shared
npm install > /dev/null 2>&1
node production-server.js &
echo "Unified PID: $!"

echo "=== All services started ==="
wait