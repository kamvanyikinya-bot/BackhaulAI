#!/bin/bash
# =============================================================
# BackhaulAI — ONE-COMMAND PRODUCTION DEPLOY
# =============================================================
# Run this on your own machine with Node.js installed.
# Deploys frontend + backend + AI agents in one shot.
# =============================================================

set -e

echo "🚀 BackhaulAI Production Deploy"
echo "================================"

# 1. Install deps for unified server
echo "📦 Installing production server deps..."
cd /home/team/shared
npm install

# 2. Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm install
npx vite build
cd ..

# 3. Install backend deps
echo "🔧 Installing backend deps..."
cd backend
npm install
cd ..

# 4. Start everything
echo "🌐 Starting BackhaulAI on port 8080..."
BACKEND_URL=http://localhost:3000 \
AI_URL=http://localhost:8004 \
PORT=8080 \
node production-server.js &
SERVER_PID=$!

# Start backend
cd backend && npx tsx src/index.ts &
BACKEND_PID=$!

# Start AI agents
cd ../ai-agents && source venv/bin/activate && uvicorn api:app --host 0.0.0.0 --port 8004 &
AI_PID=$!

echo ""
echo "✅ BackhaulAI is running!"
echo "   Frontend + API:  http://localhost:8080"
echo "   Backend health:  http://localhost:3000/health"
echo "   AI agents:       http://localhost:8004/health"
echo ""
echo "📋 To deploy to production:"
echo "   Frontend:  cd frontend && npx vercel --prod"
echo "   Backend:   cd backend && npx railway up"
echo "   AI Agents: cd ai-agents && npx railway up"
echo ""
echo "   Or just deploy the unified server to Railway:"
echo "   npx railway up  (from /home/team/shared)"
echo ""
echo "⏹️  To stop: kill $SERVER_PID $BACKEND_PID $AI_PID"