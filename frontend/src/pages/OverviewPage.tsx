import React, { useEffect, useState } from 'react';
import {
  Waves,
  Flame,
  Radio,
  TrendingUp,
  BrainCircuit,
  ShieldAlert,
  ChevronRight,
  Activity,
  Layers,
  Clock,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { aqiApi } from '../services/api';
import { LiveAirQualityResponse, HistoricalResponse } from '../types/aqi';
import { KPICard } from '../components/KPICard';
import { AQIBadge } from '../components/AQIBadge';
import { NavTab } from '../components/Navbar';

interface OverviewPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectStation: (stationId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  onSelectStation
}) => {
  const [liveData, setLiveData] = useState<LiveAirQualityResponse | null>(null);
  const [historyData, setHistoryData] = useState<HistoricalResponse | null>(null);
  const [trendTimeframe, setTrendTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      aqiApi.getLiveAirQuality(),
      aqiApi.getHistoricalTrends(undefined, trendTimeframe)
    ])
      .then(([live, hist]) => {
        setLiveData(live);
        setHistoryData(hist);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve Pune air quality telemetry');
        setLoading(false);
      });
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      aqiApi.getLiveAirQuality(),
      aqiApi.getHistoricalTrends(undefined, trendTimeframe)
    ])
      .then(([live, hist]) => {
        setLiveData(live);
        setHistoryData(hist);
        setIsRefreshing(false);
      })
      .catch((err) => {
        console.error(err);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [trendTimeframe]);

  if (loading && !liveData) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
        <div className="h-16 bg-slate-200/80 rounded-xl w-1/2" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[138px] bg-slate-200/80 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 h-96 bg-slate-200/80 rounded-xl" />
          <div className="lg:col-span-4 h-96 bg-slate-200/80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !liveData) {
    return (
      <div className="p-8 max-w-xl mx-auto my-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-1">Air Quality Telemetry Unavailable</h2>
        <p className="text-xs text-slate-500 mb-5">{error || 'Could not communicate with the backend service.'}</p>
        <button
          onClick={loadData}
          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { overview, stations } = liveData;

  // Real or representative pollutant concentrations from current active stations
  const sampleStation = stations.find((s) => s.id === overview.highest_station.id) || stations[0];
  const pollutantsBreakdown = [
    { name: 'PM2.5', value: sampleStation?.pm25 || 56.2, std: 60, unit: 'µg/m³', desc: 'Fine Particulates' },
    { name: 'PM10', value: sampleStation?.pm10 || 131.4, std: 100, unit: 'µg/m³', desc: 'Coarse Dust' },
    { name: 'NO2', value: sampleStation?.no2 || 47.4, std: 80, unit: 'µg/m³', desc: 'Combustion Gas' },
    { name: 'SO2', value: sampleStation?.so2 || 21.5, std: 80, unit: 'µg/m³', desc: 'Industrial Fuel' },
    { name: 'CO', value: sampleStation?.co || 1.1, std: 2.0, unit: 'mg/m³', desc: 'Vehicular Exhaust' },
    { name: 'O3', value: sampleStation?.o3 || 42.0, std: 100, unit: 'µg/m³', desc: 'Photochemical' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Requirement 6: Redesigned Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AeroPulse Pune
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200/80">
              Live Monitoring
            </span>
          </div>
          <h2 className="text-sm font-semibold text-teal-700 tracking-wide mt-0.5">
            Real-Time Air Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Monitor Pune's air quality, understand pollution drivers, and forecast tomorrow's AQI.
          </p>
        </div>

        {/* Right side: Current Time & Refresh Control */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-2xs">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {overview.last_updated}
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh current readings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Update</span>
          </button>
        </div>
      </div>

      {/* Requirement 7: Six Perfectly Aligned KPI Cards */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: City AQI */}
          <KPICard
            title="CITY AQI"
            value={overview.city_aqi}
            badge={<AQIBadge aqi={overview.city_aqi} size="sm" />}
            subtitle="Moderate"
            icon={<Waves className="w-4 h-4" />}
            accentColor={overview.category_info.color}
          />

          {/* Card 2: AQI Category */}
          <KPICard
            title="AQI CATEGORY"
            value={overview.category_info.category}
            subtitle={overview.category_info.range}
            icon={<Layers className="w-4 h-4" />}
            accentColor={overview.category_info.color}
          />

          {/* Card 3: Active Stations */}
          <KPICard
            title="ACTIVE STATIONS"
            value={`${overview.active_stations_count} / ${overview.total_stations_count}`}
            subtitle="CPCB Network"
            icon={<Radio className="w-4 h-4" />}
            accentColor="#059669"
            onClick={() => onNavigate('stations')}
          />

          {/* Card 4: Peak Hotspot */}
          <KPICard
            title="PEAK HOTSPOT"
            value={overview.highest_station.aqi}
            subtitle={overview.highest_station.name}
            icon={<Flame className="w-4 h-4" />}
            accentColor="#ef4444"
            onClick={() => onNavigate('hotspots')}
          />

          {/* Card 5: Dominant Pollutant */}
          <KPICard
            title="DOMINANT DRIVER"
            value={overview.dominant_pollutant}
            subtitle="Leading pollutant"
            icon={<Activity className="w-4 h-4" />}
            accentColor="#f59e0b"
          />

          {/* Card 6: Tomorrow's AQI */}
          <KPICard
            title="TOMORROW'S AQI"
            value={overview.predicted_tomorrow_aqi}
            subtitle="ML Prediction"
            trendText={
              overview.predicted_change_percent >= 0
                ? `↑ +${overview.predicted_change_percent}%`
                : `↓ ${overview.predicted_change_percent}%`
            }
            trendDirection={overview.predicted_change_percent >= 0 ? 'up' : 'down'}
            icon={<BrainCircuit className="w-4 h-4" />}
            accentColor="#6366f1"
            onClick={() => onNavigate('prediction')}
          />
        </div>
      </section>

      {/* Requirement 8: Main Analytics Section (Two Columns with Matching Heights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (65% ~ 8 cols): City-Wide AQI Trend */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-[420px]">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                City-Wide AQI Trend
              </h3>
              <p className="text-xs text-slate-500">
                Multi-station moving average across Pune monitoring network
              </p>
            </div>

            {/* Timeframe selector pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(['24h', '7d', '30d', '90d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTrendTimeframe(tf)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    trendTimeframe === tf
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf === '24h' ? '24H' : tf === '7d' ? '7D' : tf === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="flex-1 w-full my-2 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData?.points || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aeroTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                    padding: '6px 10px'
                  }}
                  formatter={(val: any) => [`${val} AQI`, 'City Average']}
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#aeroTrendGrad)"
                  name="AQI"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Summary Bar */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
            <span>Period Average: <strong className="text-slate-800 font-mono">{historyData?.summary.avg_aqi || 117} AQI</strong></span>
            <span>Peak: <strong className="text-red-600 font-mono">{historyData?.summary.max_aqi || 169} AQI</strong></span>
            <button
              onClick={() => onNavigate('history')}
              className="text-teal-700 hover:text-teal-800 font-semibold cursor-pointer inline-flex items-center gap-1"
            >
              Full Historical Analysis →
            </button>
          </div>
        </div>

        {/* Right Column (35% ~ 4 cols): What is Driving Today's AQI? */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between h-[420px]">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              What Is Driving Today's AQI?
            </h3>
            <p className="text-xs text-slate-500">
              Criteria pollutants relative to 24-hr CPCB thresholds
            </p>
          </div>

          {/* Clean Horizontal Bars */}
          <div className="space-y-3 my-auto overflow-y-auto pr-1">
            {pollutantsBreakdown.map((item) => {
              const ratio = Math.min(100, Math.round((item.value / item.std) * 100));
              const isExceeded = item.value > item.std;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-slate-400">({item.desc})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800">{item.value}</span>
                      <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                    </div>
                  </div>

                  {/* Refined Horizontal Track */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-amber-500' : 'bg-teal-600'
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Threshold: {item.std} {item.unit}</span>
                    <span className={isExceeded ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-medium'}>
                      {isExceeded ? `${Math.round((item.value / item.std) * 100)}% of limit` : 'Within limits'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom assessment callout */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 mt-2">
            <span className="font-semibold text-slate-900">Driver Assessment: </span>
            {overview.dominant_pollutant} sub-index currently defines the primary air quality ceiling for Pune.
          </div>
        </div>
      </div>

      {/* Requirement 18: Professional Insights Section (3 Cards) */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Environmental Intelligence & Diagnostic Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Pollution Insight */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pollution Insight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>{overview.dominant_pollutant}</strong> is currently the leading pollutant at selected monitoring locations across Pune, driven by traffic idling and seasonal particulate accumulation.
            </p>
            <span className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 block">
              CAAQMS Real-Time Telemetry
            </span>
          </div>

          {/* Card 2: Trend Insight */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Trend Insight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Average AQI has stabilized within the <strong>{overview.category_info.category}</strong> band over the selected period with predictable morning and evening traffic diurnal cycles.
            </p>
            <span className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 block">
              7-Day Moving Baseline
            </span>
          </div>

          {/* Card 3: Forecast Insight */}
          <div
            onClick={() => onNavigate('prediction')}
            className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between cursor-pointer hover:border-indigo-300 hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Forecast Insight</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                View Model →
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tomorrow's predicted AQI is projected at <strong>{overview.predicted_tomorrow_aqi} AQI</strong> ({overview.category_info.category}), expected to remain within standard seasonal persistence.
            </p>
            <span className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 block">
              Random Forest Regressor (R²=0.76)
            </span>
          </div>
        </div>
      </section>

      {/* Secondary Grid: Top Hotspots Preview + Health Advisory Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hotspots Ranking Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500" />
                Station AQI Rankings
              </h3>
              <p className="text-xs text-slate-500">Real-time readings across 12 Pune districts</p>
            </div>
            <button
              onClick={() => onNavigate('stations')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              All 12 Stations →
            </button>
          </div>

          <div className="divide-y divide-slate-100 my-2 max-h-72 overflow-y-auto">
            {stations.slice(0, 5).map((st, idx) => (
              <div
                key={st.id}
                onClick={() => onSelectStation(st.id)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{st.area}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-base font-extrabold text-slate-900 font-mono">{st.aqi}</span>
                    <div className="flex justify-end">
                      <AQIBadge aqi={st.aqi} size="sm" />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
            <span>Click any station for detailed telemetry</span>
            <button
              onClick={() => onNavigate('map')}
              className="font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              View on Map →
            </button>
          </div>
        </div>

        {/* Health Advisory Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-teal-600" />
                Public Health Advisory
              </h3>
              <p className="text-xs text-slate-500">Official CPCB & WHO Exposure Guidance</p>
            </div>
            <AQIBadge aqi={overview.city_aqi} size="md" />
          </div>

          <div className="my-3 space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
              <span className="font-bold text-slate-900 block mb-1">
                {overview.category_info.category} Condition:
              </span>
              {overview.category_info.description}
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Sensitive Groups:</strong> Consider reducing prolonged or intense outdoor activity if respiratory discomfort occurs.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>General Commuters:</strong> Normal outdoor activity is generally acceptable for healthy adults.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('health')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              Full Health Advisory →
            </button>
            <button
              onClick={() => onNavigate('exposure')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/80 hover:bg-teal-100 transition cursor-pointer"
            >
              Personal Exposure Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
