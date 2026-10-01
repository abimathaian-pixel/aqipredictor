import pytest
from app.services.aqi_calculator import calculate_sub_index, get_aqi_category, compute_overall_aqi

def test_pm25_sub_index():
    # 0 - 30 -> 0 - 50
    assert calculate_sub_index("PM2.5", 15.0) == 25
    assert calculate_sub_index("PM2.5", 30.0) == 50
    # 31 - 60 -> 51 - 100
    assert 51 <= calculate_sub_index("PM2.5", 45.0) <= 100
    # 61 - 90 -> 101 - 200
    assert 101 <= calculate_sub_index("PM2.5", 75.0) <= 200
    # > 250 -> 401 - 500
    assert calculate_sub_index("PM2.5", 280.0) >= 401

def test_pm10_sub_index():
    assert calculate_sub_index("PM10", 25.0) == 25
    assert calculate_sub_index("PM10", 50.0) == 50
    assert 51 <= calculate_sub_index("PM10", 75.0) <= 100

def test_aqi_categories():
    assert get_aqi_category(35)["category"] == "Good"
    assert get_aqi_category(85)["category"] == "Satisfactory"
    assert get_aqi_category(142)["category"] == "Moderate"
    assert get_aqi_category(245)["category"] == "Poor"
    assert get_aqi_category(350)["category"] == "Very Poor"
    assert get_aqi_category(440)["category"] == "Severe"

def test_compute_overall_aqi():
    pollutants = {
        "PM2.5": 75.0,  # Moderate (~150)
        "PM10": 60.0,   # Satisfactory (~60)
        "NO2": 30.0,    # Good (~37)
        "SO2": 15.0,    # Good (~18)
        "CO": 0.8,      # Good (~40)
        "O3": 40.0      # Good (~40)
    }
    aqi, dom_poll, sub_indices = compute_overall_aqi(pollutants)
    assert aqi is not None
    assert dom_poll == "PM2.5"
    assert 101 <= aqi <= 200
