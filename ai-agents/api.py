"""AI-powered logistics intelligence layer for BackhaulAI.

Eliminates empty return trips through intelligent load matching 
and return-trip optimisation. Production FastAPI microservice.
"""

from typing import Dict, List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query, Body, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import math
import random
import json


# ──────────────────────────────────────────────
# Inline data models & helpers
# ──────────────────────────────────────────────

SA_CORRIDORS = {}
_HERE = __import__("os").path.dirname(__file__)
from dataclasses import dataclass, field

@dataclass
class Location:
    lat: float; lng: float; name: str; region: str = ""

@dataclass
class Corridor:
    origin: Location; destination: Location; distance_km: float; avg_duration_hours: float
    @property
    def name(self): return f"{self.origin.name} ↔ {self.destination.name}"
    @property
    def reverse(self): return Corridor(self.destination, self.origin, self.distance_km, self.avg_duration_hours)

@dataclass
class Load:
    id: str; origin: Location; destination: Location; weight_tonnes: float
    volume_m3: float; type: str; pickup_date: datetime; delivery_date: datetime
    offered_price: float; status: str = "available"; shipper_id: Optional[str] = None

@dataclass
class Truck:
    id: str; capacity_tonnes: float; capacity_m3: float; type: str
    current_location: Location; available_date: datetime; owner_id: Optional[str] = None

# SA transport corridors
_cities = {
    "Durban": Location(-29.8587, 31.0218, "Durban", "KZN"),
    "Johannesburg": Location(-26.2041, 28.0473, "Johannesburg", "Gauteng"),
    "Cape Town": Location(-33.9249, 18.4241, "Cape Town", "Western Cape"),
    "Port Elizabeth": Location(-33.9608, 25.6022, "Port Elizabeth", "Eastern Cape"),
    "Nelspruit": Location(-25.4745, 30.9703, "Nelspruit", "Mpumalanga"),
}
_routes = [
    ("Durban", "Johannesburg", 570, 5.5), ("Johannesburg", "Durban", 570, 5.5),
    ("Cape Town", "Johannesburg", 1400, 14), ("Johannesburg", "Cape Town", 1400, 14),
    ("Johannesburg", "Port Elizabeth", 1050, 11), ("Port Elizabeth", "Johannesburg", 1050, 11),
    ("Durban", "Cape Town", 1650, 17), ("Cape Town", "Durban", 1650, 17),
    ("Johannesburg", "Nelspruit", 330, 3.5), ("Nelspruit", "Johannesburg", 330, 3.5),
]
for o, d, dist, dur in _routes:
    SA_CORRIDORS[(o, d)] = Corridor(_cities[o], _cities[d], float(dist), dur)

def haversine(lat1, lng1, lat2, lng2):
    R = 6371; dlat = math.radians(lat2-lat1); dlng = math.radians(lng2-lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def travel_cost(distance_km: float, weight_t: float = 1.0) -> float:
    return distance_km * (12.0 + 0.30 * weight_t)

def get_corridor(origin: str, dest: str) -> Optional[Corridor]:
    k = (origin, dest)
    if k in SA_CORRIDORS: return SA_CORRIDORS[k]
    rk = (dest, origin)
    if rk in SA_CORRIDORS: return SA_CORRIDORS[rk].reverse
    return None

# Market pricing data
MARKET_PRICES = {
    ("Durban", "Johannesburg"): {"low": 6200, "median": 8500, "high": 11500, "samples": 1240},
    ("Johannesburg", "Durban"): {"low": 5800, "median": 8000, "high": 11000, "samples": 1180},
    ("Cape Town", "Johannesburg"): {"low": 14000, "median": 18000, "high": 25000, "samples": 680},
    ("Johannesburg", "Cape Town"): {"low": 13500, "median": 17500, "high": 24000, "samples": 720},
}

# Backhaul corridor data
BACKHAUL_HUBS = {
    "Johannesburg": [("Durban", 8000, "very_high"), ("Cape Town", 17500, "high"), ("Port Elizabeth", 13500, "medium"), ("Nelspruit", 5200, "high")],
    "Durban": [("Johannesburg", 8500, "very_high"), ("Cape Town", 21000, "medium")],
    "Cape Town": [("Johannesburg", 18000, "very_high"), ("Durban", 22000, "medium")],
    "Port Elizabeth": [("Johannesburg", 14000, "high")],
    "Nelspruit": [("Johannesburg", 5500, "very_high")],
}

# ──────────────────────────────────────────────
# Core engine
# ──────────────────────────────────────────────

class RouteOptimiser:
    def find_round_trip(self, outbound: Load, trucks: List[Truck], return_loads: List[Load]) -> Optional[Dict]:
        for truck in trucks:
            if outbound.weight_tonnes > truck.capacity_tonnes: continue
            dist_pickup = haversine(truck.current_location.lat, truck.current_location.lng, outbound.origin.lat, outbound.origin.lng)
            fwd_km = haversine(outbound.origin.lat, outbound.origin.lng, outbound.destination.lat, outbound.destination.lng)
            fwd_cost = travel_cost(dist_pickup + fwd_km, outbound.weight_tonnes)
            fwd_profit = outbound.offered_price - fwd_cost
            one_way_empty = fwd_km
            one_way_cost = travel_cost(dist_pickup + fwd_km + one_way_empty, outbound.weight_tonnes)
            one_way_profit = outbound.offered_price - one_way_cost
            
            result = {
                "forward_leg": {"origin": outbound.origin.name, "destination": outbound.destination.name,
                    "distance_km": round(fwd_km,1), "revenue_zar": outbound.offered_price, "cost_zar": round(fwd_cost,2), "profit_zar": round(fwd_profit,2)},
                "positioning_km": round(dist_pickup,1),
                "return_options": [],
                "one_way_baseline": {"total_km": round(dist_pickup+fwd_km+one_way_empty,1), "empty_km": round(one_way_empty,1),
                    "total_profit_zar": round(one_way_profit,2)}
            }
            for rl in return_loads:
                if rl.weight_tonnes > truck.capacity_tonnes: continue
                d = haversine(rl.origin.lat, rl.origin.lng, outbound.destination.lat, outbound.destination.lng)
                if d > 50: continue
                ret_km = haversine(rl.origin.lat, rl.origin.lng, rl.destination.lat, rl.destination.lng)
                ret_cost = travel_cost(ret_km, rl.weight_tonnes)
                ret_profit = rl.offered_price - ret_cost
                total_rev = outbound.offered_price + rl.offered_price
                total_cost = fwd_cost + ret_cost
                total_profit = total_rev - total_cost
                result["return_options"].append({"load_id": rl.id, "origin": rl.origin.name, "destination": rl.destination.name,
                    "distance_km": round(ret_km,1), "revenue_zar": rl.offered_price, "profit_zar": round(ret_profit,2)})
                result["round_trip"] = {"total_distance_km": round(dist_pickup+fwd_km+ret_km,1), "loaded_km": round(fwd_km+ret_km,1),
                    "empty_km": round(dist_pickup,1), "total_revenue_zar": round(total_rev,2), "total_cost_zar": round(total_cost,2),
                    "total_profit_zar": round(total_profit,2), "utilisation_pct": round((fwd_km+ret_km)/(dist_pickup+fwd_km+ret_km)*100,1)}
                result["savings_vs_one_way"] = {"additional_revenue_zar": rl.offered_price,
                    "additional_profit_zar": round(total_profit - one_way_profit,2), "empty_miles_eliminated_km": round(one_way_empty,1)}
                result["best_return_option"] = result["return_options"][-1]
            return result
        return None


class DemandPredictor:
    _baseline = {("Durban","Johannesburg"):45, ("Johannesburg","Durban"):42, ("Cape Town","Johannesburg"):22, ("Johannesburg","Cape Town"):25}
    def predict(self, origin: str, dest: str) -> Dict:
        b = self._baseline.get((origin,dest), 5)
        return {"corridor": f"{origin} ↔ {dest}", "predicted_loads_per_day": round(b * (1 + random.uniform(-0.1, 0.15)),1), "confidence": 0.8 if b > 20 else 0.6}
    def predict_all(self) -> Dict:
        return {f"{o} ↔ {d}": self.predict(o,d) for (o,d) in self._baseline}
    def find_imbalanced(self, supply: Dict[str,int]) -> List[Dict]:
        r = []
        for k, s in supply.items():
            parts = k.split(" ↔ ")
            if len(parts) != 2: continue
            p = self.predict(parts[0], parts[1])
            ratio = s / max(p["predicted_loads_per_day"], 1)
            r.append({"corridor": k, "supply": s, "demand": p["predicted_loads_per_day"], "ratio": round(ratio,2),
                "status": "oversupplied" if ratio > 2 else ("undersupplied" if ratio < 0.5 else "balanced")})
        return r


class PricingEngine:
    def suggest(self, load: Load) -> Dict:
        k = (load.origin.name, load.destination.name)
        m = MARKET_PRICES.get(k)
        if not m:
            d = haversine(load.origin.lat, load.origin.lng, load.destination.lat, load.destination.lng)
            p = d * 18 * max(load.weight_tonnes/10, 0.3)
            c = travel_cost(d, load.weight_tonnes)
            return {"load_id": load.id, "recommended_price_zar": round(p,0), "market_range_zar": {"low": round(p*0.75,0), "median": round(p,0), "high": round(p*1.3,0)},
                "your_cost_estimate_zar": round(c,0), "projected_profit_zar": round(p-c,0), "confidence": 0.3, "reasoning": "Distance-based estimate"}
        w = max(load.weight_tonnes/10, 0.3)
        prem = {"general":1,"perishable":1.25,"hazardous":1.4,"refrigerated":1.3}.get(load.type,1)
        rec = m["median"] * w * prem
        corridor = get_corridor(load.origin.name, load.destination.name)
        d = corridor.distance_km if corridor else haversine(load.origin.lat,load.origin.lng,load.destination.lat,load.destination.lng)
        c = travel_cost(d, load.weight_tonnes)
        return {"load_id": load.id, "route": f"{load.origin.name} → {load.destination.name}",
            "market_range_zar": {"low": round(m["low"]*w*prem,0), "median": round(m["median"]*w*prem,0), "high": round(m["high"]*w*prem,0)},
            "recommended_price_zar": round(rec,0), "your_cost_estimate_zar": round(c,0), "projected_profit_zar": round(rec-c,0),
            "projected_margin_pct": round((rec-c)/rec*100 if rec>0 else 0,1), "confidence": min(0.85, 0.4+m["samples"]/2000),
            "reasoning": f"Market data for {load.origin.name}→{load.destination.name}: R{m['low']:,}-R{m['median']:,}-R{m['high']:,} range. Recommended: R{rec:,.0f}."}

    def profit_margin(self, load: Load, price: Optional[float] = None) -> Dict:
        p = price or load.offered_price
        corridor = get_corridor(load.origin.name, load.destination.name)
        d = corridor.distance_km if corridor else haversine(load.origin.lat,load.origin.lng,load.destination.lat,load.destination.lng)
        cost = d * 13.0; profit = p - cost
        return {"route": f"{load.origin.name} → {load.destination.name}", "offered_price_zar": round(p,0),
            "cost_breakdown": {"fuel_zar": round(d*8,0), "driver_zar": round(d*2,0), "tolls_zar": round(d*2,0), "insurance_zar": round(d*1,0)},
            "total_cost_zar": round(cost,0), "estimated_profit_zar": round(profit,0), "profit_margin_pct": round(profit/p*100 if p>0 else 0,1)}


class MatchingEngine:
    def find_best_match(self, load: Load, trucks: List[Truck]) -> Optional[Dict]:
        best = None; best_score = -1
        for truck in trucks:
            if load.weight_tonnes > truck.capacity_tonnes: continue
            if load.volume_m3 > truck.capacity_m3: continue
            dist = haversine(truck.current_location.lat, truck.current_location.lng, load.origin.lat, load.origin.lng)
            trip_km = haversine(load.origin.lat, load.origin.lng, load.destination.lat, load.destination.lng)
            cost = travel_cost(dist + trip_km, load.weight_tonnes)
            profit = load.offered_price - cost
            margin = (profit/load.offered_price*100) if load.offered_price > 0 else 0
            score = max(0, min(100, 50 + margin*2 - dist/20))
            if score > best_score:
                best_score = score
                reason = f"Truck is {dist:.0f}km from pickup in {load.origin.name}. {load.origin.name}→{load.destination.name}: {trip_km:.0f}km trip. Net profit R{profit:,.0f} ({margin:.0f}% margin)."
                best = {"load_id": load.id, "truck_id": truck.id, "match_score": round(score), "reason": reason,
                    "estimated_revenue_zar": load.offered_price, "estimated_cost_zar": round(cost,0), "estimated_profit_zar": round(profit,0),
                    "profit_margin_pct": round(margin,1), "empty_km_saved": round(dist,1)}
        return best

    def discover_opportunities(self, lat: float, lng: float, name: str = "Location", radius: float = 200.0, limit: int = 10) -> List[Dict]:
        opps = []
        for (o,d), corr in SA_CORRIDORS.items():
            dist = haversine(lat, lng, corr.origin.lat, corr.origin.lng)
            if dist > radius: continue
            w = round(5 + random.uniform(0, 10), 1)
            price = round(5000 + corr.distance_km * 6 + random.uniform(-500, 1000), 0)
            cost = round(travel_cost(corr.distance_km, w), 0)
            profit = round(price - cost, 0)
            score = max(0, min(100, 40 + (profit/price*100 if price>0 else 0)*2))
            opps.append({"type": "load", "title": f"{o} → {d} — R{price:,.0f}", "origin": o, "destination": d,
                "distance_km": corr.distance_km, "distance_from_location_km": round(dist,0),
                "revenue_zar": price, "cost_zar": cost, "profit_zar": profit, "score": round(score),
                "reason": f"R{price:,.0f} revenue, R{cost:,.0f} cost, R{profit:,.0f} profit. {dist:.0f}km from location."})
        opps.sort(key=lambda x: x["score"], reverse=True)
        return opps[:limit]


class ReturnTripEngine:
    def find_return_trips(self, destination: str, max_weight: float = 20.0) -> List[Dict]:
        options = []
        for city, price, freq in BACKHAUL_HUBS.get(destination, []):
            w = round(5 + random.uniform(0, 8), 1)
            if w > max_weight: continue
            corr = get_corridor(destination, city)
            d = corr.distance_km if corr else 500
            cost = travel_cost(d, w)
            profit = price - cost
            empty_cost = d * 12
            total_impact = profit + empty_cost
            freq_score = {"very_high": 20, "high": 15, "medium": 10}.get(freq, 5)
            score = min(100, max(0, 30 + total_impact/300 + freq_score))
            reason = f"Return load from {destination} to {city}. R{price:,} revenue, R{cost:,} cost, R{profit:,} profit. Total impact R{total_impact:,} (profit + avoiding R{empty_cost:,} empty return)."
            options.append({"id": f"rt_{destination}_{city}", "from": destination, "to": city, "distance_km": round(d,0),
                "weight_tonnes": w, "load_type": "general", "offered_price_zar": price, "match_score": round(score),
                "reason": reason, "profit_impact_zar": round(total_impact,0), "empty_km_saved": round(d,0),
                "is_perfect_backhaul": corr and corr.origin.name == destination})
        options.sort(key=lambda o: o["match_score"], reverse=True)
        return options


# ──────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────

app = FastAPI(title="BackhaulAI Intelligence Layer", version="1.1.0",
    description="AI-powered logistics intelligence — eliminates empty return trips. Every output includes specific, actionable financial data.")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

route_optimiser = RouteOptimiser()
demand_predictor = DemandPredictor()
pricing_engine = PricingEngine()
matching_engine = MatchingEngine()
return_trip_engine = ReturnTripEngine()


@app.get("/health")
def health():
    return {"status": "ok", "service": "backhaulai-intelligence", "version": "1.1.0", "corridors": len(SA_CORRIDORS)}


@app.get("/corridors")
def list_corridors():
    return {"corridors": [{"name": k, "origin": v.origin.name, "destination": v.destination.name, "distance_km": v.distance_km} for k, v in SA_CORRIDORS.items()]}


@app.get("/match/return-trips")
def api_return_trips(destination: str = Query(...), max_weight: float = Query(20.0)):
    """Find return trip opportunities FROM a destination city."""
    options = return_trip_engine.find_return_trips(destination, max_weight)
    return {"destination": destination, "return_trip_options": options, "options_found": len(options),
        "tip": f"Truck is in {destination}. Best return could earn R{options[0]['profit_impact_zar']:,}." if options else f"No return loads from {destination}."}


@app.post("/discover/opportunities")
def api_discover(lat: float = Body(...), lng: float = Body(...), location_name: str = Body("Location"),
                 radius_km: float = Body(200.0), limit: int = Body(10)):
    """Discover ALL opportunities near a location (loads + return trips + routes)."""
    opps = matching_engine.discover_opportunities(lat, lng, location_name, radius_km, limit)
    return {"location": location_name, "radius_km": radius_km, "opportunities": opps, "opportunities_found": len(opps)}


@app.post("/route-optimiser/round-trip")
def api_round_trip(outbound: dict = Body(...), truck: dict = Body(...), return_loads: list = Body([])):
    try:
        o = _parse_load(outbound); t = _parse_truck(truck); rls = [_parse_load(rl) for rl in return_loads]
    except Exception as e:
        raise HTTPException(400, str(e))
    result = route_optimiser.find_round_trip(o, [t], rls)
    if result: return result
    raise HTTPException(404, "No viable round-trip")


@app.get("/demand/predict")
def api_demand(origin: str = Query(...), destination: str = Query(...)):
    return demand_predictor.predict(origin, destination)


@app.get("/demand/predict-all")
def api_demand_all():
    return demand_predictor.predict_all()


def _parse_load(d: dict) -> Load:
    """Parse a load dict (possibly with nested Location dicts) into a Load dataclass."""
    o = d.get("origin", {}); de = d.get("destination", {})
    origin = Location(lat=o.get("lat",0), lng=o.get("lng",0), name=o.get("name",""), region=o.get("region",""))
    dest = Location(lat=de.get("lat",0), lng=de.get("lng",0), name=de.get("name",""), region=de.get("region",""))
    return Load(id=d.get("id",""), origin=origin, destination=dest,
                weight_tonnes=d.get("weight_tonnes",0), volume_m3=d.get("volume_m3",0),
                type=d.get("type","general"), pickup_date=d.get("pickup_date","2025-01-01"),
                delivery_date=d.get("delivery_date","2025-01-02"),
                offered_price=d.get("offered_price",0), status=d.get("status","available"))

def _parse_truck(d: dict) -> Truck:
    cl = d.get("current_location", {})
    loc = Location(lat=cl.get("lat",0), lng=cl.get("lng",0), name=cl.get("name",""), region=cl.get("region",""))
    return Truck(id=d.get("id",""), capacity_tonnes=d.get("capacity_tonnes",0), capacity_m3=d.get("capacity_m3",0),
                 type=d.get("type","flatbed"), current_location=loc, available_date=d.get("available_date","2025-01-01"))

@app.post("/pricing/suggest")
def api_pricing(load: dict = Body(...)):
    try:
        return pricing_engine.suggest(_parse_load(load))
    except Exception as e:
        raise HTTPException(400, str(e))


@app.post("/pricing/profit-margin")
def api_profit(load: dict = Body(...), offered_price: Optional[float] = Body(None)):
    try:
        return pricing_engine.profit_margin(_parse_load(load), offered_price)
    except Exception as e:
        raise HTTPException(400, str(e))


@app.post("/matching/find-best")
def api_match(load: dict = Body(...), trucks: List[dict] = Body(...)):
    try:
        r = matching_engine.find_best_match(_parse_load(load), [_parse_truck(t) for t in trucks])
    except Exception as e:
        raise HTTPException(400, str(e))
    if r: return r
    raise HTTPException(404, "No suitable match")


@app.get("/agent/marketplace/corridors")
def marketplace_corridors():
    """Marketplace intelligence: all corridor snapshots."""
    from datetime import datetime
    results = []
    for name, corr in SA_CORRIDORS.items():
        supply = random.randint(5, 40); demand = random.randint(5, 45)
        ratio = supply / max(demand, 1)
        results.append({"corridor": name, "origin": corr.origin.name, "destination": corr.destination.name,
            "available_trucks": supply, "available_loads": demand, "supply_demand_ratio": round(ratio,2),
            "opportunity_score": round(demand * 8000 / max(supply, 1) / 1000, 1)})
    return {"corridors": results}

# ──────────────────────────────────────────────
# PHASE 3: Trust & Monetisation Layer
# ──────────────────────────────────────────────

# -- In-memory data stores (for demo/sandbox, replace with DB in production) --
_kyc_records: Dict[str, Dict] = {}  # user_id -> record
_subscriptions: Dict[str, Dict] = {} # user_id -> subscription
_subscription_plans = [
    {"id": "starter", "name": "Starter", "price_zar": 3500, "features": ["50 loads/month", "Priority matching", "Route optimisation", "Email support"], "billing_cycle": "monthly"},
    {"id": "pro", "name": "Pro", "price_zar": 9500, "features": ["Unlimited loads", "Priority matching", "Route optimisation", "Pricing intelligence", "Analytics dashboard", "API access", "Phone support"], "billing_cycle": "monthly"},
    {"id": "business", "name": "Business", "price_zar": 20000, "features": ["Full analytics", "Priority matching", "Direct support", "Fleet management"], "billing_cycle": "monthly"},
    {"id": "enterprise", "name": "Enterprise", "price_zar": 35000, "features": ["Unlimited everything", "White-label option", "Dedicated account manager", "Custom integrations", "SLA guarantee", "24/7 support"], "billing_cycle": "monthly"},
    {"id": "enterprise_plus", "name": "Enterprise+", "price_zar": 65000, "features": ["Full network intelligence", "White-glove support", "Custom integrations", "Dedicated account manager"], "billing_cycle": "monthly"},
]
_reputation_scores: Dict[str, Dict] = {}  # user_id -> score data
_gps_tracking: Dict[str, Dict] = {}  # trip_id -> latest position

# ── 1. KYC Verification ──────────────────────

@app.get("/kyc/status/{user_id}")
def kyc_get_status(user_id: str):
    """Get KYC verification status for a user."""
    record = _kyc_records.get(user_id)
    if not record:
        return {"user_id": user_id, "status": "not_submitted", "documents": [], "verified_at": None, "note": "No KYC documents submitted yet"}
    return record

@app.post("/kyc/submit")
def kyc_submit(user_id: str = Body(...), id_number: str = Body(...), selfie_url: str = Body(""), address_proof_url: str = Body(""), driver_license_url: str = Body("")):
    """Submit KYC documents for verification."""
    if user_id in _kyc_records and _kyc_records[user_id]["status"] == "approved":
        raise HTTPException(400, "KYC already approved")
    import uuid
    doc_id = str(uuid.uuid4())[:8]
    documents = []
    if id_number: documents.append({"type": "id_number", "value": f"****{id_number[-4:]}", "verified": False})
    if selfie_url: documents.append({"type": "selfie", "url": selfie_url, "verified": False})
    if address_proof_url: documents.append({"type": "address_proof", "url": address_proof_url, "verified": False})
    if driver_license_url: documents.append({"type": "driver_license", "url": driver_license_url, "verified": False})
    _kyc_records[user_id] = {
        "user_id": user_id, "status": "pending", "documents": documents,
        "submitted_at": datetime.now().isoformat(), "verified_at": None, "kyc_id": f"KYC-{doc_id}", "note": "Documents received, awaiting verification"
    }
    return {"user_id": user_id, "kyc_id": f"KYC-{doc_id}", "status": "pending", "documents_submitted": len(documents), "message": "KYC documents submitted successfully. Verification typically takes 1-2 hours."}

@app.post("/kyc/verify")
def kyc_verify(user_id: str = Body(...), approve: bool = Body(...), reviewer: str = Body("system")):
    """Approve or reject KYC verification (admin/staff endpoint)."""
    if user_id not in _kyc_records:
        raise HTTPException(404, "No KYC record found")
    new_status = "approved" if approve else "rejected"
    _kyc_records[user_id]["status"] = new_status
    _kyc_records[user_id]["verified_at"] = datetime.now().isoformat()
    _kyc_records[user_id]["reviewed_by"] = reviewer
    _kyc_records[user_id]["note"] = "Identity verified successfully" if approve else "Identity verification rejected — please resubmit with valid documents"
    for doc in _kyc_records[user_id]["documents"]:
        doc["verified"] = approve
    return {"user_id": user_id, "status": new_status, "verified_at": _kyc_records[user_id]["verified_at"], "message": _kyc_records[user_id]["note"]}


# ── 2. Subscription Management ───────────────

@app.get("/subscription/plans")
def sub_list_plans():
    """List all available subscription plans."""
    return {"plans": _subscription_plans}

@app.get("/subscription/status/{user_id}")
def sub_get_status(user_id: str):
    """Get subscription status for a user."""
    sub = _subscriptions.get(user_id)
    if not sub:
        return {"user_id": user_id, "plan_id": None, "plan_name": "None", "active": False, "status": "inactive",
                "message": "No active subscription. Please upgrade to a paid tier."}
    return sub

@app.post("/subscription/upgrade")
def sub_upgrade(user_id: str = Body(...), plan_id: str = Body(...), billing_cycle: str = Body("monthly")):
    """Upgrade or change a user's subscription plan."""
    plan = next((p for p in _subscription_plans if p["id"] == plan_id), None)
    if not plan:
        raise HTTPException(404, f"Plan '{plan_id}' not found")
    from datetime import timedelta
    period_end = (datetime.now() + timedelta(days=30 if billing_cycle == "monthly" else 365)).isoformat()
    _subscriptions[user_id] = {
        "user_id": user_id, "plan_id": plan_id, "plan_name": plan["name"],
        "price_zar": plan["price_zar"], "billing_cycle": billing_cycle,
        "status": "active", "features": plan["features"],
        "current_period_start": datetime.now().isoformat(),
        "current_period_end": period_end,
        "auto_renew": True
    }
    return {"user_id": user_id, "plan_id": plan_id, "plan_name": plan["name"], "status": "active",
            "price_zar": plan["price_zar"], "billing_cycle": billing_cycle,
            "current_period_end": period_end, "message": f"Upgraded to {plan['name']} plan successfully"}

@app.post("/subscription/cancel")
def sub_cancel(user_id: str = Body(..., embed=True)):
    """Cancel a user's subscription (remains inactive after period end)."""
    if user_id not in _subscriptions:
        return {"user_id": user_id, "status": "no_active_subscription", "message": "No active subscription to cancel"}
    plan_name = _subscriptions[user_id].get("plan_name", "Unknown")
    _subscriptions[user_id]["status"] = "cancelled"
    _subscriptions[user_id]["auto_renew"] = False
    return {"user_id": user_id, "plan": plan_name, "status": "cancelled",
            "message": f"Subscription cancelled. Current plan ({plan_name}) remains active until period end and will not renew."}


# ── 3. Reputation Scoring ────────────────────

def _calc_reputation(trips_completed: int, avg_rating: float, on_time_pct: float, response_rate: float) -> Dict:
    """Calculate reputation score and level."""
    score = 0
    # Trips completed (max 30 points)
    score += min(30, trips_completed)
    # Average rating (max 35 points)
    score += int(avg_rating * 7)  # 5-star → 35, 3-star → 21, 1-star → 7
    # On-time delivery (max 25 points)
    score += int(on_time_pct * 0.25)
    # Response rate (max 10 points)
    score += int(response_rate * 0.10)
    score = max(0, min(100, score))
    if score >= 85: level = "platinum"
    elif score >= 70: level = "gold"
    elif score >= 50: level = "silver"
    elif score >= 25: level = "bronze"
    else: level = "newbie"
    return {"score": score, "level": level, "max_score": 100}

@app.get("/reputation/{user_id}")
def rep_get_score(user_id: str):
    """Get reputation score for a user."""
    if user_id in _reputation_scores:
        return _reputation_scores[user_id]
    # Return default for new users
    score_data = _calc_reputation(0, 0, 0, 0)
    return {"user_id": user_id, "score": score_data["score"], "level": score_data["level"],
            "trips_completed": 0, "avg_rating": 0.0, "on_time_delivery_pct": 0.0, "response_rate": 0.0,
            "positive_reviews": 0, "negative_reviews": 0, "badges": []}

@app.post("/reputation/update")
def rep_update(user_id: str = Body(...), trips_completed: int = Body(0), avg_rating: float = Body(0.0),
               on_time_delivery_pct: float = Body(0.0), response_rate: float = Body(0.0),
               positive_reviews: int = Body(0), negative_reviews: int = Body(0)):
    """Update reputation score for a user based on trip data."""
    score_data = _calc_reputation(trips_completed, avg_rating, on_time_delivery_pct, response_rate)
    badges = []
    if trips_completed >= 100: badges.append("century-rider")
    if trips_completed >= 10 and avg_rating >= 4.8: badges.append("top-rated")
    if on_time_delivery_pct >= 95: badges.append("always-on-time")
    if response_rate >= 98: badges.append("quick-responder")
    _reputation_scores[user_id] = {
        "user_id": user_id, "score": score_data["score"], "level": score_data["level"],
        "trips_completed": trips_completed, "avg_rating": avg_rating,
        "on_time_delivery_pct": on_time_delivery_pct, "response_rate": response_rate,
        "positive_reviews": positive_reviews, "negative_reviews": negative_reviews,
        "badges": badges, "updated_at": datetime.now().isoformat()
    }
    return _reputation_scores[user_id]


# ── 4. GPS Tracking WebSocket ────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}  # trip_id -> [websockets]

    async def connect(self, websocket: WebSocket, trip_id: str):
        await websocket.accept()
        if trip_id not in self.active_connections:
            self.active_connections[trip_id] = []
        self.active_connections[trip_id].append(websocket)

    def disconnect(self, websocket: WebSocket, trip_id: str):
        if trip_id in self.active_connections:
            self.active_connections[trip_id] = [ws for ws in self.active_connections[trip_id] if ws != websocket]
            if not self.active_connections[trip_id]:
                del self.active_connections[trip_id]

    async def broadcast_position(self, trip_id: str, data: dict):
        if trip_id in self.active_connections:
            stale = []
            for ws in self.active_connections[trip_id]:
                try:
                    await ws.send_json(data)
                except Exception:
                    stale.append(ws)
            for ws in stale:
                self.disconnect(ws, trip_id)

manager = ConnectionManager()

@app.websocket("/ws/gps/{trip_id}")
async def gps_websocket(websocket: WebSocket, trip_id: str):
    """WebSocket endpoint for real-time GPS tracking during a trip.
    
    Client connects, then server broadcasts location updates.
    Client can also send their location which gets broadcast to all watchers.
    """
    await manager.connect(websocket, trip_id)
    try:
        # Send initial connection confirmation
        await websocket.send_json({"type": "connected", "trip_id": trip_id, "message": "GPS tracking active"})
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "location_update":
                lat = data.get("lat")
                lng = data.get("lng")
                speed = data.get("speed", 0)
                heading = data.get("heading", 0)
                timestamp = datetime.now().isoformat()
                update = {"type": "location_update", "trip_id": trip_id, "lat": lat, "lng": lng,
                          "speed": speed, "heading": heading, "timestamp": timestamp}
                _gps_tracking[trip_id] = update
                await manager.broadcast_position(trip_id, update)
            elif data.get("type") == "ping":
                await websocket.send_json({"type": "pong", "trip_id": trip_id})
    except WebSocketDisconnect:
        manager.disconnect(websocket, trip_id)

@app.get("/gps/latest/{trip_id}")
def gps_get_latest(trip_id: str):
    """Get the latest GPS position for a trip (REST fallback)."""
    position = _gps_tracking.get(trip_id)
    if not position:
        return {"trip_id": trip_id, "position_available": False, "message": "No GPS data yet for this trip"}
    return {"trip_id": trip_id, "position_available": True, "lat": position.get("lat"),
            "lng": position.get("lng"), "speed": position.get("speed", 0),
            "heading": position.get("heading", 0), "timestamp": position.get("timestamp")}


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8004, reload=True)