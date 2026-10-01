import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Building,
  Info
} from 'lucide-react';
import { aqiApi } from '../services/api';
import { LiveAirQualityResponse, LiveStationItem } from '../types/aqi';
import { AQIBadge } from '../components/AQIBadge';
import { CPCB_CATEGORIES } from '../utils/aqiCategory';

interface LiveStationsPageProps {
  onSelectStation: (stationId: string) => void;
}

export const LiveStationsPage: React.FC<LiveStationsPageProps> = ({ onSelectStation }) => {
  const [data, setData] = useState<LiveAirQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'aqi_desc' | 'aqi_asc' | 'pm25_desc' | 'name_asc'>('aqi_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const loadData = () => {
    setLoading(true);
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load stations', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-16 bg-slate-200 rounded-xl" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const stations = data?.stations || [];

  // Filter & Search
  const filteredStations = stations.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.operator.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      st.category_info.category.toUpperCase() === categoryFilter.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  // Sort
  const sortedStations = [...filteredStations].sort((a, b) => {
    if (sortBy === 'aqi_desc') return b.aqi - a.aqi;
    if (sortBy === 'aqi_asc') return a.aqi - b.aqi;
    if (sortBy === 'pm25_desc') return (b.pm25 || 0) - (a.pm25 || 0);
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pune Live Monitoring Stations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Continuous Ambient Air Quality Monitoring Stations (CAAQMS) reporting across PMC & PCMC
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition ${
                viewMode === 'cards' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, area, or operator (e.g. Shivajinagar, Bhosari, SAFAR)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="aqi_desc">Sort by AQI (Highest First)</option>
              <option value="aqi_asc">Sort by AQI (Lowest First)</option>
              <option value="pm25_desc">Sort by PM2.5</option>
              <option value="name_asc">Sort by Station Name</option>
            </select>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter by AQI Category:
          </span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Stations ({stations.length})
          </button>
          {CPCB_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategoryFilter(cat.name)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                categoryFilter.toUpperCase() === cat.name.toUpperCase()
                  ? 'ring-2 ring-slate-900'
                  : ''
              }`}
              style={{
                backgroundColor: cat.bg,
                color: cat.text,
                borderColor: cat.color
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Station count info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{sortedStations.length}</strong> of {stations.length} monitoring stations
        </span>
        <span>Click any station for detailed 24h & 7d pollutant breakdown</span>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Station & Area</th>
                  <th className="py-3 px-4 text-center">AQI</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-3 text-right">PM2.5 (µg/m³)</th>
                  <th className="py-3 px-3 text-right">PM10 (µg/m³)</th>
                  <th className="py-3 px-3 text-right">NO2 (µg/m³)</th>
                  <th className="py-3 px-3 text-right">SO2 (µg/m³)</th>
                  <th className="py-3 px-3 text-center">Trend (24h)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStations.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStation(st.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {st.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{st.area}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-extrabold text-base text-slate-900">{st.aqi}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <AQIBadge aqi={st.aqi} size="sm" />
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800">
                      {st.pm25 !== null ? st.pm25 : '--'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800">
                      {st.pm10 !== null ? st.pm10 : '--'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800">
                      {st.no2 !== null ? st.no2 : '--'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800">
                      {st.so2 !== null ? st.so2 : '--'}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {st.trend === 'up' ? (
                        <span className="inline-flex items-center text-xs text-amber-600 font-semibold gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" /> +{st.change_24h}
                        </span>
                      ) : st.trend === 'down' ? (
                        <span className="inline-flex items-center text-xs text-emerald-600 font-semibold gap-0.5">
                          <TrendingDown className="w-3.5 h-3.5" /> {st.change_24h}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-slate-400 font-medium gap-0.5">
                          <Minus className="w-3.5 h-3.5" /> Stable
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer">
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStations.map((st) => (
            <div
              key={st.id}
              onClick={() => onSelectStation(st.id)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{st.name}</h3>
                    <p className="text-xs text-slate-500">{st.area}</p>
                  </div>
                  <AQIBadge aqi={st.aqi} size="sm" />
                </div>

                <div className="flex items-baseline gap-3 my-3">
                  <span className="text-3xl font-extrabold text-slate-900">{st.aqi}</span>
                  <span className="text-xs text-slate-500 font-medium">
                    Dominant: <strong className="text-slate-800">{st.dominant_pollutant}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">PM2.5</span>
                    <span className="font-bold text-slate-800">{st.pm25 || '--'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">PM10</span>
                    <span className="font-bold text-slate-800">{st.pm10 || '--'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">NO2</span>
                    <span className="font-bold text-slate-800">{st.no2 || '--'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{st.operator}</span>
                <span className="text-emerald-700 font-semibold">View Station →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
