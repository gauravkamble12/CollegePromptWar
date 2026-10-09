import React from 'react';
import { X, Star, MapPin, Clock, DollarSign, Accessibility, Car, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { Place } from '../types';
import { getPlaceImage } from '../lib/placeImage';

interface PlaceDetailModalProps {
  place: Place;
  onClose: () => void;
  onOpenTrust: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose, onOpenTrust }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="modal-place-name">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header Image */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-100">
          <img
            src={getPlaceImage(place)}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors backdrop-blur-xs"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-indigo-600 text-white">
              {place.category}
            </span>
            <h2 id="modal-place-name" className="text-2xl font-bold text-white mt-1.5">{place.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-200 mt-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{place.address}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Rating</div>
              <div className="text-base font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {place.rating} ({place.review_count})
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Est. Budget</div>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                {place.estimated_cost_inr > 0 ? `₹${place.estimated_cost_inr}` : 'Free Entry'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Trust Score</div>
              <button
                onClick={onOpenTrust}
                className="text-base font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mt-0.5 mx-auto"
              >
                <ShieldCheck className="w-4 h-4" /> {place.trust_indicator?.composite_score || 85}%
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{place.description}</p>
          </div>

          {/* Tags */}
          {place.knowledge_tags && place.knowledge_tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Heritage & Context Tags</h3>
              <div className="flex flex-wrap gap-2">
                {place.knowledge_tags.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Multidimensional Scores */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Multi-Dimensional City Assessment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Cleanliness</span>
                  <span className="font-bold text-slate-900">{place.cleanliness_score}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full">
                  <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${place.cleanliness_score}%` }}></div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Safety Index</span>
                  <span className="font-bold text-slate-900">{place.safety_rating}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${place.safety_rating}%` }}></div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Connectivity</span>
                  <span className="font-bold text-slate-900">{place.connectivity_score}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${place.connectivity_score}%` }}></div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Heritage Depth</span>
                  <span className="font-bold text-slate-900">{place.historical_significance_score}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${place.historical_significance_score}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities & Accessibility */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5">Accessibility & Infrastructure</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <Accessibility className={`w-4 h-4 ${place.is_wheelchair_accessible === 1 ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>
                  {place.is_wheelchair_accessible === 1 ? 'Wheelchair Accessible (Step-free)' : place.is_wheelchair_accessible === -1 ? 'Inaccessible / High Stairs' : 'Accessibility Status Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <Car className="w-4 h-4 text-slate-600" />
                <span>{place.has_parking ? 'Designated Parking Available' : 'Street / Public Transit Only'}</span>
              </div>
              {place.public_transit_access && (
                <div className="col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
                  <span className="font-semibold text-slate-800">Public Transit: </span>{place.public_transit_access}
                </div>
              )}
            </div>
          </div>

          {/* Source Attribution & Licensing */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start justify-between">
            <div>
              <span className="font-semibold block">Source Attribution</span>
              <span>{place.source_attribution}</span>
            </div>
            {place.source_url && (
              <a
                href={place.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium mt-0.5 shrink-0"
              >
                Verify <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold text-center hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <MapPin className="w-4 h-4" /> Open In Navigation
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
