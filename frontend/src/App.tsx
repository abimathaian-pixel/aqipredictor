import React, { useState, useEffect } from 'react';
import { Navbar, NavTab, HASH_TO_TAB, TAB_HASH_MAP } from './components/Navbar';
import { Footer } from './components/Footer';
import { StationDetailModal } from './components/StationDetailModal';
import { OverviewPage } from './pages/OverviewPage';
import { LiveStationsPage } from './pages/LiveStationsPage';
import { MapPage } from './pages/MapPage';
import { HistoricalTrendsPage } from './pages/HistoricalTrendsPage';
import { PredictionPage } from './pages/PredictionPage';
import { HotspotsPage } from './pages/HotspotsPage';
import { HealthAdvisoryPage } from './pages/HealthAdvisoryPage';
import { CompareAreasPage } from './pages/CompareAreasPage';
import { ExposureCalculatorPage } from './pages/ExposureCalculatorPage';
import { AlertsPage } from './pages/AlertsPage';
import { CorrelationPage } from './pages/CorrelationPage';
import { AboutProjectPage } from './pages/AboutProjectPage';
import { aqiApi } from './services/api';

function getInitialTab(): NavTab {
  const hash = window.location.hash;
  if (hash && HASH_TO_TAB[hash]) {
    return HASH_TO_TAB[hash];
  }
  return 'overview';
}

export function App() {
  const [activeTab, setActiveTabState] = useState<NavTab>(getInitialTab);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync state with URL hash
  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    window.location.hash = TAB_HASH_MAP[tab] || '#/overview';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser Back/Forward hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && HASH_TO_TAB[hash]) {
        setActiveTabState(HASH_TO_TAB[hash]);
      } else if (!hash || hash === '#/' || hash === '#') {
        setActiveTabState('overview');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchGlobalStatus = () => {
    setIsRefreshing(true);
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setIsDemoMode(res.overview.is_demo_mode);
        setLastUpdated(res.overview.last_updated);
        setIsRefreshing(false);
      })
      .catch((err) => {
        console.error('Failed to get status', err);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchGlobalStatus();
  }, []);

  const handleRefresh = () => {
    fetchGlobalStatus();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 selection:bg-teal-600 selection:text-white antialiased font-sans">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={isDemoMode}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {activeTab === 'overview' && (
          <OverviewPage
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectStation={(id) => setSelectedStationId(id)}
          />
        )}
        {activeTab === 'stations' && (
          <LiveStationsPage onSelectStation={(id) => setSelectedStationId(id)} />
        )}
        {activeTab === 'map' && (
          <MapPage onSelectStation={(id) => setSelectedStationId(id)} />
        )}
        {activeTab === 'history' && <HistoricalTrendsPage />}
        {activeTab === 'prediction' && <PredictionPage />}
        {activeTab === 'hotspots' && <HotspotsPage />}
        {activeTab === 'health' && <HealthAdvisoryPage />}
        {activeTab === 'compare' && <CompareAreasPage />}
        {activeTab === 'exposure' && <ExposureCalculatorPage />}
        {activeTab === 'alerts' && <AlertsPage />}
        {activeTab === 'correlation' && <CorrelationPage />}
        {activeTab === 'about' && <AboutProjectPage />}
      </main>

      {/* Station Details Modal */}
      {selectedStationId && (
        <StationDetailModal
          stationId={selectedStationId}
          onClose={() => setSelectedStationId(null)}
        />
      )}

      {/* Global Footer */}
      <Footer onNavigateAbout={() => setActiveTab('about')} />
    </div>
  );
}

export default App;
