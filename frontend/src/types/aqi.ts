export interface AQICategoryInfo {
  category: string;
  severity: string;
  range: string;
  color: string;
  bg_color: string;
  text_color: string;
  border_color: string;
  description: string;
  health_implication: string;
}

export interface LiveStationItem {
  id: string;
  name: string;
  area: string;
  latitude: float;
  longitude: float;
  operator: string;
  aqi: number;
  category_info: AQICategoryInfo;
  dominant_pollutant: string;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
  last_updated: string;
  trend: 'up' | 'down' | 'stable';
  change_24h: number;
}

export interface StationResponse {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  operator: string;
  station_type: string;
  description: string;
  baseline_aqi: number;
  is_active: boolean;
}

type float = number;

export interface CityOverview {
  city_name: string;
  city_aqi: number;
  category_info: AQICategoryInfo;
  active_stations_count: number;
  total_stations_count: number;
  highest_station: {
    id: string;
    name: string;
    area: string;
    aqi: number;
    category: string;
  };
  lowest_station: {
    id: string;
    name: string;
    area: string;
    aqi: number;
    category: string;
  };
  dominant_pollutant: string;
  predicted_tomorrow_aqi: number;
  predicted_change_percent: number;
  last_updated: string;
  is_demo_mode: boolean;
  data_source: string;
  disclaimer: string;
}

export interface LiveAirQualityResponse {
  overview: CityOverview;
  stations: LiveStationItem[];
}

export interface PollutantDetail {
  value: number | null;
  unit: string;
  label: string;
  standard: string;
}

export interface StationDetailResponse {
  station: {
    id: string;
    name: string;
    area: string;
    latitude: number;
    longitude: number;
    operator: string;
    station_type: string;
    description: string;
    baseline_aqi: number;
  };
  current: {
    aqi: number;
    category_info: AQICategoryInfo;
    dominant_pollutant: string;
    analysis_statement: string;
    pollutants: Record<string, PollutantDetail>;
    temperature: number | null;
    humidity: number | null;
    wind_speed: number | null;
    last_updated: string;
  };
  history_24h: Array<{
    time: string;
    aqi: number;
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
    o3: number | null;
  }>;
  history_7d: Array<{
    date: string;
    aqi: number;
    pm25: number | null;
    pm10: number | null;
  }>;
}

export interface HistoricalPoint {
  timestamp: string;
  aqi: number;
  category: string;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  o3: number | null;
  temperature: number | null;
  humidity: number | null;
  wind_speed: number | null;
}

export interface HistoricalResponse {
  station_id: string | null;
  station_name: string;
  timeframe: string;
  points: HistoricalPoint[];
  summary: {
    count: number;
    avg_aqi: number;
    max_aqi: number;
    min_aqi: number;
  };
}

export interface FeatureImportance {
  feature: string;
  label: string;
  importance: number;
}

export interface ForecastTimelinePoint {
  date: string;
  display_date: string;
  full_date: string;
  day_name: string;
  aqi: number;
  category: string;
  severity: string;
  color: string;
  is_today: boolean;
  is_target: boolean;
}

export interface PredictionResponse {
  station_id: string;
  station_name: string;
  current_aqi: number;
  predicted_tomorrow_aqi: number;
  predicted_aqi?: number;
  target_date?: string;
  target_date_display?: string;
  days_ahead?: number;
  predicted_category: AQICategoryInfo;
  percentage_change: number;
  trend_direction: 'improving' | 'worsening' | 'stable';
  trend_label?: string;
  estimate_type?: string;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  top_features: FeatureImportance[];
  explanation: string;
  model_name: string;
  prediction_date?: string;
  model_status?: string;
  forecast_timeline?: ForecastTimelinePoint[];
}

export interface ActualVsPredictedPoint {
  date: string;
  actual: number;
  predicted: number;
  residual: number;
}

export interface ModelMetricsResponse {
  model_name: string;
  baseline_model_name: string;
  mae: number;
  rmse: number;
  r2: number;
  baseline_mae: number;
  baseline_rmse: number;
  baseline_r2: number;
  features_used: string[];
  feature_importances: FeatureImportance[];
  sample_size: number;
  test_sample_size: number;
  actual_vs_predicted: ActualVsPredictedPoint[];
  description: string;
}

export interface HotspotStation {
  rank: number;
  station_id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  avg_aqi: number;
  median_aqi: number;
  max_aqi: number;
  p90_aqi: number;
  tier: 'High Pollution' | 'Medium Pollution' | 'Low Pollution';
  tier_color: string;
  primary_driver: string;
  observations_count: number;
}

export interface HotspotsResponse {
  methodology: string;
  thresholds: Record<string, string>;
  stations: HotspotStation[];
  city_average_aqi: number;
  most_polluted_station: string;
  cleanest_station: string;
}

export interface HealthAdvisoryResponse {
  aqi: number;
  category: string;
  severity: string;
  dominant_pollutant: string;
  general_public_advice: string;
  sensitive_groups_advice: string;
  recommended_actions: string[];
  mask_recommendation: string;
  outdoor_activity_guidance: string;
  indoor_ventilation_guidance: string;
  dominant_pollutant_impact: string;
  disclaimer: string;
}

export interface ExposureResponse {
  station_name: string;
  current_aqi: number;
  pm25_level: number;
  estimated_inhaled_pm25_ug: number;
  relative_exposure_level: 'Minimal' | 'Low' | 'Moderate' | 'High' | 'Severe';
  risk_score_100: number;
  recommendations: string[];
  disclaimer: string;
}

export interface AlertItem {
  id: number;
  station_id: string;
  station_name: string;
  threshold: number;
  contact: string | null;
  is_active: boolean;
  created_at: string;
  is_triggered_now: boolean;
  current_aqi: number;
}

export interface ScatterPoint {
  x: number;
  y: number;
  station: string;
  date: string;
}

export interface CorrelationResponse {
  variables: string[];
  matrix: Record<string, Record<string, number>>;
  scatter_aqi_temp: ScatterPoint[];
  scatter_aqi_humidity: ScatterPoint[];
  scatter_aqi_wind: ScatterPoint[];
  scatter_aqi_pm25: ScatterPoint[];
  interpretation: string;
}
