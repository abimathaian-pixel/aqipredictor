import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Building,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { aqiApi } from '../services/api';
import { HistoricalResponse, StationResponse } from '../types/aqi';
import { AQIBadge } from '../components/AQIBadge';

export const HistoricalTrendsPage: React.FC = () => {
  const [stations, setStations] = useState<StationResponse[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>(''); // empty string = City Average
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [data, setData] = useState<HistoricalResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stations dropdown list
  useEffect(() => {
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setStations(res.stations as any);
      })
      .catch((err) => console.error(err));
  }, []);

  // Load historical data whenever station or timeframe changes
  useEffect(() => {
    setLoading(true);
    aqiApi.getHistoricalTrends(selectedStation || undefined, timeframe)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedStation, timeframe]);

  const timeframes = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '3 Months' },
    { id: '180d', label: '6 Months' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-600" />
            Historical Trends & Atmospheric Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore multi-month atmospheric time series, particulate trends, and diurnal cycles across Pune
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Station dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
            >
              <option value="">All Pune (City Average)</option>
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average AQI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{data.summary.avg_aqi}</span>
              <AQIBadge aqi={data.summary.avg_aqi} size="sm" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">In selected timeframe</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Peak AQI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-red-600">{data.summary.max_aqi}</span>
              <span className="text-xs font-semibold text-red-600">High mark</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Maximum concentration episode</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cleanest AQI
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600">{data.summary.min_aqi}</span>
              <span className="text-xs font-semibold text-emerald-600">Clean mark</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Favorable meteorological dispersion</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Observations
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">{data.summary.count}</span>
              <span className="text-xs text-slate-500 font-medium">data points</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Chronological telemetry records</span>
          </div>
        </div>
      )}

      {/* Chart 1: Main AQI Time Series */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Air Quality Index (AQI) Progression
            </h3>
            <p className="text-xs text-slate-500">
              Monitoring {data?.station_name} across {timeframe} window
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-600 rounded-full" /> AQI Index
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.points || []}>
                <defs>
                  <linearGradient id="historyAqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#64748b' }} />
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
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#historyAqiGrad)"
                  name="AQI"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2 & 3: Multi-Pollutant Comparison & Diurnal Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Pollutant Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Multi-Pollutant Trajectories (PM2.5, PM10, NO2, O3)
            </h3>
            <p className="text-xs text-slate-500">Comparative microgram concentrations (µg/m³)</p>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.points || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2} dot={false} name="PM2.5" />
                <Line type="monotone" dataKey="pm10" stroke="#f59e0b" strokeWidth={1.8} dot={false} name="PM10" />
                <Line type="monotone" dataKey="no2" stroke="#3b82f6" strokeWidth={1.8} dot={false} name="NO2" />
                <Line type="monotone" dataKey="o3" stroke="#10b981" strokeWidth={1.8} dot={false} name="O3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diurnal Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Diurnal Distribution / Periodic Variation
            </h3>
            <p className="text-xs text-slate-500">Sampled variation pattern across recording timestamps</p>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.points || []).slice(-16)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="aqi" fill="#0284c7" radius={[4, 4, 0, 0]} name="AQI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
