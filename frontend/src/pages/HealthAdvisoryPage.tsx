import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Heart,
  Users,
  AlertCircle,
  Wind,
  CheckCircle2,
  Home,
  Footprints,
  Sparkles,
  Building
} from 'lucide-react';
import { aqiApi } from '../services/api';
import { HealthAdvisoryResponse } from '../types/aqi';
import { AQIBadge } from '../components/AQIBadge';

export const HealthAdvisoryPage: React.FC = () => {
  const [advisory, setAdvisory] = useState<HealthAdvisoryResponse | null>(null);
  const [stations, setStations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setStations(res.stations.map((s) => ({ id: s.id, name: s.name })));
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    aqiApi.getHealthAdvisory(selectedStationId || undefined)
      .then((res) => {
        setAdvisory(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedStationId]);

  if (loading && !advisory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-40 bg-slate-200 rounded-xl" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-teal-600" />
            Public Health & Exposure Advisory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authoritative CPCB and WHO guideline recommendations tailored to current Pune air quality levels
          </p>
        </div>

        {/* Station Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs self-start md:self-auto">
          <Building className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value="">Pune Metropolitan Average</option>
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {advisory && (
        <>
          {/* Main Risk Status Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Air Quality Risk Status
                </span>
                <AQIBadge aqi={advisory.aqi} size="lg" showRange />
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-slate-900">{advisory.category}</span>
                <span className="text-sm text-slate-500 font-medium">
                  (AQI Index: {advisory.aqi} • Severity: {advisory.severity})
                </span>
              </div>

              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {advisory.category === 'Good'
                  ? 'Air quality is considered satisfactory, and air pollution poses little or no risk to all population segments.'
                  : advisory.category === 'Satisfactory'
                  ? 'Air quality is acceptable; however, unusually sensitive individuals may experience minor respiratory symptoms.'
                  : advisory.category === 'Moderate'
                  ? 'Air quality may cause breathing discomfort to individuals with lung/heart conditions, older adults, and children.'
                  : 'Noticeable respiratory stress on prolonged exposure. Significant risk for individuals with asthma or cardiovascular conditions.'}
              </p>
            </div>

            {/* Dominant Pollutant Pill */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[11px] font-semibold uppercase text-slate-500 block">
                Dominant Atmospheric Pollutant
              </span>
              <span className="text-2xl font-black text-amber-600 my-1 block">
                {advisory.dominant_pollutant}
              </span>
              <span className="text-[11px] text-slate-400">Governing Sub-Index</span>
            </div>
          </div>

          {/* Dual Audience Advice: General Public vs Sensitive Groups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Public */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">General Public Guidance</h3>
                  <p className="text-xs text-slate-500">For healthy adults, working professionals & students</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {advisory.general_public_advice}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <Footprints className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Outdoor Transit: </strong>
                    {advisory.outdoor_activity_guidance}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mask Recommendation: </strong>
                    {advisory.mask_recommendation}
                  </span>
                </div>
              </div>
            </div>

            {/* Sensitive Groups */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Sensitive Groups Protocol</h3>
                  <p className="text-xs text-slate-500">
                    Children, elderly, asthmatics & cardiovascular patients
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {advisory.sensitive_groups_advice}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <Home className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Indoor Environment: </strong>
                    {advisory.indoor_ventilation_guidance}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Symptom Monitoring: </strong> Keep emergency inhalers and medications readily accessible.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Checklist & Dominant Pollutant Clinical Mechanics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Action Checklist */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Actionable Daily Risk Mitigation Checklist
              </h3>

              <div className="space-y-3 pt-2">
                {advisory.recommended_actions.map((act, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs sm:text-sm text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dominant Pollutant Physiological Impact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Wind className="w-4 h-4 text-amber-600" />
                  {advisory.dominant_pollutant} Health Impact
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed my-4">
                  {advisory.dominant_pollutant_impact}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-500">
                Guidelines harmonized with CPCB (Central Pollution Control Board) and WHO Air Quality Guidelines (2021 update).
              </div>
            </div>
          </div>

          {/* Prominent Mandatory Medical Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Important Medical Disclaimer:</span>
              {advisory.disclaimer}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
