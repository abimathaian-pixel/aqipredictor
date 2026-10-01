import React from 'react';
import {
  BrainCircuit,
  Database,
  Layers,
  Flame,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Terminal,
  Activity,
  Award,
  Waves,
  ArrowRight,
  Server,
  Cpu,
  Monitor
} from 'lucide-react';

export const AboutProjectPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 text-xs font-semibold">
          <Award className="w-4 h-4 text-teal-600" /> Academic &amp; Viva Presentation Reference
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AeroPulse Pune
          </h1>
        </div>
        <h2 className="text-sm sm:text-base font-semibold text-teal-700">
          Real-Time Air Intelligence. Predictive Insights. Healthier Pune.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          An enterprise environmental intelligence platform integrating official CPCB monitoring data,
          180-day atmospheric time-series telemetry, and supervised machine-learning forecasting.
        </p>

        {/* Core Positioning: Requirement 42 */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono font-semibold shadow-xs">
          <span className="text-teal-400">Monitor</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-sky-400">Analyze</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-indigo-400">Predict</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-emerald-400">Act</span>
        </div>
      </div>

      {/* Technology Stack Grid: Requirement 25 & 26 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Technology Stack (Implemented Architecture)
            </h3>
            <p className="text-xs text-slate-500">
              Modern full-stack technologies powering the production prototype
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
            v1.0.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Frontend */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Monitor className="w-4 h-4 text-teal-600" />
              <span>Frontend</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• React 19 &amp; TypeScript</li>
              <li>• Vite Build Engine</li>
              <li>• Tailwind CSS v4</li>
              <li>• Recharts Analytics</li>
              <li>• Leaflet &amp; OpenStreetMap</li>
              <li>• Lucide React Icons</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Server className="w-4 h-4 text-sky-600" />
              <span>Backend</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Python 3.12</li>
              <li>• FastAPI Framework</li>
              <li>• Uvicorn ASGI Server</li>
              <li>• Pydantic v2 Validation</li>
              <li>• SQLAlchemy ORM</li>
              <li>• httpx Async Client</li>
            </ul>
          </div>

          {/* ML / Data Science */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Data Science / ML</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Scikit-learn (Random Forest)</li>
              <li>• Linear Regression Baseline</li>
              <li>• Pandas &amp; NumPy</li>
              <li>• Joblib Serialization</li>
              <li>• Chronological Holdout Split</li>
              <li>• Feature Importance &amp; XAI</li>
            </ul>
          </div>

          {/* Database & Data Sources */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Storage &amp; Sources</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• SQLite (Local / Demo mode)</li>
              <li>• PostgreSQL Compatible</li>
              <li>• CPCB Official Telemetry</li>
              <li>• data.gov.in CAAQMS API</li>
              <li>• MPCB Stations</li>
              <li>• Fallback Baseline Caching</li>
            </ul>
          </div>
        </div>
      </div>

      {/* End-to-End Pipeline Flow: Requirement 26 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-teal-600" />
          End-to-End Architectural Pipeline Flow
        </h3>

        <div className="p-5 bg-slate-950 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto leading-loose border border-slate-800">
          <div className="text-teal-400 font-bold">CPCB / data.gov.in CAAQMS Data API</div>
          &nbsp;&nbsp;↓ (HTTPS REST query with API Key / Automatic Fallback Demo Layer)<br />
          <div className="text-sky-400 font-bold">Data Collection &amp; Ingestion Layer</div>
          &nbsp;&nbsp;↓ (Data cleaning, handling sensor outages, outlier mitigation)<br />
          <div className="text-blue-400 font-bold">FastAPI Backend &amp; Sub-Index Engine</div>
          &nbsp;&nbsp;↓ (6-Pollutant linear piecewise interpolation: PM2.5, PM10, NO2, SO2, CO, O3)<br />
          <div className="text-indigo-400 font-bold">PostgreSQL / SQLite Relational Storage</div>
          &nbsp;&nbsp;↓ (12 Stations, 4,090+ historical time series readings across Pune)<br />
          <div className="text-purple-400 font-bold">Machine Learning Pipeline (Random Forest Regressor)</div>
          &nbsp;&nbsp;↓ (Lags 1-3, rolling means 3/7, calendar seasonality, R²=0.757, MAE=9.61)<br />
          <div className="text-emerald-400 font-bold">AQI Prediction &amp; Health Advisory Engine</div>
          &nbsp;&nbsp;↓ (REST JSON responses via /api/predictions, /api/hotspots, /api/health)<br />
          <div className="text-white font-bold">React Dashboard (AeroPulse Pune)</div>
          &nbsp;&nbsp;↓ (Interactive Recharts analytics, Leaflet geospatial canvas, alerts)<br />
          <div className="text-teal-300 font-bold">Citizens, Public Health Authorities &amp; Commuters</div>
        </div>
      </div>

      {/* 6 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">1. Data Engineering</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ingests CAAQMS telemetry with automated fallback demo caching. Computes official 6-pollutant linear piecewise sub-indices and flags dominant pollutants.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">2. Exploratory Data Analysis</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Captures Pune's distinct seasonal cycles: winter thermal boundary trapping (high PM2.5), dry summer dust (elevated PM10), and monsoon precipitation washout (&lt;50 AQI).
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">3. ML Time-Series Model</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Supervised Random Forest Regressor trained on chronological lag features (t-1, t-2, t-3), 3-day &amp; 7-day rolling means, meteorological proxies, and calendar periodicity.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">4. Hotspot Classification</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ranks and categorizes 12 Pune microclimates into project-defined analytical tiers (High &gt;150, Medium 100-150, Low &lt;100) based on historical statistical percentiles.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">5. Geospatial &amp; Visual Analytics</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Responsive Leaflet + OpenStreetMap spatial mapping with severity-coded pins, multi-station synchronized comparisons, and Recharts bivariate scatter plots.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">6. Health Risk &amp; Inhalation</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Harmonized CPCB/WHO health risk guidance, personal commute respiratory intake calculator, and database-backed threshold alert subscription triggers.
          </p>
        </div>
      </div>

      {/* Viva / Project Defense Q&A Quick Reference */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Viva Defense &amp; Project Evaluation Quick Reference
        </h3>

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <strong className="text-slate-900 block font-semibold">
              Q: Why is Random Forest preferred over simple Linear Regression for AQI prediction?
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Air pollution dispersion is non-linear and governed by complex threshold interactions (e.g. thermal inversions, humidity thresholds, rush hour spikes). Random Forest captures non-linear feature interactions without overfitting, achieving an R² of 0.757 compared to 0.620 for linear regression.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <strong className="text-slate-900 block font-semibold">
              Q: How does the system handle CPCB API downtime or rate-limiting?
            </strong>
            <p className="text-slate-600 leading-relaxed">
              The architecture employs an active Fallback Demo Layer. When API credentials are empty or the external data.gov.in endpoint returns 401/403/timeout, the backend automatically transitions to high-fidelity historical Pune baseline data while transparently displaying a status badge: "Demo Mode — Live CPCB data currently unavailable".
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <strong className="text-slate-900 block font-semibold">
              Q: What constitutes the CPCB AQI formula?
            </strong>
            <p className="text-slate-600 leading-relaxed">
              Official Indian CPCB standard computes individual sub-indices for monitored pollutants using linear piecewise equations across 6 concentration brackets. The overall AQI is the maximum sub-index among measured pollutants (requiring PM2.5 or PM10), and that pollutant is designated as the dominant driver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
