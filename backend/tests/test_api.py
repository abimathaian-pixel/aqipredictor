import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_stations():
    response = client.get("/api/stations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 12
    station_names = [s["name"] for s in data]
    assert "Shivajinagar" in station_names
    assert "Hadapsar" in station_names

def test_get_live_air_quality():
    response = client.get("/api/air-quality/live")
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert "stations" in data
    assert data["overview"]["city_name"] == "Pune"
    assert "city_aqi" in data["overview"]
    assert "category_info" in data["overview"]
    assert "is_demo_mode" in data["overview"]
    assert len(data["stations"]) >= 12

def test_station_details():
    response = client.get("/api/stations/station-shivajinagar")
    assert response.status_code == 200
    data = response.json()
    assert data["station"]["name"] == "Shivajinagar"
    assert "current" in data
    assert "history_24h" in data
    assert "history_7d" in data

def test_hotspots():
    response = client.get("/api/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert "stations" in data
    assert len(data["stations"]) >= 12
    assert "city_average_aqi" in data
    assert "thresholds" in data

def test_health_advisory():
    response = client.get("/api/health-advisory")
    assert response.status_code == 200
    data = response.json()
    assert "aqi" in data
    assert "category" in data
    assert "recommended_actions" in data
    assert "disclaimer" in data

def test_predictions():
    response = client.get("/api/predictions/station-shivajinagar")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_tomorrow_aqi" in data
    assert "predicted_aqi" in data
    assert "target_date" in data
    assert "forecast_timeline" in data
    assert len(data["forecast_timeline"]) == 8  # Today + 7 future days
    assert "confidence_interval" in data
    assert "top_features" in data
    assert "explanation" in data

def test_predictions_custom_date_post():
    # Test POST /api/predictions for 3 days ahead (2026-10-03)
    payload = {
        "station_id": "station-shivajinagar",
        "target_date": "2026-10-03"
    }
    response = client.post("/api/predictions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["target_date"] == "2026-10-03"
    assert data["days_ahead"] == 3
    assert data["predicted_aqi"] > 0
    assert "forecast_timeline" in data
    # Verify the selected date is marked as target
    target_points = [p for p in data["forecast_timeline"] if p["is_target"]]
    assert len(target_points) == 1
    assert target_points[0]["date"] == "2026-10-03"

def test_predictions_validation_past_or_today():
    # Selecting today (2026-09-30) must be rejected
    payload = {
        "station_id": "station-shivajinagar",
        "target_date": "2026-09-30"
    }
    response = client.post("/api/predictions", json=payload)
    assert response.status_code == 400
    assert "future date" in response.json()["detail"].lower()

    # Selecting yesterday must be rejected
    payload_past = {
        "station_id": "station-shivajinagar",
        "target_date": "2026-09-29"
    }
    response_past = client.post("/api/predictions", json=payload_past)
    assert response_past.status_code == 400
    assert "future date" in response_past.json()["detail"].lower()

def test_predictions_validation_beyond_horizon():
    # Selecting beyond 7 days ahead (e.g. 2026-10-15) must be rejected
    payload = {
        "station_id": "station-shivajinagar",
        "target_date": "2026-10-15"
    }
    response = client.post("/api/predictions", json=payload)
    assert response.status_code == 400
    assert "7 days" in response.json()["detail"].lower()

def test_model_metrics():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "mae" in data
    assert "rmse" in data
    assert "r2" in data
    assert "actual_vs_predicted" in data

def test_exposure_calculator():
    payload = {
        "station_id": "station-shivajinagar",
        "hours_outdoors": 2.5,
        "commute_duration_mins": 45,
        "commute_mode": "two_wheeler",
        "activity_intensity": "moderate"
    }
    response = client.post("/api/exposure/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_inhaled_pm25_ug" in data
    assert "risk_score_100" in data
    assert "relative_exposure_level" in data

def test_alert_lifecycle():
    # Create alert
    payload = {
        "station_id": "station-shivajinagar",
        "threshold": 160,
        "contact": "test_user@example.com",
        "notify_method": "in_app"
    }
    create_res = client.post("/api/alerts", json=payload)
    assert create_res.status_code == 200
    alert_data = create_res.json()
    alert_id = alert_data["id"]
    assert alert_data["threshold"] == 160

    # List alerts
    list_res = client.get("/api/alerts")
    assert list_res.status_code == 200
    assert any(a["id"] == alert_id for a in list_res.json())

    # Delete alert
    del_res = client.delete(f"/api/alerts/{alert_id}")
    assert del_res.status_code == 200

def test_correlation():
    response = client.get("/api/correlation")
    assert response.status_code == 200
    data = response.json()
    assert "matrix" in data
    assert "variables" in data
    assert "scatter_aqi_pm25" in data
