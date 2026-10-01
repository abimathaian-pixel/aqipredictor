import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { aqiApi } from '../services/api';
import { LiveAirQualityResponse, LiveStationItem } from '../types/aqi';
import { AQIBadge } from '../components/AQIBadge';
import { CPCB_CATEGORIES, getAQICategory } from '../utils/aqiCategory';
import { MapPin, Navigation, Eye, Layers } from 'lucide-react';

interface MapPageProps {
  onSelectStation: (stationId: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ onSelectStation }) => {
  const [data, setData] = useState<LiveAirQualityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.CircleMarker }>({});

  useEffect(() => {
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load map data', err);
        setLoading(false);
      });
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered at Pune Central (COEP / Shimla Office corridor)
    const puneCenter: [number, number] = [18.5314, 73.8446];
    const map = L.map(mapContainerRef.current, {
      center: puneCenter,
      zoom: 12,
      scrollWheelZoom: true,
    });

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Plot or update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !data) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const stations = data.stations.filter((st) => {
      if (selectedCategory === 'ALL') return true;
      return st.category_info.category.toUpperCase() === selectedCategory.toUpperCase();
    });

    stations.forEach((st) => {
      const catInfo = getAQICategory(st.aqi);

      // Create stylish SVG Circle Marker with pulsing effect
      const marker = L.circleMarker([st.latitude, st.longitude], {
        radius: 12,
        fillColor: catInfo.color,
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      });

      // HTML Popup with CPCB category details
      const popupHtml = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #0f172a;">${st.name}</strong>
            <span style="background: ${catInfo.bg_color}; color: ${catInfo.text_color}; border: 1px solid ${catInfo.border_color}; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px;">
              ${st.category_info.category}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${st.area}</div>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 24px; font-weight: 800; color: #0f172a;">${st.aqi}</span>
            <span style="font-size: 11px; color: #64748b;">AQI • Dominant: <strong>${st.dominant_pollutant}</strong></span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 6px; margin-bottom: 8px;">
            <div>PM2.5: <strong>${st.pm25 || '--'}</strong> µg/m³</div>
            <div>PM10: <strong>${st.pm10 || '--'}</strong> µg/m³</div>
          </div>
          <button id="btn-station-${st.id}" style="width: 100%; background: #059669; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
            View Station Details →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setActiveStationId(st.id);
        const btn = document.getElementById(`btn-station-${st.id}`);
        if (btn) {
          btn.onclick = () => onSelectStation(st.id);
        }
      });

      marker.addTo(map);
      markersRef.current[st.id] = marker;
    });
  }, [data, selectedCategory, onSelectStation]);

  const flyToStation = (st: LiveStationItem) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([st.latitude, st.longitude], 14, { duration: 1.2 });
    const marker = markersRef.current[st.id];
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            Pune Air Quality Geospatial Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            OpenStreetMap live spatial representation of 12 CAAQMS stations color-coded by official CPCB severity
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-semibold text-slate-700 mr-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Filter Markers:
        </span>
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Stations
        </button>
        {CPCB_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
              selectedCategory.toUpperCase() === cat.name.toUpperCase()
                ? 'ring-2 ring-slate-900'
                : ''
            }`}
            style={{
              backgroundColor: cat.bg,
              color: cat.text,
              borderColor: cat.color
            }}
          >
            {cat.name} ({cat.range})
          </button>
        ))}
      </div>

      {/* Map Layout: Left Sidebar List + Center Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Station Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[550px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Station to Center
          </h3>
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {data?.stations.map((st) => (
              <div
                key={st.id}
                onClick={() => flyToStation(st)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  activeStationId === st.id
                    ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900">{st.name}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{st.area}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-sm">{st.aqi}</div>
                  <AQIBadge aqi={st.aqi} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative h-[550px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 hidden sm:block">
            <div className="font-bold text-slate-800 text-[11px] mb-1">CPCB AQI Severity Legend</div>
            {CPCB_CATEGORIES.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-700">{cat.name}</span>
                <span className="text-slate-400 text-[10px] font-mono">({cat.range})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
