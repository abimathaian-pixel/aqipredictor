import React, { useEffect, useState } from 'react';
import { X, MapPin, Building, ShieldCheck, Thermometer, Droplets, Wind, AlertCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { aqiApi } from '../services/api';
import { StationDetailResponse } from '../types/aqi';
import { AQIBadge } from './AQIBadge';

interface StationDetailModalProps {
  stationId: string | null;
  onClose: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({ stationId, onClose }) => {
  const [data, setData] = useState<StationDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) return;

    setLoading(true);
    setError(null);
    aqiApi
      .getStationDetails(stationId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load station details');
        setLoading(false);
      });
  }, [stationId]);

  if (!stationId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {data ? data.station.name : 'Loading Station Details...'}
              </h2>
              {data && <AQIBadge aqi={data.current.aqi} size="lg" showRange />}
            </div>
            {data && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {data.station.area}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {data.station.operator}
                </span>
                <span>Type: {data.station.station_type}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close station modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Retrieving station telemetry & time-series data...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Failed to load station data</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Dominant Pollutant Analysis Callout */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                    Primary Pollutant Assessment
                  </h4>
                  <p className="text-sm text-amber-900/90 font-medium mt-0.5">
                    {data.current.analysis_statement}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Last calibrated: {data.current.last_updated}
                  </p>
                </div>
              </div>

              {/* Weather indicators if available */}
              {(data.current.temperature || data.current.humidity || data.current.wind_speed) && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Temperature</p>
                      <p className="text-sm font-bold text-slate-800">{data.current.temperature}°C</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Humidity</p>
                      <p className="text-sm font-bold text-slate-800">{data.current.humidity}%</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Wind className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Wind Speed</p>
                      <p className="text-sm font-bold text-slate-800">{data.current.wind_speed} km/h</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6 Pollutant Cards */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Pollutant Breakdown & CPCB Thresholds
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(data.current.pollutants).map(([poll, details]) => {
                    const isDominant = poll === data.current.dominant_pollutant;
                    return (
                      <div
                        key={poll}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isDominant
                            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-800">{poll}</span>
                          {isDominant && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                              Dominant
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 my-1">
                          {details.value !== null ? details.value : '--'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">{details.unit}</p>
                        <p className="text-[9px] text-slate-400 mt-1 truncate" title={details.standard}>
                          Std: {details.standard}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 24-Hour Hourly Trend Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    24-Hour Diurnal AQI Trend
                  </h3>
                  <span className="text-xs text-slate-400">Hourly Telemetry</span>
                </div>
                <div className="h-52 bg-slate-50/60 rounded-xl border border-slate-200 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.history_24h}>
                      <defs>
                        <linearGradient id="stationAqiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="aqi"
                        stroke="#0284c7"
                        strokeWidth={2}
                        fill="url(#stationAqiGrad)"
                        name="AQI"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 7-Day Particulate Matter Trend (PM2.5 vs PM10) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    7-Day Particulate Concentrations (PM2.5 vs PM10)
                  </h3>
                  <span className="text-xs text-slate-400">4-Hour Intervals</span>
                </div>
                <div className="h-52 bg-slate-50/60 rounded-xl border border-slate-200 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.history_7d}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pm25"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={false}
                        name="PM2.5 (µg/m³)"
                      />
                      <Line
                        type="monotone"
                        dataKey="pm10"
                        stroke="#d97706"
                        strokeWidth={2}
                        dot={false}
                        name="PM10 (µg/m³)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Station Description */}
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Station Profile: </span>
                {data.station.description} (Baseline AQI index: {data.station.baseline_aqi})
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Source: CPCB / MPCB CAAQMS Network</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
