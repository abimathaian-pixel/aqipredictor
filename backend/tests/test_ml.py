import pytest
import pandas as pd
from app.ml.data_pipeline import get_season_code, FEATURE_COLUMNS
from app.ml.predictor import get_loaded_model, get_model_metrics

def test_season_mapping():
    assert get_season_code(1) == 1  # Jan = Winter
    assert get_season_code(4) == 2  # Apr = Summer
    assert get_season_code(7) == 3  # Jul = Monsoon
    assert get_season_code(10) == 4 # Oct = Post-Monsoon

def test_model_loaded_and_valid():
    model = get_loaded_model()
    assert model is not None

    metrics = get_model_metrics()
    assert "mae" in metrics
    assert "r2" in metrics
    assert metrics["r2"] > 0.5  # Solid predictive power
    assert len(metrics["feature_importances"]) > 0

def test_feature_columns_consistent():
    assert "aqi_lag_1" in FEATURE_COLUMNS
    assert "pm25" in FEATURE_COLUMNS
    assert "season" in FEATURE_COLUMNS
