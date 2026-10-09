import React, { useState, useEffect } from 'react';
import { Scale, Check, AlertTriangle, ShieldCheck, Sliders, Trophy, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Place, ComparisonResult } from '../types';

export const ComparisonView: React.FC<{ places: Place[] }> = ({ places }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);
  const [weights, setWeights] = useState({
    affordability: 0.25,
    cleanliness: 0.20,
    accessibility: 0.20,
    ratings: 0.20,
    connectivity: 0.15,
    historical_significance: 0.00
  });
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const togglePlace = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((pId) => pId !== id));
      } else {
        alert('Please keep at least 2 places selected for comparison.');
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert('Maximum 4 places can be compared simultaneously.');
      }
    }
  };

  const handleRunComparison = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    try {
      const data = await api.comparePlaces(selectedIds, weights);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunComparison();
  }, [selectedIds, weights]);

  return (
    <div className="space-y-6">
      {/* Header and Place Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Best vs. Worst Place Multi-Criteria Comparison</h2>
            <p className="text-xs text-slate-500">Transparent, weighted scoring without black-box declarations</p>
          </div>
        </div>

        {/* Place Selection Chips */}
        <div className="mb-6">
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select 2 to 4 Places to Compare (Active: {selectedIds.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {places.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlace(p.id)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weight Sliders */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Customize Criteria Importance (Active Weight Profile)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {Object.entries(weights).map(([dim, val]) => (
              <div key={dim} className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span className="capitalize">{dim.replace('_', ' ')}</span>
                  <span className="text-indigo-600 font-bold">{Math.round(val * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={val}
                  onChange={(e) =>
                    setWeights({ ...weights, [dim]: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Results Table & Cards */}
      {result && (
        <div className="space-y-6">
          {/* Winner / Rationale Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3 shadow-2xs">
            <Trophy className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Optimal Recommendation for Selected Weights</div>
              <p className="text-xs text-indigo-900 mt-0.5 leading-relaxed">{result.rationale}</p>
            </div>
          </div>

          {/* Side-by-side Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.places.map((placeItem) => {
              const isTop = placeItem.place_id === result.top_recommended_place_id;
              return (
                <div
                  key={placeItem.place_id}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    isTop
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                      : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 text-base">{placeItem.name}</h3>
                      {isTop && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                          Top Match
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Weighted Composite</span>
                      <span className="text-2xl font-black text-slate-900">{placeItem.composite_score} <span className="text-xs font-normal text-slate-400">/ 100</span></span>
                    </div>

                    {/* Persona Specialization Badge */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs font-semibold text-slate-700">
                      <span className="text-indigo-600 font-bold block text-[10px] uppercase">Persona Alignment:</span>
                      {placeItem.best_for_persona}
                    </div>

                    {/* Dimension Breakdown Bars */}
                    <div className="space-y-3 mb-5">
                      {Object.values(placeItem.dimension_scores).map((ds, di) => (
                        <div key={di}>
                          <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                            <span>{ds.dimension}</span>
                            <span className="font-bold text-slate-800">{ds.normalized_score}/100</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${ds.normalized_score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Safety Observation (Kept separate) */}
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 mb-4">
                      <span className="font-bold block">Safety Rating (Evaluated Separately):</span>
                      <span>{placeItem.safety_observation_rating} / 100 based on verified municipal metrics.</span>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-emerald-50/60 rounded-lg text-emerald-900">
                        <span className="font-bold block mb-1">Advantages:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {placeItem.pros.map((p, pi) => (
                            <li key={pi}>{p}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-2 bg-rose-50/60 rounded-lg text-rose-900">
                        <span className="font-bold block mb-1">Trade-offs:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {placeItem.cons.map((c, ci) => (
                            <li key={ci}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 italic text-center">
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
