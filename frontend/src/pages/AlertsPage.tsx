import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Building,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { aqiApi } from '../services/api';
import { AlertItem, StationResponse } from '../types/aqi';
import { AQIBadge } from '../components/AQIBadge';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [stations, setStations] = useState<StationResponse[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('station-shivajinagar');
  const [threshold, setThreshold] = useState<number>(150);
  const [contact, setContact] = useState<string>('My Laptop Alert');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAlerts = () => {
    setLoading(true);
    aqiApi.getAlerts()
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAlerts();
    aqiApi.getLiveAirQuality()
      .then((res) => {
        setStations(res.stations as any);
        if (res.stations.length > 0) {
          setSelectedStationId(res.stations[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStationId) return;

    setIsSubmitting(true);
    aqiApi.createAlert({
      station_id: selectedStationId,
      threshold: Number(threshold),
      contact: contact || 'Browser Session',
      notify_method: 'in_app'
    })
      .then(() => {
        setIsSubmitting(false);
        setSuccessMessage('Alert subscription registered successfully.');
        loadAlerts();
        setTimeout(() => setSuccessMessage(null), 4000);
      })
      .catch((err) => {
        alert(err.message || 'Failed to create alert');
        setIsSubmitting(false);
      });
  };

  const handleDeleteAlert = (alertId: number) => {
    aqiApi.deleteAlert(alertId)
      .then(() => {
        loadAlerts();
      })
      .catch((err) => console.error(err));
  };

  const triggeredAlerts = alerts.filter((a) => a.is_triggered_now);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BellRing className="w-6 h-6 text-teal-600" />
          Air Quality Risk Threshold Alerts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Subscribe to automated notifications when localized station pollution crosses your personal exposure limits
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Active Trigger Banner if any threshold crossed */}
      {triggeredAlerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-950 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-red-700">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
            🔔 Active Air Quality Warnings Triggered Right Now!
          </div>
          <div className="space-y-2">
            {triggeredAlerts.map((a) => (
              <div
                key={a.id}
                className="p-3 bg-white/80 rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <strong className="text-slate-900 font-semibold">{a.station_name}</strong> has reached{' '}
                  <strong className="text-red-700 font-bold">{a.current_aqi} AQI</strong>, exceeding your alert
                  threshold of <strong>{a.threshold} AQI</strong>.
                </div>
                <div className="flex items-center gap-2">
                  <AQIBadge aqi={a.current_aqi} size="sm" />
                  <span className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                    Threshold Crossed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Create Alert Subscription */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Set Up New Alert</h3>
            <p className="text-xs text-slate-500">Persisted in database for live verification</p>
          </div>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Target Monitoring Station:
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <Building className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
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

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-700">Trigger Threshold:</label>
                <span className="font-bold text-red-600 font-mono">{threshold} AQI</span>
              </div>
              <input
                type="range"
                min="50"
                max="350"
                step="10"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>50 (Good)</span>
                <span>100 (Sat.)</span>
                <span>200 (Mod.)</span>
                <span>300 (Poor)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Alert Label / Subscriber Note:
              </label>
              <input
                type="text"
                placeholder="e.g. Morning Jog Alert, Family Note"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Subscribe to In-App Alert'}</span>
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            🔔 <strong>In-App Alert Prototype:</strong> Threshold crossings are evaluated against live station
            telemetry and highlighted automatically in the dashboard without external SMS gateway fees.
          </div>
        </div>

        {/* Right List: Active Subscriptions */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Alert Subscriptions</h3>
              <p className="text-xs text-slate-500">{alerts.length} subscriptions monitored</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No alert subscriptions created yet. Set your first threshold above!
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    a.is_triggered_now
                      ? 'bg-red-50/60 border-red-300 ring-1 ring-red-400'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{a.station_name}</span>
                      {a.is_triggered_now ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                          Triggered ({a.current_aqi} AQI)
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          Normal ({a.current_aqi} AQI)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Notify when AQI exceeds <strong>{a.threshold}</strong> • {a.contact}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" /> Created: {a.created_at}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
