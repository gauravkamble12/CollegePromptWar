import React from 'react';
import { Compass, GraduationCap, Users, Accessibility, Landmark, Utensils, Train, CloudRain } from 'lucide-react';

interface CityModeSelectorProps {
  currentMode: string;
  onSelectMode: (mode: string) => void;
}

export const CITY_MODES = [
  { id: 'tourist', name: 'Tourist', icon: Compass, desc: 'High-rated highlights & major landmarks' },
  { id: 'student', name: 'Student Budget', icon: GraduationCap, desc: 'Top value, street food & low-cost exploration' },
  { id: 'family', name: 'Family Friendly', icon: Users, desc: 'Spacious parks, safety-first & kid amenities' },
  { id: 'accessibility', name: 'Accessibility First', icon: Accessibility, desc: 'Strict step-free & wheelchair-verified sites' },
  { id: 'history', name: 'Heritage & History', icon: Landmark, desc: 'Fortresses, museums & Maratha empire lore' },
  { id: 'food', name: 'Food Explorer', icon: Utensils, desc: 'Authentic Puneri misal, cafes & bakeries' },
  { id: 'commuter', name: 'Daily Commuter', icon: Train, desc: 'Transit hubs, arterial corridors & metro access' },
  { id: 'rainy', name: 'Rainy-Day', icon: CloudRain, desc: 'Indoor museums, covered bazaars & shelter' },
];

export const CityModeSelector: React.FC<CityModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personalized City Mode</h2>
          <p className="text-xs text-slate-500">Select an exploration lens to re-calibrate intelligence rankings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {CITY_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all duration-200 ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs ring-1 ring-indigo-500'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
              title={mode.desc}
              aria-pressed={isActive}
            >
              <div className={`p-1.5 rounded-lg mb-1.5 ${isActive ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 shadow-2xs'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">{mode.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
