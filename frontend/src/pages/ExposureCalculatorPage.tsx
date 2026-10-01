import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Building,
  Clock,
  Bike,
  Activity,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { aqiApi } from '../services/api';
import { ExposureResponse, StationResponse } from '../types/aqi';
import { AQIBadge } from '../components/AQIBadge';

export const ExposureCalculatorPage: React.FC = () => {
  const [stations, setStations] = useState<StationResponse[]>([]);
  const [stationId, setStationId] = useState<string>('station-shivajinagar');
  const [hoursOutdoors, setHoursOutdoors] = useState<number>(2.0);
  const [commuteDuration, setCommuteDuration] = useState<number>(45);
  const [commuteMode, setCommuteMode] = useState<string>('two_wheeler');
  const [activityIntensity, setActivityIntensity] = useState<string>('moderate');

  const [result, setResult] = useState<ExposureResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Load stations
  useEffect(() => {
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setStations(res.stations as any);
        if (res.stations.length > 0) {
          setStationId(res.stations[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Compute exposure
  const computeExposure = () => {
    if (!stationId) return;
    setLoading(true);
    aqiApi.calculateExposure({
      station_id: stationId,
      hours_outdoors: Number(hoursOutdoors),
      commute_duration_mins: Number(commuteDuration),
      commute_mode: commuteMode,
      activity_intensity: activityIntensity
    })
      .then((res) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    computeExposure();
  }, [stationId, hoursOutdoors, commuteDuration, commuteMode, activityIntensity]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6 text-teal-600" />
          Personal Inhalation & Exposure Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Approximate educational particulate intake calculator modeling ambient PM2.5, commute duration, and physical exertion rates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Your Activity Profile</h3>
            <p className="text-xs text-slate-500">Configure daily transit and outdoor activity inputs</p>
          </div>

          {/* Station Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              1. Location / Monitoring Station:
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <Building className="w-4 h-4 text-slate-400" />
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.area})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hours outdoors slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">2. Time Spent Outdoors:</label>
              <span className="font-bold text-emerald-700 font-mono">{hoursOutdoors} Hours/day</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={hoursOutdoors}
              onChange={(e) => setHoursOutdoors(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>30 Mins</span>
              <span>5 Hours</span>
              <span>10 Hours</span>
            </div>
          </div>

          {/* Commute Duration slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">3. Daily Commute Duration:</label>
              <span className="font-bold text-emerald-700 font-mono">{commuteDuration} Minutes</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={commuteDuration}
              onChange={(e) => setCommuteDuration(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>10 Mins</span>
              <span>60 Mins</span>
              <span>3 Hours</span>
            </div>
          </div>

          {/* Commute Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              4. Primary Mode of Travel:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'two_wheeler', label: 'Two-Wheeler (Bike/Scooter)', note: 'High direct exhaust' },
                { id: 'walking', label: 'Walking / Foot', note: 'Ambient level' },
                { id: 'cycling', label: 'Bicycle Commute', note: 'Higher breath rate' },
                { id: 'bus_train', label: 'Public Bus / Metro', note: 'Partial filtration' },
                { id: 'car_ac', label: 'Car (AC / Cabin Filter)', note: 'Lowest exposure' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setCommuteMode(mode.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    commuteMode === mode.id
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800 block">{mode.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{mode.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Physical Exertion Intensity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              5. Physical Exertion Level Outdoors:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: 'Resting / Casual', vent: '~0.5 m³/hr' },
                { id: 'moderate', label: 'Brisk Walking', vent: '~1.2 m³/hr' },
                { id: 'vigorous', label: 'Jogging / Workout', vent: '~2.8 m³/hr' }
              ].map((int) => (
                <button
                  key={int.id}
                  onClick={() => setActivityIntensity(int.id)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    activityIntensity === int.id
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800 block">{int.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{int.vent}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-6 space-y-5">
          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Estimated Particulate Exposure
                  </h3>
                  <p className="text-xs text-slate-500">Based on {result.station_name} conditions</p>
                </div>
                <AQIBadge aqi={result.current_aqi} size="sm" />
              </div>

              {/* Main Dose Output Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Estimated PM2.5 Intake
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 font-mono">
                      {result.estimated_inhaled_pm25_ug}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">µg</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Total microgram dose inhaled</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Exposure Risk Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700 font-mono">
                      {result.risk_score_100}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                      result.relative_exposure_level === 'High' || result.relative_exposure_level === 'Severe'
                        ? 'bg-red-100 text-red-800'
                        : result.relative_exposure_level === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {result.relative_exposure_level} Risk Level
                  </span>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Targeted Protective Recommendations
                </h4>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physiological Model Methodology */}
              <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs space-y-1">
                <span className="font-semibold text-slate-900 block">Dosimetry Equation:</span>
                <p className="leading-relaxed font-mono text-[11px]">
                  Dose = (C_PM2.5 × Hours_out × Rate_vent) + (C_PM2.5 × Hours_commute × Factor_mode × 1.2)
                </p>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">{result.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
