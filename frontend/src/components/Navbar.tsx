import React, { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  MapPin,
  TrendingUp,
  BrainCircuit,
  Flame,
  ShieldAlert,
  GitCompare,
  Calculator,
  BellRing,
  ScatterChart,
  Info,
  Menu,
  X,
  RefreshCw,
  Waves
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'stations'
  | 'map'
  | 'history'
  | 'prediction'
  | 'hotspots'
  | 'health'
  | 'compare'
  | 'exposure'
  | 'alerts'
  | 'correlation'
  | 'about';

export const TAB_HASH_MAP: Record<NavTab, string> = {
  overview: '#/overview',
  stations: '#/live-stations',
  map: '#/air-quality-map',
  history: '#/historical-trends',
  prediction: '#/aqi-prediction',
  hotspots: '#/pollution-hotspots',
  health: '#/health-advisory',
  compare: '#/compare-areas',
  exposure: '#/exposure',
  alerts: '#/alerts',
  correlation: '#/correlation',
  about: '#/about'
};

export const HASH_TO_TAB: Record<string, NavTab> = {
  '#/overview': 'overview',
  '#/live-stations': 'stations',
  '#/air-quality-map': 'map',
  '#/map': 'map',
  '#/historical-trends': 'history',
  '#/history': 'history',
  '#/aqi-prediction': 'prediction',
  '#/prediction': 'prediction',
  '#/pollution-hotspots': 'hotspots',
  '#/hotspots': 'hotspots',
  '#/health-advisory': 'health',
  '#/health': 'health',
  '#/compare-areas': 'compare',
  '#/compare': 'compare',
  '#/exposure': 'exposure',
  '#/exposure-calculator': 'exposure',
  '#/alerts': 'alerts',
  '#/correlation': 'correlation',
  '#/about': 'about',
  '': 'overview',
  '#/': 'overview'
};

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDemoMode: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { id: 'stations', label: 'Live Stations', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'map', label: 'Air Quality Map', icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'history', label: 'Historical Trends', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'prediction', label: 'AQI Prediction', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
  { id: 'hotspots', label: 'Pollution Hotspots', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'health', label: 'Health Advisory', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  { id: 'compare', label: 'Compare Areas', icon: <GitCompare className="w-3.5 h-3.5" /> },
  { id: 'exposure', label: 'Exposure', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'alerts', label: 'Alerts', icon: <BellRing className="w-3.5 h-3.5" /> },
  { id: 'correlation', label: 'Correlation', icon: <ScatterChart className="w-3.5 h-3.5" /> },
  { id: 'about', label: 'About', icon: <Info className="w-3.5 h-3.5" /> },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  lastUpdated,
  onRefresh,
  isRefreshing = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (id: NavTab, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveTab(id);
    window.location.hash = TAB_HASH_MAP[id] || '#/overview';
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top Status Bar: Requirement 4 */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/20 animate-pulse" />
              <span>
                <strong>Demo Mode</strong> — Live CPCB data currently unavailable
              </span>
              <span className="text-slate-400 text-[11px] hidden md:inline">
                • Using verified realistic Pune baseline data
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
              <span>
                <strong>Live Data</strong> — CPCB / MPCB Connected
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-xs">
          <span className="hidden sm:inline">
            Source: <strong className="text-slate-300">CPCB / MPCB / data.gov.in</strong>
          </span>
          {lastUpdated && (
            <span>
              Last Updated: <strong className="text-slate-300">{lastUpdated}</strong>
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh telemetry readings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={(e) => handleTabClick('overview', e)}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400 shadow-xs group-hover:bg-slate-800 transition-colors">
              <Waves className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  AeroPulse
                </span>
                <span className="font-bold text-teal-600 text-base tracking-tight">
                  Pune
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wide font-medium mt-0.5 hidden sm:block">
                Real-Time Air Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleTabClick(item.id, e)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-teal-300' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Tablet Sub-Navigation Indicator or Quick Route */}
          <div className="hidden lg:flex xl:hidden items-center gap-1 text-xs">
            <button
              onClick={(e) => handleTabClick('overview', e)}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={(e) => handleTabClick('stations', e)}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                activeTab === 'stations' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Stations
            </button>
            <button
              onClick={(e) => handleTabClick('map', e)}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                activeTab === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Map
            </button>
            <button
              onClick={(e) => handleTabClick('prediction', e)}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                activeTab === 'prediction' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              AQI Prediction
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100"
              aria-label="More tabs"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white shadow-lg animate-in fade-in duration-150">
          <div className="px-3 pt-2 pb-3 space-y-1 max-h-[75vh] overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleTabClick(item.id, e)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-teal-300' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
