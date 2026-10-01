from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class StationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    area: str
    latitude: float
    longitude: float
    operator: str
    station_type: str
    description: Optional[str] = None
    baseline_aqi: int
    is_active: bool

class PollutantConcentration(BaseModel):
    value: Optional[float]
    unit: str
    sub_index: Optional[int]
    status: str  # e.g., 'Normal', 'Elevated', 'High'

class PollutantBreakdown(BaseModel):
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    details: Dict[str, PollutantConcentration] = {}

class AQICategoryInfo(BaseModel):
    category: str
    severity: str
    range: str
    color: str
    bg_color: str
    text_color: str
    border_color: str
    description: str
    health_implication: str

class LiveStationItem(BaseModel):
    id: str
    name: str
    area: str
    latitude: float
    longitude: float
    operator: str
    aqi: int
    category_info: AQICategoryInfo
    dominant_pollutant: str
    pm25: Optional[float]
    pm10: Optional[float]
    no2: Optional[float]
    so2: Optional[float]
    co: Optional[float]
    o3: Optional[float]
    temperature: Optional[float]
    humidity: Optional[float]
    wind_speed: Optional[float]
    last_updated: str
    trend: str  # 'up', 'down', 'stable'
    change_24h: int

class CityOverviewResponse(BaseModel):
    city_name: str = "Pune"
    city_aqi: int
    category_info: AQICategoryInfo
    active_stations_count: int
    total_stations_count: int
    highest_station: Dict[str, Any]
    lowest_station: Dict[str, Any]
    dominant_pollutant: str
    predicted_tomorrow_aqi: int
    predicted_change_percent: float
    last_updated: str
    is_demo_mode: bool
    data_source: str
    disclaimer: str

class HistoricalPoint(BaseModel):
    timestamp: str
    aqi: int
    category: str
    pm25: Optional[float]
    pm10: Optional[float]
    no2: Optional[float]
    so2: Optional[float]
    co: Optional[float]
    o3: Optional[float]
    temperature: Optional[float]
    humidity: Optional[float]
    wind_speed: Optional[float]

class HistoricalResponse(BaseModel):
    station_id: Optional[str]
    station_name: str
    timeframe: str
    points: List[HistoricalPoint]
    summary: Dict[str, Any]

class HealthAdvisoryResponse(BaseModel):
    aqi: int
    category: str
    severity: str
    dominant_pollutant: str
    general_public_advice: str
    sensitive_groups_advice: str
    recommended_actions: List[str]
    mask_recommendation: str
    outdoor_activity_guidance: str
    indoor_ventilation_guidance: str
    dominant_pollutant_impact: str
    disclaimer: str

class HotspotStation(BaseModel):
    rank: int
    station_id: str
    name: str
    area: str
    latitude: float
    longitude: float
    avg_aqi: float
    median_aqi: float
    max_aqi: int
    p90_aqi: float
    tier: str  # 'High Pollution', 'Medium Pollution', 'Low Pollution'
    tier_color: str
    primary_driver: str
    observations_count: int

class HotspotsResponse(BaseModel):
    methodology: str
    thresholds: Dict[str, str]
    stations: List[HotspotStation]
    city_average_aqi: float
    most_polluted_station: str
    cleanest_station: str

class FeatureImportanceItem(BaseModel):
    feature: str
    label: str
    importance: float

class ForecastTimelinePoint(BaseModel):
    date: str
    display_date: str
    full_date: str
    day_name: str
    aqi: int
    category: str
    severity: str
    color: str
    is_today: bool = False
    is_target: bool = False

class PredictionRequest(BaseModel):
    station_id: str
    target_date: Optional[str] = None

class PredictionResponse(BaseModel):
    station_id: str
    station_name: str
    current_aqi: int
    predicted_tomorrow_aqi: int
    predicted_aqi: int
    target_date: str
    target_date_display: str
    days_ahead: int
    predicted_category: AQICategoryInfo
    percentage_change: float
    trend_direction: str  # 'worsening', 'improving', 'stable'
    trend_label: str      # 'Expected deterioration', 'Expected improvement', 'Expected to remain stable'
    estimate_type: str = "Model-based estimate"
    confidence_interval: Dict[str, int]
    top_features: List[FeatureImportanceItem]
    explanation: str
    model_name: str
    prediction_date: str = "Tomorrow"
    model_status: str = "Model Ready"
    forecast_timeline: List[ForecastTimelinePoint] = []

class ActualVsPredictedPoint(BaseModel):
    date: str
    actual: float
    predicted: float
    residual: float

class ModelMetricsResponse(BaseModel):
    model_name: str
    baseline_model_name: str
    mae: float
    rmse: float
    r2: float
    baseline_mae: float
    baseline_rmse: float
    baseline_r2: float
    features_used: List[str]
    sample_size: int
    actual_vs_predicted: List[ActualVsPredictedPoint]
    description: str

class ExposureRequest(BaseModel):
    station_id: str
    hours_outdoors: float
    commute_duration_mins: float
    commute_mode: str  # 'walking', 'cycling', 'two_wheeler', 'car_ac', 'bus_train'
    activity_intensity: str  # 'low', 'moderate', 'vigorous'

class ExposureResponse(BaseModel):
    station_name: str
    current_aqi: int
    pm25_level: float
    estimated_inhaled_pm25_ug: float
    relative_exposure_level: str  # 'Minimal', 'Low', 'Moderate', 'High', 'Severe'
    risk_score_100: int
    recommendations: List[str]
    disclaimer: str

class AlertCreate(BaseModel):
    station_id: str
    threshold: int
    contact: Optional[str] = "browser_session"
    notify_method: Optional[str] = "in_app"

class AlertItem(BaseModel):
    id: int
    station_id: str
    station_name: str
    threshold: int
    contact: Optional[str]
    is_active: bool
    created_at: str
    is_triggered_now: bool
    current_aqi: int

class ScatterPoint(BaseModel):
    x: float
    y: float
    station: str
    date: str

class CorrelationResponse(BaseModel):
    variables: List[str]
    matrix: Dict[str, Dict[str, float]]
    scatter_aqi_temp: List[ScatterPoint]
    scatter_aqi_humidity: List[ScatterPoint]
    scatter_aqi_wind: List[ScatterPoint]
    scatter_aqi_pm25: List[ScatterPoint]
    interpretation: str
