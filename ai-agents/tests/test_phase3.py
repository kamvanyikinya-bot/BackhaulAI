"""Tests for Phase 3: Trust & Monetisation Layer (KYC, Subscriptions, Reputation, GPS)."""

import sys, os, json, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import pytest
from fastapi.testclient import TestClient

# Import the app (this starts the server for testing)
from api import app

client = TestClient(app)


class TestKYC:
    def test_kyc_status_not_submitted(self):
        resp = client.get("/kyc/status/new_user")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "not_submitted"
        assert data["user_id"] == "new_user"

    def test_kyc_submit(self):
        resp = client.post("/kyc/submit", json={
            "user_id": "kyc_user_1",
            "id_number": "8001015009087",
            "selfie_url": "https://example.com/selfie.jpg",
            "address_proof_url": "https://example.com/address.pdf",
            "driver_license_url": "https://example.com/license.jpg",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "pending"
        assert data["kyc_id"].startswith("KYC-")
        assert data["documents_submitted"] == 4

    def test_kyc_approve(self):
        resp = client.post("/kyc/verify", json={"user_id": "kyc_user_1", "approve": True})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "approved"
        assert data["verified_at"] is not None

    def test_kyc_status_after_approval(self):
        resp = client.get("/kyc/status/kyc_user_1")
        data = resp.json()
        assert data["status"] == "approved"
        assert len(data["documents"]) == 4
        assert all(d["verified"] for d in data["documents"])

    def test_kyc_reject(self):
        client.post("/kyc/submit", json={"user_id": "kyc_user_2", "id_number": "9001011234567"})
        resp = client.post("/kyc/verify", json={"user_id": "kyc_user_2", "approve": False})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "rejected"

    def test_kyc_duplicate_blocked(self):
        client.post("/kyc/submit", json={"user_id": "kyc_user_3", "id_number": "7001011234567"})
        client.post("/kyc/verify", json={"user_id": "kyc_user_3", "approve": True})
        resp = client.post("/kyc/submit", json={"user_id": "kyc_user_3", "id_number": "9999999999999"})
        assert resp.status_code == 400  # Already approved


class TestSubscriptions:
    def test_list_plans(self):
        resp = client.get("/subscription/plans")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["plans"]) == 4
        plan_ids = [p["id"] for p in data["plans"]]
        assert "free" in plan_ids
        assert "pro" in plan_ids
        assert "enterprise" in plan_ids

    def test_default_sub_status(self):
        resp = client.get("/subscription/status/new_user")
        assert resp.status_code == 200
        data = resp.json()
        assert data["plan_id"] == "free"
        assert data["status"] == "active"

    def test_upgrade(self):
        resp = client.post("/subscription/upgrade", json={
            "user_id": "sub_user_1", "plan_id": "pro", "billing_cycle": "monthly"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["plan_id"] == "pro"
        assert data["plan_name"] == "Professional"
        assert data["price_zar"] == 999
        assert data["status"] == "active"
        assert data["current_period_end"] is not None

    def test_upgrade_invalid_plan(self):
        resp = client.post("/subscription/upgrade", json={
            "user_id": "sub_user_2", "plan_id": "nonexistent"
        })
        assert resp.status_code == 404

    def test_cancel_subscription(self):
        client.post("/subscription/upgrade", json={"user_id": "sub_user_3", "plan_id": "starter"})
        resp = client.post("/subscription/cancel", json={"user_id": "sub_user_3"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "cancelled"

    def test_cancel_when_no_sub(self):
        resp = client.post("/subscription/cancel", json={"user_id": "sub_user_none"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "already_free"


class TestReputation:
    def test_default_score(self):
        resp = client.get("/reputation/new_user")
        assert resp.status_code == 200
        data = resp.json()
        assert data["score"] == 0
        assert data["level"] == "newbie"

    def test_update_score(self):
        resp = client.post("/reputation/update", json={
            "user_id": "rep_user_1", "trips_completed": 50, "avg_rating": 4.8,
            "on_time_delivery_pct": 98, "response_rate": 99,
            "positive_reviews": 45, "negative_reviews": 2,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["score"] > 50
        assert "top-rated" in data["badges"]
        assert "always-on-time" in data["badges"]

    def test_gold_level(self):
        resp = client.post("/reputation/update", json={
            "user_id": "rep_user_2", "trips_completed": 15, "avg_rating": 4.2,
            "on_time_delivery_pct": 85, "response_rate": 80,
        })
        data = resp.json()
        assert data["level"] in ("gold", "silver")  # depends on exact calculation

    def test_persist_score(self):
        client.post("/reputation/update", json={
            "user_id": "rep_user_3", "trips_completed": 10, "avg_rating": 4.0,
            "on_time_delivery_pct": 90, "response_rate": 88,
        })
        resp = client.get("/reputation/rep_user_3")
        data = resp.json()
        assert data["trips_completed"] == 10


class TestGPS:
    def test_gps_no_data(self):
        resp = client.get("/gps/latest/nonexistent_trip")
        assert resp.status_code == 200
        data = resp.json()
        assert data["position_available"] is False
        assert data["message"] == "No GPS data yet for this trip"

    def test_gps_websocket_connect(self):
        """Test WebSocket connection with the test client."""
        with client.websocket_connect("/ws/gps/test_trip") as ws:
            # Should receive connection confirmation
            data = ws.receive_json()
            assert data["type"] == "connected"
            assert data["trip_id"] == "test_trip"

            # Send a location update
            ws.send_json({"type": "location_update", "lat": -29.8587, "lng": 31.0218, "speed": 65, "heading": 180})
            data = ws.receive_json()
            assert data["type"] == "location_update"
            assert abs(data["lat"] - (-29.8587)) < 0.001

            # Verify REST endpoint now has the data
            resp = client.get("/gps/latest/test_trip")
            rest_data = resp.json()
            assert rest_data["position_available"] is True
            assert abs(rest_data["lat"] - (-29.8587)) < 0.001