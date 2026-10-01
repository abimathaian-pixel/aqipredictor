import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { aqiApi } from '../services/api';
import { CorrelationResponse } from '../types/aqi';

export const CorrelationPage: React.FC = () => {
  const [data, setData] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScatter, setActiveScatter] = useState<'temp' | 'humidity' | 'wind' | 'pm25'>('pm25');

  useEffect(() => {
    aqiApi.getCorrelation()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-64 bg-slate-200 rounded-xl" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const scatterConfigs = {
    pm25: {
      title: 'AQI vs PM2.5 Concentration',
      data: data?.scatter_aqi_pm25 || [],
      xLabel: 'PM2.5 Concentration (µg/m³)',
      r: data?.matrix['aqi']?.['pm25'] ?? 0.85,
      color: '#ef4444',
      insight: 'Dominant linear driver: PM2.5 sub-index defines the maximum AQI envelope across most Pune stations.'
    },
    wind: {
      title: 'AQI vs Wind Speed',
      data: data?.scatter_aqi_wind || [],
      xLabel: 'Wind Speed (km/h)',
      r: data?.matrix['aqi']?.['wind_speed'] ?? -0.42,
      color: '#059669',
      insight: 'Negative dispersion dynamic: Higher wind speeds facilitate atmospheric ventilation, diluting surface boundary pollutants.'
    },
    humidity: {
      title: 'AQI vs Relative Humidity',
      data: data?.scatter_aqi_humidity || [],
      xLabel: 'Relative Humidity (%)',
      r: data?.matrix['aqi']?.['humidity'] ?? -0.38,
      color: '#0284c7',
      insight: 'Moisture & precipitation: Monsoon rains wash out airborne particles (wet deposition), producing the lowest annual AQI.'
    },
    temp: {
      title: 'AQI vs Ambient Temperature',
      data: data?.scatter_aqi_temp || [],
      xLabel: 'Ambient Temperature (°C)',
      r: data?.matrix['aqi']?.['temperature'] ?? 0.28,
      color: '#f59e0b',
      insight: 'Inversion & photochemical interactions: Thermal inversions trap morning pollutants during cool winter nights, while heat fuels afternoon Ozone.'
    }
  };

  const currentConfig = scatterConfigs[activeScatter];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ScatterChart className="w-6 h-6 text-teal-600" />
          Environmental & Meteorological Correlation Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Bivariate Pearson correlation matrices and empirical scatter plots investigating weather influences on Pune air quality
        </p>
      </div>

      {/* Mandatory Statistical Distinction Banner */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Scientific Principle: Correlation ≠ Causation</span>
          Empirical statistical correlation identifies concurrent mathematical association between meteorological
          variables and ambient air quality. Changes in ambient temperature, wind, and humidity influence boundary layer
          dynamics and particulate dispersion, but emission sources (combustion, road dust, industry) remain the primary root drivers.
        </div>
      </div>

      {/* Pearson Correlation Heatmap Matrix Table */}
      {data && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pearson Correlation Coefficient Matrix (r)
              </h3>
              <p className="text-xs text-slate-500">
                Values range from -1.0 (strong inverse association) to +1.0 (strong direct association)
              </p>
            </div>
            <span className="text-xs text-slate-400">Sample: 400 Telemetry Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Variable</th>
                  <th className="py-2.5 px-3">AQI</th>
                  <th className="py-2.5 px-3">PM2.5</th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Humidity</th>
                  <th className="py-2.5 px-3">Wind Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {['aqi', 'pm25', 'temperature', 'humidity', 'wind_speed'].map((rowVar) => (
                  <tr key={rowVar} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-left font-bold font-sans text-slate-800 uppercase text-xs">
                      {rowVar.replace('_', ' ')}
                    </td>
                    {['aqi', 'pm25', 'temperature', 'humidity', 'wind_speed'].map((colVar) => {
                      const val = data.matrix[rowVar]?.[colVar] ?? 0;
                      const isHighPos = val >= 0.7;
                      const isModPos = val >= 0.2 && val < 0.7;
                      const isNeg = val <= -0.2;
                      return (
                        <td key={colVar} className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-semibold text-xs ${
                              isHighPos
                                ? 'bg-red-100 text-red-800'
                                : isModPos
                                ? 'bg-amber-100 text-amber-800'
                                : isNeg
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {val.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Scatter Plot Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">{currentConfig.title}</h3>
            <p className="text-xs text-slate-500">
              Pearson correlation: <strong className="font-mono">{currentConfig.r}</strong>
            </p>
          </div>

          {/* Scatter variable selector tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveScatter('pm25')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                activeScatter === 'pm25'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              PM2.5 vs AQI
            </button>
            <button
              onClick={() => setActiveScatter('wind')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                activeScatter === 'wind'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Wind Speed
            </button>
            <button
              onClick={() => setActiveScatter('humidity')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                activeScatter === 'humidity'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Humidity
            </button>
            <button
              onClick={() => setActiveScatter('temp')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                activeScatter === 'temp'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Temperature
            </button>
          </div>
        </div>

        {/* Scatter Canvas */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="x"
                name={currentConfig.xLabel}
                unit=""
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{
                  value: currentConfig.xLabel,
                  position: 'insideBottom',
                  offset: -10,
                  fontSize: 11,
                  fill: '#64748b'
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="AQI"
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{
                  value: 'Air Quality Index (AQI)',
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 11,
                  fill: '#64748b'
                }}
              />
              <ZAxis range={[50, 50]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                        <div className="font-bold text-slate-200">{d.station} ({d.date})</div>
                        <div>{currentConfig.xLabel}: <strong>{d.x}</strong></div>
                        <div>AQI: <strong>{d.y}</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={currentConfig.data} fill={currentConfig.color} />
            </RechartsScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Physical Interpretation */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <span className="font-bold text-slate-900">Meteorological Mechanics: </span>
          {currentConfig.insight}
        </div>
      </div>
    </div>
  );
};
