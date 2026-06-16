# BackhaulAI — Logistics Intelligence Platform 🚛⚡

**Never send a truck empty again.**

## 🎯 Quick Deploy

### Option A: Deploy to Vercel + Railway (recommended — 5 min)

```bash
# Frontend
cd frontend
npx vercel --prod
# → get URL: https://backhaulai-xxx.vercel.app
# → DNS CNAME: cname.vercel-dns.com

# Backend
cd ../backend
npx railway up
# → URL: https://backhaul-api.up.railway.app

# AI Agents
cd ../ai-agents
pip install -r requirements.txt
npx railway up
# → URL: https://backhaul-ai.up.railway.app
```

### Option B: Unified Server (deploy as one service)

```bash
cd /home/team/shared
npm install
node production-server.js
# → Runs on port 8080 with frontend + API + AI proxy
```

## ✅ What's Built

| Layer | Tech | What it does |
|-------|------|-------------|
| 🖥️ **Frontend** | React + Vite + Tailwind + Leaflet | Landing, Dashboard, ReturnTripFinder⭐, AIDiscover, ExecutionCenter, Auth, Profile, Onboarding |
| 🔧 **Backend** | Node.js + Express + TypeScript | Auth API, Loads/Trucks CRUD, Return Trip Matching⭐, Profit Intelligence, Stats |
| 🧠 **AI Agents** | Python + FastAPI (61/61 tests) | B2C/B2B Acquisition, Marketplace Intel, Conversion Optimisation, Return Trip Intel, Pricing Engine, Demand Prediction |
| 📍 **Services** | Port 3000 (backend), 8004 (AI), 5173 (frontend dev) | All verified and health-check passing |

## 📋 Current Status

```
Frontend:  ✅ Built + dev server at localhost:5173
Backend:   ✅ Running at localhost:3000/health
AI Agents: ✅ Running at localhost:8004/health
Unified:   ✅ production-server.js ready
```

## 🔗 DNS Setup (when deployed)

``` 
Type: CNAME
Name: backhaulai
Target: [URL from Vercel/Railway]
TTL: 3600
```

## 🧪 Test the APIs

```bash
# Backend health
curl http://localhost:3000/health

# AI agents health
curl http://localhost:8004/health

# Return trip matching (core feature!)
curl "http://localhost:8004/match/return-trips?destination=Johannesburg&truck_type=flatbed"

# All corridors
curl http://localhost:8004/corridors
```

## 🚛 Core Features

1. **Return Trip Finder** ⭐ — Match loads before departure with profit impact
2. **AI Discover** — "Find opportunities for me" mode
3. **Profit Dashboard** — Empty miles reduced, savings, utilisation rate
4. **Execution Center** — Live GPS tracking with timeline
5. **Fast Onboarding** — Set up in <60 seconds
6. **KYC & Trust** — Verified users, reputation scoring