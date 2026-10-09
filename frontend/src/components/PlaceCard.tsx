import React from 'react';
import { Star, ShieldCheck, Accessibility, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
  onSelect: (place: Place) => void;
  onOpenTrust: (place: Place) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onSelect, onOpenTrust }) => {
  const trustScore = place.trust_indicator?.composite_score || 85;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(place)}>
        <img
          src={place.photos[0] || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-xs uppercase tracking-wide">
            {place.category}
          </span>
          {place.is_wheelchair_accessible === 1 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-600/90 text-white backdrop-blur-xs flex items-center gap-1">
              <Accessibility className="w-3 h-3" /> Step-free
            </span>
          )}
        </div>

        {/* Trust Badge overlay button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenTrust(place);
          }}
          className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/95 text-slate-800 text-xs font-bold shadow-xs hover:bg-white flex items-center gap-1 backdrop-blur-xs border border-slate-100 transition-colors"
          title="Click to inspect CityTrust evaluation"
          aria-label={`CityTrust score ${trustScore} out of 100`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>{trustScore}%</span>
        </button>

        <div className="absolute bottom-2 left-3 text-xs font-semibold text-white drop-shadow-md">
          {place.estimated_cost_inr > 0 ? `₹${place.estimated_cost_inr} est.` : 'Free Admission'}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              onClick={() => onSelect(place)}
              className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {place.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{place.rating}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {place.description}
          </p>

          {/* Persona Why Recommended */}
          {place.why_recommended && (
            <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100/60 text-[11px] text-indigo-900 mb-3 flex items-start gap-1.5">
              <span className="font-semibold text-indigo-700 shrink-0">Why:</span>
              <span className="line-clamp-2">{place.why_recommended}</span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[170px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{place.address}</span>
          </div>
          <button
            onClick={() => onSelect(place)}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 shrink-0"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
