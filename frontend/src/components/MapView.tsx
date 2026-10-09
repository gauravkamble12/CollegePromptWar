import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, ShieldAlert, MapPin, Eye, ListFilter, AlertTriangle, Info } from 'lucide-react';
import { Place, CivicReport } from '../types';

interface MapViewProps {
  places: Place[];
  incidents: CivicReport[];
  onSelectPlace: (place: Place) => void;
  selectedPlace?: Place | null;
  activeRouteWaypoints?: [number, number][];
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  incidents,
  onSelectPlace,
  selectedPlace,
  activeRouteWaypoints
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [showIncidents, setShowIncidents] = useState(true);
  const [showPlaces, setShowPlaces] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isListViewActive, setIsListViewActive] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Pune
    const map = L.map(mapContainerRef.current).setView([18.5204, 73.8567], 13);
    mapInstanceRef.current = map;

    // Free OpenStreetMap CartoDB Positron / OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when places, incidents or category changes
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    markersLayerRef.current.clearLayers();

    // 1. Add Place markers
    if (showPlaces) {
      places.forEach((place) => {
        if (selectedCategory !== 'all' && place.category !== selectedCategory) return;

        const isHistorical = place.category === 'historical' || place.category === 'museum';
        const isFood = place.category === 'restaurant' || place.category === 'street_food';
        const pinColor = isHistorical ? '#b45309' : isFood ? '#ea580c' : '#4f46e5';

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
              ${place.name.charAt(0)}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([place.latitude, place.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 180px;">
            <div style="font-size: 10px; font-weight: 700; color: #6366f1; text-transform: uppercase;">${place.category}</div>
            <div style="font-size: 14px; font-weight: 700; margin: 2px 0; color: #0f172a;">${place.name}</div>
            <div style="font-size: 12px; color: #64748b;">${place.address}</div>
            <div style="margin-top: 8px; font-size: 11px; font-weight: 600; color: #059669;">
              Trust: ${place.trust_indicator?.composite_score || 85}% | ${place.estimated_cost_inr > 0 ? `₹${place.estimated_cost_inr}` : 'Free'}
            </div>
          </div>
        `);

        marker.on('click', () => {
          onSelectPlace(place);
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Add Incident markers
    if (showIncidents) {
      incidents.forEach((inc) => {
        const isVerified = inc.status === 'verified';
        const incColor = inc.severity_level === 'high' ? '#e11d48' : isVerified ? '#d97706' : '#64748b';

        const incidentIcon = L.divIcon({
          className: 'incident-map-pin',
          html: `
            <div style="background-color: ${incColor}; width: 22px; height: 22px; border-radius: 6px; border: 2px solid white; box-shadow: 0 3px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
              !
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([inc.latitude, inc.longitude], { icon: incidentIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 180px;">
            <div style="font-size: 10px; font-weight: 700; color: ${incColor}; text-transform: uppercase;">
              ${inc.category.replace('_', ' ')} (${inc.status})
            </div>
            <div style="font-size: 13px; font-weight: 700; margin: 2px 0; color: #0f172a;">${inc.title}</div>
            <div style="font-size: 11px; color: #64748b;">${inc.description}</div>
            <div style="margin-top: 6px; font-size: 10px; color: #94a3b8;">
              ${isVerified ? '✓ Municipal / Citizen Corroborated' : '⏳ Pending Community Verification'}
            </div>
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [places, incidents, showPlaces, showIncidents, selectedCategory, onSelectPlace]);

  // Handle active route polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (activeRouteWaypoints && activeRouteWaypoints.length > 1) {
      const poly = L.polyline(activeRouteWaypoints, {
        color: '#4f46e5',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(mapInstanceRef.current);

      routePolylineRef.current = poly;
      mapInstanceRef.current.fitBounds(poly.getBounds(), { padding: [40, 40] });
    }
  }, [activeRouteWaypoints]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[750px]">
      {/* Top Map Control Bar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" /> Map Layers:
          </span>
          <button
            onClick={() => setShowPlaces(!showPlaces)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              showPlaces
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Places ({places.length})
          </button>
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
              showIncidents
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Incidents & Hazards ({incidents.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Accessible List Alternative Toggle */}
          <button
            onClick={() => setIsListViewActive(!isListViewActive)}
            className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            aria-label="Toggle accessible non-visual list representation"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{isListViewActive ? 'Show Visual Map' : 'Accessible List View'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area: Leaflet Map or Accessible List */}
      <div className="flex-1 relative">
        {isListViewActive ? (
          <div className="absolute inset-0 overflow-y-auto p-6 bg-slate-50 space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Accessible Screen-Reader List Mode: Showing all mapped places and civic hazard alerts in structured tabular order.</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Discovered Locations ({places.length})</h3>
              <div className="space-y-2">
                {places.map((p) => (
                  <div key={p.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{p.name} ({p.category})</div>
                      <div className="text-xs text-slate-500">{p.address}</div>
                    </div>
                    <button
                      onClick={() => onSelectPlace(p)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
                    >
                      Inspect Place
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-rose-900 mb-2">Reported Civic Hazards ({incidents.length})</h3>
              <div className="space-y-2">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-3 bg-white rounded-xl border border-rose-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{inc.title} - Severity: {inc.severity_level}</div>
                      <div className="text-xs text-slate-600">{inc.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Status: {inc.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '600px' }} />
        )}
      </div>

      {/* Map Legend */}
      <div className="p-2.5 bg-white border-t border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> Standard Place
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-700 inline-block"></span> Heritage / History
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-600 inline-block"></span> High Civic Hazard
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-600 inline-block"></span> Verified Community Alert
          </span>
        </div>
        <div className="text-slate-400">
          Tiles: OpenStreetMap Carto • Geolocation subject to browser permission
        </div>
      </div>
    </div>
  );
};
