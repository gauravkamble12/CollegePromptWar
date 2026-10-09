import React, { useState, useEffect } from 'react';
import { Activity, CloudRain, Wind, Thermometer, Radio, CheckCircle, RefreshCw, AlertTriangle, Server } from 'lucide-react';
import { api } from '../services/api';
import { CityPulseData } from '../types';

export const CityPulseView: React.FC = () => {
  const [pulse, setPulse] = useState<CityPulseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const data = await api.getCityPulse();
      setPulse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Live City Pulse & Telemetry Dashboard</h2>
            <p className="text-xs text-slate-500">Real-time meteorology, active advisories, and provider availability</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            pulse?.is_live_data
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${pulse?.is_live_data ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            {pulse?.is_live_data ? 'Real-Time Feed Synchronized' : 'Offline Cached Snapshot'}
          </span>
          <button
            onClick={fetchPulse}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Poll telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {pulse && (
        <div className="space-y-6">
          {/* Weather & Civic Counts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-2">
                <span>Temperature</span>
                <Thermometer className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {pulse.current_temperature_c?.toFixed(1)}°C
              </div>
              <div className="text-xs text-slate-600 mt-1">{pulse.weather_condition}</div>
            </div>

            {/* Air Quality */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-2">
                <span>Air Quality Index</span>
                <Wind className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">AQI ~92</div>
              <div className="text-xs text-slate-500 mt-1">Moderate (Outdoor exploration safe)</div>
            </div>

            {/* Active Civic Reports */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-2">
                <span>Active Civic Hazards</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-600">
                {pulse.recent_civic_reports_count}
              </div>
              <div className="text-xs text-slate-500 mt-1">Citizen reports in triage</div>
            </div>

            {/* Resolved Issues */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center text-slate-500 text-xs font-semibold mb-2">
                <span>Resolved Civic Issues</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-600">
                {pulse.resolved_civic_reports_count}
              </div>
              <div className="text-xs text-slate-500 mt-1">Verified resolved by municipal teams</div>
            </div>
          </div>

          {/* Active Advisories Card */}
          {pulse.active_weather_alerts && pulse.active_weather_alerts.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" /> Active City Advisories
              </h3>
              <div className="space-y-2">
                {pulse.active_weather_alerts.map((alert) => (
                  <div key={alert.id} className="p-3.5 bg-white rounded-xl border border-amber-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-900 text-xs">{alert.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                    <div className="text-[10px] text-slate-400 mt-2">Source: {alert.source_attribution}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provider Infrastructure Telemetry */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" /> External Provider Status & Latency
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pulse.providers.map((p, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span className="capitalize">{p.provider_name.replace('_', ' ')}</span>
                    <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">Latency: {p.latency_ms} ms</div>
                  <div className="text-[10px] text-slate-400 mt-1">{p.status_message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
