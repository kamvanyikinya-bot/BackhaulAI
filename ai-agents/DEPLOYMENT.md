# BackhaulAI Intelligence Layer — Deployment Guide

## Service Status

**Running on:** Port 8004 (inside sandbox)
**Health check:** `GET /health` → `{"status": "ok", "service": "backhaulai-intelligence", "version": "1.1.0"}`

## Project Structure

```
/home/team/shared/ai-agents/
├── api.py               # FastAPI microservice (all endpoints)
├── core/models.py       # Data models (Location, Load, Truck, etc.)
├── requirements.txt     # Pinned Python dependencies
├── Dockerfile           # Production Docker image
├── Procfile             # Heroku/Railway process definition
├── start.sh             # Production start script
├── venv/                # Python virtual environment (installed)
└── README.md            # Full documentation
```

## Deployment Options

### Option 1: Local (already running)
```bash
cd /home/team/shared/ai-agents
source venv/bin/activate
uvicorn api:app --host 0.0.0.0 --port 8004
```
Service accessible at `http://<sandbox-hostname>:8004`

### Option 2: Docker
```bash
cd /home/team/shared/ai-agents
docker build -t backhaulai-intelligence .
docker run -p 8004:8004 backhaulai-intelligence
```

### Option 3: Railway / Fly.io
- `Procfile` configured for `gunicorn + uvicorn`
- Point to `api:app` as the WSGI application
- Set `PORT` environment variable (default: 8004)
- Railway auto-detects `requirements.txt` and `Procfile`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| GET | `/corridors` | List all SA transport corridors |
| GET | `/match/return-trips?destination=X` | ⭐ Find return loads from city X |
| POST | `/discover/opportunities` | ⭐ Find ALL opportunities near location |
| POST | `/route-optimiser/round-trip` | Optimal round-trip with profit analysis |
| POST | `/pricing/suggest` | Market pricing with range + profit |
| POST | `/pricing/profit-margin` | Cost breakdown + profit margin |
| POST | `/matching/find-best` | Best truck match with score + reason |
| GET | `/demand/predict` | Predict load demand on corridor |
| GET | `/agent/marketplace/corridors` | All corridor market snapshots |
| | **Phase 3: Trust & Monetisation** | |
| GET | `/kyc/status/{user_id}` | Get KYC verification status |
| POST | `/kyc/submit` | Submit KYC documents (ID, selfie, address) |
| POST | `/kyc/verify` | Approve/reject KYC (admin) |
| GET | `/subscription/plans` | List subscription plans (Free/Starter/Pro/Enterprise) |
| GET | `/subscription/status/{user_id}` | Get user's subscription status |
| POST | `/subscription/upgrade` | Upgrade to a plan (Free→Pro, etc.) |
| POST | `/subscription/cancel` | Cancel active subscription |
| GET | `/reputation/{user_id}` | Get reputation score (0-100) + level |
| POST | `/reputation/update` | Update reputation from trip data |
| WS | `/ws/gps/{trip_id}` | ⭐ Real-time GPS tracking WebSocket |
| GET | `/gps/latest/{trip_id}` | Latest GPS position (REST fallback) |

## Example Requests

### Return Trip Discovery (flagship feature)
```bash
curl "http://localhost:8004/match/return-trips?destination=Johannesburg"
```

### Price a Load
```bash
curl -X POST http://localhost:8004/pricing/suggest \
  -H "Content-Type: application/json" \
  -d '{"id":"l1","origin":{"lat":-29.86,"lng":31.02,"name":"Durban","region":"KZN"},"destination":{"lat":-26.2,"lng":28.05,"name":"Johannesburg","region":"Gauteng"},"weight_tonnes":10,"volume_m3":30,"type":"general","pickup_date":"2025-01-01","delivery_date":"2025-01-02","offered_price":8500}'
```

### Discover Opportunities
```bash
curl -X POST http://localhost:8004/discover/opportunities \
  -H "Content-Type: application/json" \
  -d '{"lat":-29.86,"lng":31.02,"location_name":"Durban","radius_km":200,"limit":5}'
```

### KYC Verification
```bash
# Submit KYC
curl -X POST http://localhost:8004/kyc/submit \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001","id_number":"8001015009087","selfie_url":"https://example.com/selfie.jpg"}'

# Check status
curl http://localhost:8004/kyc/status/user_001

# Approve (admin)
curl -X POST http://localhost:8004/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001","approve":true}'
```

### Subscriptions
```bash
# List plans
curl http://localhost:8004/subscription/plans

# Upgrade user to Pro
curl -X POST http://localhost:8004/subscription/upgrade \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001","plan_id":"pro"}'

# Check subscription status
curl http://localhost:8004/subscription/status/user_001

# Cancel subscription
curl -X POST http://localhost:8004/subscription/cancel \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001"}'
```

### Reputation Scoring
```bash
# Get reputation
curl http://localhost:8004/reputation/user_001

# Update from trip data
curl -X POST http://localhost:8004/reputation/update \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user_001","trips_completed":25,"avg_rating":4.5,"on_time_delivery_pct":92,"response_rate":95,"positive_reviews":22,"negative_reviews":3}'
```

### GPS Tracking (WebSocket)
```python
import asyncio, json
import websockets

async def track():
    async with websockets.connect("ws://localhost:8004/ws/gps/trip_001") as ws:
        # Receive connection confirmation
        msg = await ws.recv()
        print(json.loads(msg))
        # Send location update
        await ws.send(json.dumps({"type": "location_update", "lat": -29.86, "lng": 31.02, "speed": 65}))
        # Receive broadcast
        msg = await ws.recv()
        print(json.loads(msg))

asyncio.run(track())
```

## Backend/Frontend Integration

The backend team (`agent-backend-api-engineer`) can call these endpoints from their Node.js/Python service:

```python
import requests
BASE = "http://localhost:8004"

# Get return trips
resp = requests.get(f"{BASE}/match/return-trips", params={"destination": "Johannesburg"})
print(resp.json())
```

The frontend team (`agent-frontend-engineer`) can use the API for:
- Route selection dropdowns (from `/corridors`)
- Pricing widgets (from `/pricing/suggest`)
- Opportunity maps (from `/discover/opportunities`)
- Return trip recommendations (from `/match/return-trips`)
- Marketplace dashboards (from `/agent/marketplace/corridors`)