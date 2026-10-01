import {
  LiveAirQualityResponse,
  StationDetailResponse,
  HistoricalResponse,
  PredictionResponse,
  ModelMetricsResponse,
  HotspotsResponse,
  HealthAdvisoryResponse,
  ExposureResponse,
  AlertItem,
  CorrelationResponse
} from '../types/aqi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
  }
  return res.json();
}

export const aqiApi = {
  getLiveAirQuality: () => fetchJson<LiveAirQualityResponse>(`${BASE_URL}/air-quality/live`),

  getStationDetails: (stationId: string) =>
    fetchJson<StationDetailResponse>(`${BASE_URL}/stations/${stationId}`),

  getHistoricalTrends: (stationId?: string, timeframe: string = '7d') => {
    const params = new URLSearchParams();
    if (stationId) params.append('station_id', stationId);
    params.append('timeframe', timeframe);
    return fetchJson<HistoricalResponse>(`${BASE_URL}/air-quality/history?${params.toString()}`);
  },

  getPrediction: (stationId: string, targetDate?: string) => {
    const url = targetDate
      ? `${BASE_URL}/predictions/${stationId}?target_date=${encodeURIComponent(targetDate)}`
      : `${BASE_URL}/predictions/${stationId}`;
    return fetchJson<PredictionResponse>(url);
  },

  postPrediction: (payload: { station_id: string; target_date?: string }) =>
    fetchJson<PredictionResponse>(`${BASE_URL}/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getModelMetrics: () => fetchJson<ModelMetricsResponse>(`${BASE_URL}/model/metrics`),

  getHotspots: () => fetchJson<HotspotsResponse>(`${BASE_URL}/hotspots`),

  getHealthAdvisory: (stationId?: string) => {
    const url = stationId ? `${BASE_URL}/health-advisory?station_id=${stationId}` : `${BASE_URL}/health-advisory`;
    return fetchJson<HealthAdvisoryResponse>(url);
  },

  compareStations: (stationIds: string[]) =>
    fetchJson<{ stations: any[] }>(`${BASE_URL}/comparison?stations=${stationIds.join(',')}`),

  calculateExposure: (payload: {
    station_id: string;
    hours_outdoors: number;
    commute_duration_mins: number;
    commute_mode: string;
    activity_intensity: string;
  }) =>
    fetchJson<ExposureResponse>(`${BASE_URL}/exposure/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getAlerts: () => fetchJson<AlertItem[]>(`${BASE_URL}/alerts`),

  createAlert: (payload: {
    station_id: string;
    threshold: number;
    contact?: string;
    notify_method?: string;
  }) =>
    fetchJson<AlertItem>(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  deleteAlert: (alertId: number) =>
    fetchJson<{ message: string }>(`${BASE_URL}/alerts/${alertId}`, {
      method: 'DELETE'
    }),

  getCorrelation: () => fetchJson<CorrelationResponse>(`${BASE_URL}/correlation`)
};
