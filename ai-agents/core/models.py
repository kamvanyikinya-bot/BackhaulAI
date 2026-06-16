"""Shared data models for BackhaulAI intelligence layer."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime


@dataclass
class Location:
    lat: float
    lng: float
    name: str
    region: str = ""


@dataclass
class Corridor:
    origin: Location
    destination: Location
    distance_km: float
    avg_duration_hours: float

    @property
    def name(self) -> str:
        return f"{self.origin.name} ↔ {self.destination.name}"

    @property
    def reverse(self) -> "Corridor":
        return Corridor(
            origin=self.destination, destination=self.origin,
            distance_km=self.distance_km, avg_duration_hours=self.avg_duration_hours,
        )


@dataclass
class Load:
    id: str
    origin: Location
    destination: Location
    weight_tonnes: float
    volume_m3: float
    type: str
    pickup_date: datetime
    delivery_date: datetime
    offered_price: float
    status: str = "available"
    shipper_id: Optional[str] = None


@dataclass
class Truck:
    id: str
    capacity_tonnes: float
    capacity_m3: float
    type: str
    current_location: Location
    available_date: datetime
    owner_id: Optional[str] = None


@dataclass
class Trip:
    id: str
    legs: List[Dict] = field(default_factory=list)
    total_distance_km: float = 0.0
    total_revenue_zar: float = 0.0
    total_cost_zar: float = 0.0
    total_profit_zar: float = 0.0
    empty_km: float = 0.0
    loaded_km: float = 0.0
    status: str = "planned"

    @property
    def utilisation_pct(self) -> float:
        if self.total_distance_km == 0:
            return 0.0
        return (self.loaded_km / self.total_distance_km) * 100


@dataclass
class SupplyDemandPoint:
    supply_count: int = 0
    demand_count: int = 0
    avg_price_zar: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)

    @property
    def ratio(self) -> float:
        if self.demand_count == 0 and self.supply_count == 0:
            return 1.0
        if self.demand_count == 0:
            return float("inf")
        return self.supply_count / self.demand_count


@dataclass
class PricingSuggestion:
    load_id: str
    suggested_price: float
    min_price: float
    max_price: float
    confidence: float
    reasoning: str
    market_avg: float = 0.0
    market_low: float = 0.0
    market_median: float = 0.0
    market_high: float = 0.0
    estimated_cost: float = 0.0
    estimated_profit: float = 0.0
    estimated_margin_pct: float = 0.0


@dataclass
class MatchResult:
    load_id: str
    truck_id: str
    match_score: int = 0
    estimated_revenue: float = 0.0
    estimated_cost: float = 0.0
    estimated_profit: float = 0.0
    profit_margin_pct: float = 0.0
    empty_km_saved: float = 0.0
    reason: str = ""
    forward_revenue: float = 0.0
    return_revenue: float = 0.0
    total_trip_revenue: float = 0.0


@dataclass
class ReturnTripOption:
    id: str
    load_id: str
    origin_name: str
    dest_name: str
    distance_km: float
    duration_hours: float
    weight_tonnes: float
    load_type: str
    offered_price: float
    match_score: int
    reason: str
    profit_impact_zar: float
    empty_km_saved: float
    is_perfect_backhaul: bool


@dataclass
class Opportunity:
    type: str
    id: str
    title: str
    description: str
    origin_name: str
    dest_name: str
    distance_km: float
    revenue_zar: float
    cost_zar: float
    profit_zar: float
    score: int
    reason: str
    distance_from_location_km: float = 0.0
    empty_km_saved: float = 0.0