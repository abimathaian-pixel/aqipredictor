import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  X,
  Building,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import {
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
import { StationResponse } from '../types/aqi';
import { AQIBadge } from '../components/AQIBadge';

const STATION_COLORS = ['#059669', '#3b82f6', '#ef4444', '#f59e0b'];

export const CompareAreasPage: React.FC = () => {
  const [allStations, setAllStations] = useState<StationResponse[]>([]);
  const [selectedStationIds, setSelectedStationIds] = useState<string[]>([
    'station-shivajinagar',
    'station-hadapsar',
    'station-pashan'
  ]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all stations list
  useEffect(() => {
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setAllStations(res.stations as any);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch comparison data when selectedStationIds change
  useEffect(() => {
    if (selectedStationIds.length < 2) return;
    setLoading(true);
    aqiApi.compareStations(selectedStationIds)
      .then((res) => {
        setComparisonData(res.stations || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedStationIds]);

  const toggleStation = (stationId: string) => {
    if (selectedStationIds.includes(stationId)) {
      if (selectedStationIds.length <= 2) {
        alert('Please keep at least 2 stations selected for comparison.');
        return;
      }
      setSelectedStationIds(selectedStationIds.filter((id) => id !== stationId));
    } else {
      if (selectedStationIds.length >= 4) {
        alert('You can compare a maximum of 4 stations simultaneously.');
        return;
      }
      setSelectedStationIds([...selectedStationIds, stationId]);
    }
  };

  // Prepare combined synchronized 7-day trend dataset
  const trendMerged: Record<string, any> = {};
  comparisonData.forEach((st) => {
    (st.trend_7d || []).forEach((pt: any) => {
      if (!trendMerged[pt.time]) {
        trendMerged[pt.time] = { time: pt.time };
      }
      trendMerged[pt.time][st.name] = pt.aqi;
    });
  });
  const trendDataArray = Object.values(trendMerged);

  // Prepare pollutant comparative bar data
  const pollutantBarData = comparisonData.map((st) => ({
    name: st.name,
    'PM2.5': st.pm25,
    'PM10': st.pm10,
    'NO2': st.no2
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-teal-600" />
          Compare Monitoring Corridors & Microclimates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Side-by-side atmospheric comparison across 2 to 4 Pune stations with synchronized trends and pollutant metrics
        </p>
      </div>

      {/* Station Selector Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          Select Stations to Compare (Choose 2 to 4):
        </span>
        <div className="flex flex-wrap gap-2">
          {allStations.map((st) => {
            const isSelected = selectedStationIds.includes(st.id);
            return (
              <button
                key={st.id}
                onClick={() => toggleStation(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, comparisonData.length)} gap-4`}>
        {comparisonData.map((st, index) => (
          <div
            key={st.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            {/* Station Accent Header line */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: STATION_COLORS[index % STATION_COLORS.length] }}
            />

            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{st.name}</h3>
                  <p className="text-xs text-slate-500">{st.area}</p>
                </div>
                <AQIBadge aqi={st.current_aqi} size="sm" />
              </div>

              <div className="my-3">
                <span className="text-xs text-slate-400 block font-medium">Current AQI</span>
                <span className="text-4xl font-black text-slate-900">{st.current_aqi}</span>
              </div>

              {/* Metrics Table */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>30-Day Mean:</span>
                  <strong className="text-slate-900 font-mono">{st.avg_30d} AQI</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tomorrow (ML Forecast):</span>
                  <strong className="text-indigo-600 font-mono">{st.predicted_aqi} AQI</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PM2.5 Concentration:</span>
                  <strong className="text-slate-900 font-mono">{st.pm25 ?? '--'} µg/m³</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PM10 Concentration:</span>
                  <strong className="text-slate-900 font-mono">{st.pm10 ?? '--'} µg/m³</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>NO2 Concentration:</span>
                  <strong className="text-slate-900 font-mono">{st.no2 ?? '--'} µg/m³</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Station #{index + 1} comparison baseline
            </div>
          </div>
        ))}
      </div>

      {/* Synchronized 7-Day Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Synchronized 7-Day Air Quality Trajectory Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Comparative chronological time series across selected stations
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Hourly Telemetry</span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendDataArray}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
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
              {comparisonData.map((st, i) => (
                <Line
                  key={st.id}
                  type="monotone"
                  dataKey={st.name}
                  stroke={STATION_COLORS[i % STATION_COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pollutant Comparative Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Current Particulate & Gaseous Concentrations
          </h3>
          <p className="text-xs text-slate-500">
            Comparing PM2.5, PM10, and NO2 across selected locations
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pollutantBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
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
              <Bar dataKey="PM2.5" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="PM10" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="NO2" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
