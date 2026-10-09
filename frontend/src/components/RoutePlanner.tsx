import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Navigation, Clock, AlertTriangle, Phone, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { api } from '../services/api';
import { RouteComparisonResponse, RouteOption } from '../types';

interface RoutePlannerProps {
  onRouteSelect?: (waypoints: [number, number][]) => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({ onRouteSelect }) => {
  const [startPoint, setStartPoint] = useState({ name: 'Shaniwar Wada (Central Peth)', lat: 18.5196, lng: 73.8553 });
  const [endPoint, setEndPoint] = useState({ name: 'FC Road (Shivajinagar Hub)', lat: 18.5236, lng: 73.8415 });
  const [transportMode, setTransportMode] = useState<string>('walking');
  const [comparison, setComparison] = useState<RouteComparisonResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('safer_corridor');
  const [emergencyData, setEmergencyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await api.compareRoutes(
        startPoint.lat,
        startPoint.lng,
        endPoint.lat,
        endPoint.lng,
        transportMode
      );
      setComparison(data);
      setSelectedRouteId(data.recommended_route_id);
      const rec = data.routes.find((r) => r.id === data.recommended_route_id);
      if (rec && onRouteSelect) {
        onRouteSelect(rec.waypoints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    api.getEmergencyServices().then(setEmergencyData).catch(() => {});
  }, [transportMode]);

  const handleSelectRoute = (route: RouteOption) => {
    setSelectedRouteId(route.id);
    if (onRouteSelect) {
      onRouteSelect(route.waypoints);
    }
  };

  return (
    <div className="space-y-6">
      {/* Route Query Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Safety Intelligence & Route Comparison</h2>
            <p className="text-xs text-slate-500">Correlates municipal lighting, reported road damage, and crowd observations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Departure Origin</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
              {startPoint.name}
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Destination</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
              {endPoint.name}
            </div>
          </div>
        </div>

        {/* Transport Mode & Calculate */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {['walking', 'transit', 'driving'].map((mode) => (
              <button
                key={mode}
                onClick={() => setTransportMode(mode)}
                aria-pressed={transportMode === mode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  transportMode === mode
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={fetchRoutes}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{loading ? 'Evaluating Corridors...' : 'Re-Evaluate Routes'}</span>
          </button>
        </div>
      </div>

      {/* Route Options Comparison Cards */}
      {comparison && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Available Route Options ({comparison.routes.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparison.routes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const isRecommended = comparison.recommended_route_id === route.id;

              return (
                <div
                  key={route.id}
                  onClick={() => handleSelectRoute(route)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-sm leading-snug">{route.name}</span>
                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                          Recommended
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 mb-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" /> {route.duration_min} min
                      </span>
                      <span>•</span>
                      <span>{route.distance_km} km</span>
                    </div>

                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                      {route.recommendation_summary}
                    </p>

                    <div className="space-y-2 text-[11px] pt-3 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Street Lighting:</span>
                        <span className="font-semibold text-slate-800">{route.lighting_quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sidewalk Accessibility:</span>
                        <span className="font-semibold text-slate-800">{route.accessibility_rating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reported Hazards:</span>
                        <span className={`font-bold ${route.reported_hazards > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {route.reported_hazards > 0 ? `${route.reported_hazards} active alerts` : 'Zero reported'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRoute(route);
                    }}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ Active On Map' : 'Select This Route'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Transparent Factors Influencing Recommendation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Factors Influencing This Evaluation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {comparison.factors_considered.map((factor, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 italic">
              ⚠️ {comparison.safety_disclaimer}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Hotlines & Services Drawer */}
      {emergencyData && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm mb-3">
            <Phone className="w-4 h-4 text-rose-600" />
            <span>Emergency Contacts & Verified 24x7 Services (Pune Municipal Jurisdiction)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {emergencyData.emergency_contacts.map((contact: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-rose-100 shadow-2xs text-center">
                <div className="text-[11px] font-semibold text-slate-600">{contact.service}</div>
                <div className="text-sm font-extrabold text-rose-700 mt-1">{contact.number}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
