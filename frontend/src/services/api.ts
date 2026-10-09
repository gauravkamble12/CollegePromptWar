import {
  Place,
  CivicReport,
  RouteComparisonResponse,
  ItineraryPlan,
  ComparisonResult,
  CityPulseData,
  User
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('citylife_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Places & Discovery
  async getPlaces(params: {
    category?: string;
    maxBudget?: number;
    minRating?: number;
    wheelchairOnly?: boolean;
    familyOnly?: boolean;
    search?: string;
    cityMode?: string;
    userLat?: number;
    userLng?: number;
  }): Promise<Place[]> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.maxBudget) query.set('max_budget_inr', params.maxBudget.toString());
    if (params.minRating) query.set('min_rating', params.minRating.toString());
    if (params.wheelchairOnly) query.set('wheelchair_only', 'true');
    if (params.familyOnly) query.set('family_only', 'true');
    if (params.search) query.set('search', params.search);
    if (params.cityMode) query.set('city_mode', params.cityMode);
    if (params.userLat) query.set('user_lat', params.userLat.toString());
    if (params.userLng) query.set('user_lng', params.userLng.toString());

    const res = await fetch(`${API_BASE}/places?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load places');
    return res.json();
  },

  async getPlaceDetail(id: number): Promise<Place> {
    const res = await fetch(`${API_BASE}/places/${id}`);
    if (!res.ok) throw new Error('Failed to load place details');
    return res.json();
  },

  async getCategories(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/places/categories`);
    if (!res.ok) return ['all', 'historical', 'museum', 'restaurant', 'street_food', 'park', 'shopping', 'hospital', 'transit'];
    const data = await res.json();
    return data.categories || [];
  },

  // Map & Routes
  async getMapLayers(category?: string): Promise<any> {
    const url = category && category !== 'all' ? `${API_BASE}/map/layers?category=${category}` : `${API_BASE}/map/layers`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load map layers');
    return res.json();
  },

  async compareRoutes(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    mode = 'walking'
  ): Promise<RouteComparisonResponse> {
    const q = new URLSearchParams({
      start_lat: startLat.toString(),
      start_lng: startLng.toString(),
      end_lat: endLat.toString(),
      end_lng: endLng.toString(),
      mode
    });
    const res = await fetch(`${API_BASE}/map/routes?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch route comparison');
    return res.json();
  },

  async getEmergencyServices(): Promise<any> {
    const res = await fetch(`${API_BASE}/map/emergency`);
    if (!res.ok) throw new Error('Failed to load emergency services');
    return res.json();
  },

  // AI Assistant
  async askAI(payload: {
    query: string;
    city_mode?: string;
    budget_inr?: number;
    max_time_hours?: number;
    require_wheelchair?: boolean;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI query failed');
    return res.json();
  },

  // Itinerary Planner
  async generateItinerary(payload: {
    city?: string;
    total_hours: number;
    total_budget_inr: number;
    transport_mode: string;
    city_mode: string;
    accessibility_required?: boolean;
  }): Promise<ItineraryPlan> {
    const res = await fetch(`${API_BASE}/itineraries/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate itinerary');
    return res.json();
  },

  async saveItinerary(itinerary: ItineraryPlan): Promise<any> {
    const res = await fetch(`${API_BASE}/itineraries/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(itinerary)
    });
    if (!res.ok) throw new Error('Failed to save itinerary');
    return res.json();
  },

  // Best vs Worst Comparison
  async comparePlaces(placeIds: number[], weights?: Record<string, number>): Promise<ComparisonResult> {
    const res = await fetch(`${API_BASE}/comparison`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_ids: placeIds, weights })
    });
    if (!res.ok) throw new Error('Comparison failed');
    return res.json();
  },

  // Citizen Reporting
  async getReports(statusFilter?: string, category?: string): Promise<CivicReport[]> {
    const q = new URLSearchParams();
    if (statusFilter) q.set('status_filter', statusFilter);
    if (category) q.set('category', category);
    const res = await fetch(`${API_BASE}/reports?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
  },

  async submitReport(report: {
    category: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    address_reference?: string;
    severity_level?: string;
    photo_url?: string;
  }): Promise<CivicReport> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(report)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to submit report');
    }
    return res.json();
  },

  async uploadPhoto(file: File): Promise<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/reports/upload-photo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Photo upload failed');
    }
    return res.json();
  },

  async moderateReport(reportId: number, newStatus: string, moderatorNote?: string): Promise<CivicReport> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/moderate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ new_status: newStatus, moderator_note: moderatorNote })
    });
    if (!res.ok) throw new Error('Failed to moderate report');
    return res.json();
  },

  // Live Pulse
  async getCityPulse(): Promise<CityPulseData> {
    const res = await fetch(`${API_BASE}/pulse`);
    if (!res.ok) throw new Error('Failed to load city pulse data');
    return res.json();
  },

  // Knowledge Graph
  async getKnowledgeGraph(): Promise<any> {
    const res = await fetch(`${API_BASE}/knowledge-graph`);
    if (!res.ok) throw new Error('Failed to load knowledge graph');
    return res.json();
  },

  // Auth
  async login(emailOrUsername: string, password: string):Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_username: emailOrUsername, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(email: string, username: string, password: string, fullName?: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, full_name: fullName })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  }
};
