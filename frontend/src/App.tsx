import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  SlidersHorizontal,
  Accessibility,
  Users,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CityModeSelector } from './components/CityModeSelector';
import { PlaceCard } from './components/PlaceCard';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { TrustModal } from './components/TrustModal';
import { MapView } from './components/MapView';
import { RoutePlanner } from './components/RoutePlanner';
import { AIAssistant } from './components/AIAssistant';
import { ItineraryPlannerView } from './components/ItineraryPlannerView';
import { ComparisonView } from './components/ComparisonView';
import { CitizenReportForm } from './components/CitizenReportForm';
import { ModeratorView } from './components/ModeratorView';
import { CityPulseView } from './components/CityPulseView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { OfflineTravelCard } from './components/OfflineTravelCard';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import { Place, CivicReport, ItineraryPlan } from './types';
import { useAuth } from './context/AuthContext';

export function App() {
  const { cityMode, setCityMode, isModerator } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('discover');

  // Discovery State
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [familyOnly, setFamilyOnly] = useState<boolean>(false);
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);

  // Map & Incident Data
  const [incidents, setIncidents] = useState<CivicReport[]>([]);
  const [activeRouteWaypoints, setActiveRouteWaypoints] = useState<[number, number][] | undefined>(undefined);

  // Modals
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [trustModalPlace, setTrustModalPlace] = useState<Place | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [offlinePlan, setOfflinePlan] = useState<ItineraryPlan | null>(null);

  // Load Categories & Incidents
  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getReports().then(setIncidents).catch(() => {});
  }, []);

  // Fetch Places whenever filters change
  const fetchPlaces = async () => {
    setLoadingPlaces(true);
    try {
      const data = await api.getPlaces({
        category: selectedCategory,
        search: searchQuery,
        wheelchairOnly,
        familyOnly,
        maxBudget,
        cityMode
      });
      setPlaces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [selectedCategory, searchQuery, wheelchairOnly, familyOnly, maxBudget, cityMode]);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* City Mode Selector (visible across exploration views) */}
        {['discover', 'map', 'itinerary', 'compare'].includes(activeTab) && (
          <CityModeSelector
            currentMode={cityMode}
            onSelectMode={(mode) => setCityMode(mode)}
          />
        )}

        {/* TAB 1: DISCOVER */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search monuments, local food, cafes, parks..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWheelchairOnly(!wheelchairOnly)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      wheelchairOnly
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Accessibility className="w-3.5 h-3.5" /> Step-Free Only
                  </button>

                  <button
                    onClick={() => setFamilyOnly(!familyOnly)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      familyOnly
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Family Friendly
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Places Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Verified City Highlights ({places.length})
                </h2>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>CityTrust Intelligence Scored</span>
                </div>
              </div>

              {loadingPlaces ? (
                <div className="text-center py-20 text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Filtering verified city records...</span>
                </div>
              ) : places.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500 text-xs">
                  No places match your active filters. Try broadening your criteria or changing city mode.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {places.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onSelect={(p) => setSelectedPlace(p)}
                      onOpenTrust={(p) => setTrustModalPlace(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <MapView
            places={places}
            incidents={incidents}
            onSelectPlace={(p) => setSelectedPlace(p)}
            selectedPlace={selectedPlace}
            activeRouteWaypoints={activeRouteWaypoints}
          />
        )}

        {/* TAB 3: SAFER ROUTES */}
        {activeTab === 'safety' && (
          <RoutePlanner
            onRouteSelect={(waypoints) => {
              setActiveRouteWaypoints(waypoints);
              setActiveTab('map');
            }}
          />
        )}

        {/* TAB 4: AI CITY ASSISTANT */}
        {activeTab === 'ai' && (
          <AIAssistant
            onSelectPlace={(p) => {
              const fullPlace = places.find((pl) => pl.id === p.id);
              if (fullPlace) setSelectedPlace(fullPlace);
            }}
          />
        )}

        {/* TAB 5: ITINERARY PLANNER */}
        {activeTab === 'itinerary' && (
          <ItineraryPlannerView
            onOpenOfflineCard={(plan) => setOfflinePlan(plan)}
          />
        )}

        {/* TAB 6: COMPARE PLACES */}
        {activeTab === 'compare' && (
          <ComparisonView places={places} />
        )}

        {/* TAB 7: CITIZEN REPORTING */}
        {activeTab === 'reports' && (
          <CitizenReportForm />
        )}

        {/* TAB 8: LIVE CITY PULSE */}
        {activeTab === 'pulse' && (
          <CityPulseView />
        )}

        {/* TAB 9: MODERATOR DASHBOARD */}
        {activeTab === 'moderator' && (
          <ModeratorView />
        )}

        {/* TAB 10: KNOWLEDGE GRAPH */}
        {activeTab === 'graph' && (
          <KnowledgeGraphView />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-900 text-sm">City Life: Smart City Explorer</div>
            <div>Built for Pune Urban Exploration • Archaeological Survey of India (ASI) & Open-Meteo Verified</div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('graph')} className="hover:text-indigo-600 transition-colors">
              Knowledge Graph
            </button>
            <button onClick={() => setActiveTab('pulse')} className="hover:text-indigo-600 transition-colors">
              Live Pulse
            </button>
            <button onClick={() => setActiveTab('reports')} className="hover:text-indigo-600 transition-colors">
              Submit Report
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onOpenTrust={() => {
            setTrustModalPlace(selectedPlace);
          }}
        />
      )}

      {trustModalPlace && (
        <TrustModal
          place={trustModalPlace}
          onClose={() => setTrustModalPlace(null)}
        />
      )}

      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}

      {offlinePlan && (
        <OfflineTravelCard
          itinerary={offlinePlan}
          onClose={() => setOfflinePlan(null)}
        />
      )}
    </div>
  );
}
export default App;
