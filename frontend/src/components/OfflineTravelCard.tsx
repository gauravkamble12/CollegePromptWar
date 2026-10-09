import React from 'react';
import { X, Printer, MapPin, Clock, Phone, AlertCircle } from 'lucide-react';
import { ItineraryPlan } from '../types';

interface OfflineTravelCardProps {
  itinerary: ItineraryPlan;
  onClose: () => void;
}

export const OfflineTravelCard: React.FC<OfflineTravelCardProps> = ({ itinerary, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="offline-card-title">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 print:p-0 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div>
            <h3 id="offline-card-title" className="text-base font-bold text-slate-900">Offline-Friendly Travel Card</h3>
            <p className="text-xs text-slate-500">Save as PDF or print for offline navigation when cellular coverage is lost</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="my-4 space-y-5 print:my-0">
          <div className="border-b-2 border-slate-900 pb-3">
            <div className="text-xs uppercase font-bold tracking-widest text-indigo-700">CITY LIFE • EXPLORER CARD</div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">{itinerary.title}</h1>
            <div className="text-xs text-slate-600 mt-1 flex gap-4">
              <span>City: {itinerary.city}</span>
              <span>•</span>
              <span>Transport: {itinerary.transport_mode}</span>
              <span>•</span>
              <span>Est. Cost: ₹{itinerary.total_estimated_cost}</span>
            </div>
          </div>

          {/* Stops List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Planned Itinerary Stops</h4>
            {itinerary.stops.map((stop, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-300 bg-slate-50/50 print:bg-white text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{stop.order_index}. {stop.name}</span>
                  <span>{stop.suggested_arrival} ({stop.duration_minutes} min stay)</span>
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" /> {stop.address}
                </div>
                <div className="text-slate-500 text-[11px] mt-1">{stop.notes}</div>
              </div>
            ))}
          </div>

          {/* Emergency Numbers */}
          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-100 text-xs">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-rose-600" /> Vital Emergency Numbers (Pune)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 mt-1">
              <div>Police Emergency: <b>112 / 100</b></div>
              <div>Ambulance: <b>108 / 102</b></div>
              <div>PMC Disaster Cell: <b>020-25501269</b></div>
              <div>Women Helpline: <b>1091</b></div>
            </div>
          </div>

          {/* Offline Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Offline Notice: </span>
              <span>Offline card retains information at time of generation. Road conditions and opening hours may change dynamically. Does not provide live hazard alerts while offline.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors print:hidden"
        >
          Close
        </button>
      </div>
    </div>
  );
};
