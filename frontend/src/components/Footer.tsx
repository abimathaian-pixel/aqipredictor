import React from 'react';
import { Waves, ShieldCheck, Database, Calendar } from 'lucide-react';

interface FooterProps {
  onNavigateAbout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateAbout }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-teal-400">
                <Waves className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  AeroPulse
                </span>
                <span className="font-bold text-teal-600 text-base tracking-tight">
                  Pune
                </span>
              </div>
            </div>
            <p className="text-slate-500 max-w-md leading-relaxed">
              Real-Time Air Intelligence. Predictive Insights. Healthier Pune. Continuous ambient air quality
              monitoring across PMC &amp; PCMC stations with supervised Random Forest machine-learning forecasting.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                <Database className="w-3 h-3 text-slate-400" /> CPCB / data.gov.in
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Official CPCB Standard
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                <Calendar className="w-3 h-3 text-slate-400" /> Asia/Kolkata (IST)
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">
              Platform Modules
            </h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>• Real-Time CAAQMS Telemetry</li>
              <li>• Leaflet Geospatial Map</li>
              <li>• Multi-Pollutant Time Series</li>
              <li>• Random Forest AQI Predictor</li>
              <li>• Pollution Hotspot Tiers</li>
              <li>• Personal Inhalation Calculator</li>
            </ul>
          </div>

          {/* Col 3: Reference & About */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2.5">
              Documentation & Architecture
            </h4>
            <p className="text-slate-500 leading-relaxed mb-3">
              Full-stack environmental intelligence platform with explainable AI, strict chronological holdout evaluation,
              and transparent demo mode.
            </p>
            {onNavigateAbout && (
              <button
                onClick={onNavigateAbout}
                className="font-semibold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                View System Architecture &amp; Methodology →
              </button>
            )}
          </div>
        </div>

        {/* Mandatory Medical & Forecasting Disclaimer */}
        <div className="pt-6 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 leading-relaxed">
            <span className="font-bold">Public Health &amp; Forecasting Disclaimer:</span> Air-quality values,
            sub-indices, and forecasts are provided for informational and educational purposes. Next-day forecasts are
            statistical estimates generated from historical time series and meteorological proxies. Health recommendations
            adhere to standard CPCB and WHO guidelines and do not constitute individual medical advice.
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-slate-400 mt-4 gap-2 text-[11px]">
            <span>© {new Date().getFullYear()} AeroPulse Pune. Environmental Intelligence Platform.</span>
            <span>Refreshed automatically • Timezone: Asia/Kolkata</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
