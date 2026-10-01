import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  Info,
  Building,
  CheckCircle2,
  TrendingUp,
  MapPin
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { aqiApi } from '../services/api';
import { HotspotsResponse, HotspotStation } from '../types/aqi';

export const HotspotsPage: React.FC = () => {
  const [data, setData] = useState<HotspotsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aqiApi.getHotspots()
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

  const stations = data?.stations || [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-red-500" />
          Pollution Hotspots & Microclimate Classification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Historical ambient air quality tiers distinguishing chronic industrial, traffic corridors, and ecological buffer zones
        </p>
      </div>

      {/* Analytical Tier Disclaimer Card */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">
            Methodology Note: Project-Defined Analytical Tiers
          </span>
          <p className="leading-relaxed">
            {data?.methodology}
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Highest Chronic Hotspot
              </span>
              <div className="text-xl font-bold text-slate-900">{data.most_polluted_station}</div>
              <span className="text-xs text-red-600 font-medium">Persistent industrial & transit burden</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cleanest Urban Enclave
              </span>
              <div className="text-xl font-bold text-slate-900">{data.cleanest_station}</div>
              <span className="text-xs text-emerald-600 font-medium">Ecological green belt & research campus</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                City Historical Average
              </span>
              <div className="text-xl font-bold text-slate-900">{data.city_average_aqi} AQI</div>
              <span className="text-xs text-slate-500 font-medium">Aggregated cross-district mean</span>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Bar Chart: Station Hotspot Ranking */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Station Ranking by Historical Mean AQI
            </h3>
            <p className="text-xs text-slate-500">
              Color reflects project analytical tier (Red: High &gt;150, Amber: Medium 100-150, Green: Low &lt;100)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-3 h-3 bg-red-600 rounded-sm" /> High (&gt;150)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-3 h-3 bg-amber-600 rounded-sm" /> Medium (100–150)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 bg-emerald-600 rounded-sm" /> Low (&lt;100)
            </span>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={stations}
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 220]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${val} AQI`, 'Historical Mean']}
              />
              <Bar dataKey="avg_aqi" radius={[0, 4, 4, 0]}>
                {stations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.tier_color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Hotspot Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Station Hotspot Diagnostics & Primary Environmental Drivers
          </h3>
          <p className="text-xs text-slate-500">
            Statistical distribution metrics and local urban morphology factors
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Station & Area</th>
                <th className="py-3 px-3 text-center">Analytical Tier</th>
                <th className="py-3 px-3 text-right">Mean AQI</th>
                <th className="py-3 px-3 text-right">Median AQI</th>
                <th className="py-3 px-3 text-right">90th Pct AQI</th>
                <th className="py-3 px-3 text-right">Max AQI</th>
                <th className="py-3 px-4">Primary Environmental Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stations.map((st) => (
                <tr key={st.station_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    #{st.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{st.name}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{st.area}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor:
                          st.tier === 'High Pollution'
                            ? '#fef2f2'
                            : st.tier === 'Medium Pollution'
                            ? '#fffbeb'
                            : '#f0fdf4',
                        color: st.tier_color,
                        border: `1px solid ${st.tier_color}40`
                      }}
                    >
                      {st.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 font-mono">
                    {st.avg_aqi}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700 font-mono">
                    {st.median_aqi}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700 font-mono">
                    {st.p90_aqi}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-red-600 font-mono">
                    {st.max_aqi}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600 leading-relaxed max-w-md">
                    {st.primary_driver}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
