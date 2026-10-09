import React, { useState } from 'react';
import { CalendarDays, Clock, DollarSign, Footprints, ShieldCheck, BookmarkPlus, Printer, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { ItineraryPlan } from '../types';
import { useAuth } from '../context/AuthContext';

export const ItineraryPlannerView: React.FC<{ onOpenOfflineCard?: (itinerary: ItineraryPlan) => void }> = ({ onOpenOfflineCard }) => {
  const { isAuthenticated, cityMode } = useAuth();
  const [totalHours, setTotalHours] = useState<number>(6.0);
  const [budgetInr, setBudgetInr] = useState<number>(800);
  const [transportMode, setTransportMode] = useState<string>('walking');
  const [wheelchairRequired, setWheelchairRequired] = useState<boolean>(false);
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setSaveSuccess(null);
    try {
      const generated = await api.generateItinerary({
        city: 'Pune',
        total_hours: totalHours,
        total_budget_inr: budgetInr,
        transport_mode: transportMode,
        city_mode: cityMode,
        accessibility_required: wheelchairRequired
      });
      setPlan(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    try {
      await api.saveItinerary(plan);
      setSaveSuccess('Itinerary saved to your account!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save itinerary. Make sure you are signed in.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Inputs Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Constraint-Based Itinerary Planner</h2>
              <p className="text-xs text-slate-500">Optimizes operating hours, proximity legs, budget limits, and transit footprints</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            Mode: {cityMode.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Available Hours */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Available Time</span>
              <span className="text-indigo-600">{totalHours} Hours</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={totalHours}
              onChange={(e) => setTotalHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2 hrs (Quick trip)</span>
              <span>12 hrs (Full day)</span>
            </div>
          </div>

          {/* Budget INR */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Total Spending Budget</span>
              <span className="text-emerald-600">₹{budgetInr} INR</span>
            </div>
            <input
              type="range"
              min="100"
              max="3000"
              step="100"
              value={budgetInr}
              onChange={(e) => setBudgetInr(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹100 (Student)</span>
              <span>₹3,000 (Premium)</span>
            </div>
          </div>

          {/* Transport Mode & Accessibility */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Travel Mode</label>
            <div className="flex gap-2">
              {['walking', 'transit', 'driving'].map((m) => (
                <button
                  key={m}
                  onClick={() => setTransportMode(m)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                    transportMode === m
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wheelchairRequired}
                onChange={(e) => setWheelchairRequired(e.target.checked)}
                className="rounded-sm text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-medium text-slate-700">Wheelchair step-free routes only</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{loading ? 'Optimizing Time & Proximity Constraints...' : 'Generate Intelligent Itinerary'}</span>
        </button>
      </div>

      {/* Generated Itinerary Output */}
      {plan && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Curated Schedule</span>
                <h3 className="text-2xl font-bold mt-0.5">{plan.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{plan.weather_summary}</p>
              </div>

              <div className="flex gap-6">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Est. Cost</div>
                  <div className="text-xl font-extrabold text-emerald-400">₹{plan.total_estimated_cost}</div>
                  <div className="text-[10px] text-slate-400">Budget: ₹{plan.total_budget_inr}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Responsible Score</div>
                  <div className="text-xl font-extrabold text-teal-300">{plan.responsible_travel_score}%</div>
                  <div className="text-[10px] text-slate-400">Eco-Transit Metric</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5 pt-4 border-t border-slate-800">
              {isAuthenticated && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" /> Save Itinerary
                </button>
              )}
              {onOpenOfflineCard && (
                <button
                  onClick={() => onOpenOfflineCard(plan)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Offline Travel Card
                </button>
              )}
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  ✓ {saveSuccess}
                </span>
              )}
            </div>
          </div>

          {/* Timeline of Stops */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
              Optimized Journey Timeline ({plan.stops.length} Stops)
            </h4>

            <div className="relative border-l-2 border-indigo-200 ml-4 space-y-8 pb-2">
              {plan.stops.map((stop, i) => (
                <div key={i} className="relative pl-6">
                  {/* Step Bubble */}
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-4 border-white shadow-xs">
                    {stop.order_index}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{stop.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                          {stop.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                        <span className="text-indigo-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Arrival: {stop.suggested_arrival}
                        </span>
                        <span className="text-emerald-600">
                          {stop.cost_inr > 0 ? `₹${stop.cost_inr}` : 'Free'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 mb-2">{stop.address}</div>
                    
                    <p className="text-xs text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100/60 mb-2">
                      <span className="font-semibold">Why this stop: </span>{stop.why_recommended}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>Stay Duration: {stop.duration_minutes} mins</span>
                      <span>Transit Leg: {stop.travel_time_from_previous_min} mins via {plan.transport_mode}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Replanning Alternatives */}
          {plan.alternatives && plan.alternatives.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block mb-1">
                Dynamic Replanning Alternatives (Weather or Disruption Fallback):
              </span>
              <p className="text-amber-800 mb-2">
                If adverse conditions develop at any stop, these verified alternatives are primed without altering total budget constraint:
              </p>
              <div className="flex flex-wrap gap-2">
                {plan.alternatives.map((alt, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 font-medium">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
