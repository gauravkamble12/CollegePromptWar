import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, Database, Layers, X, Info } from 'lucide-react';
import { Place } from '../types';

interface TrustModalProps {
  place: Place;
  onClose: () => void;
}

export const TrustModal: React.FC<TrustModalProps> = ({ place, onClose }) => {
  const trust = place.trust_indicator;
  if (!trust) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'official': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'verified_business': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'community': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-purple-700 bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="trust-title">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 id="trust-title" className="text-lg font-bold text-slate-900">CityTrust Intelligence</h3>
              <p className="text-xs text-slate-500">{place.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Composite Score Banner */}
        <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Trust Composite Rating</div>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5">{trust.composite_score} <span className="text-sm font-normal text-indigo-300">/ 100</span></div>
          </div>
          <div className="text-right">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTierColor(trust.verification_tier)}`}>
              {trust.verification_tier.replace('_', ' ').toUpperCase()}
            </span>
            <div className="text-[11px] text-slate-300 mt-1.5">Attributed Source</div>
          </div>
        </div>

        {/* Uncertainty Alert if present */}
        {trust.has_uncertainty_warning && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Explicit Uncertainty Warning</span>
              <ul className="list-disc list-inside space-y-0.5">
                {trust.uncertainty_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 4 Pillars Breakdown */}
        <div className="space-y-3.5 mb-5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500" /> Source Authority
              </span>
              <span className="font-bold text-slate-900">{trust.source_score}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${trust.source_score}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Source: {place.source_attribution}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Information Freshness
              </span>
              <span className="font-bold text-slate-900">{trust.freshness_score}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${trust.freshness_score}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {trust.is_stale ? '⚠️ Marked Stale (>90 days old)' : 'Recently verified against municipal records.'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" /> Corroboration Mass
              </span>
              <span className="font-bold text-slate-900">{trust.corroboration_score}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${trust.corroboration_score}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{place.review_count} independent citizen verifications</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-500" /> Data Completeness
              </span>
              <span className="font-bold text-slate-900">{trust.completeness_score}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${trust.completeness_score}%` }}></div>
            </div>
            {place.missing_information && place.missing_information.length > 0 ? (
              <div className="text-[11px] text-amber-700 mt-1">
                Missing: {place.missing_information.join(', ')}
              </div>
            ) : (
              <div className="text-[11px] text-emerald-600 mt-1">All key profile parameters fully verified.</div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
          "{trust.explanation}"
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          Close Assessment
        </button>
      </div>
    </div>
  );
};
