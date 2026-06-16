// BackhaulAI API Client
// Configurable base URL — defaults to local backend, override with VITE_API_URL env var

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:3000';
const AI_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_URL) || 'http://localhost:8004';

// Helper: get stored auth token
function getToken(): string | null {
  try { return localStorage.getItem('backhaulai_token'); } catch { return null; }
}

// Generic fetch wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const json = await res.json();
    if (!res.ok) return { error: json.message || json.error || `Request failed (${res.status})` };
    return { data: json };
  } catch (err: any) {
    return { error: err.message || 'Network error — is the backend running?' };
  }
}

// === Auth ===
export const auth = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data: { name: string; email: string; password: string; role: string }) =>
    apiFetch<{ token: string; user: any }>('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
};

// === Users ===
export const users = {
  getProfile: () => apiFetch<any>('/api/users/profile'),
  updateProfile: (data: any) => apiFetch<any>('/api/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  submitKYC: (data: any) => apiFetch<any>('/api/users/kyc', { method: 'POST', body: JSON.stringify(data) }),
};

// === Loads ===
export const loads = {
  list: (params?: string) => apiFetch<any[]>(`/api/loads${params ? `?${params}` : ''}`),
  getById: (id: string) => apiFetch<any>(`/api/loads/${id}`),
  create: (data: any) => apiFetch<any>('/api/loads', { method: 'POST', body: JSON.stringify(data) }),
};

// === Trips ===
export const trips = {
  list: () => apiFetch<any[]>('/api/trips'),
  book: (loadId: string) => apiFetch<any>('/api/trips/book', { method: 'POST', body: JSON.stringify({ loadId }) }),
  updateStatus: (id: string, status: string) => apiFetch<any>(`/api/trips/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// === Stats / Discovery ===
export const stats = {
  getDashboard: () => apiFetch<any>('/api/stats'),
};

export const discovery = {
  matchReturn: (data: { origin: string; destination: string; truckType?: string }) =>
    apiFetch<any[]>('/api/match-return', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => apiFetch<any>('/api/stats'),
};

// === Health ===
export const health = {
  check: () => apiFetch<{ status: string }>('/health'),
};

// === AI Agents (port 8004) ===
export async function aiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(`${AI_BASE_URL}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers as any) } });
    const json = await res.json();
    if (!res.ok) return { error: json.message || json.error || 'AI request failed' };
    return { data: json };
  } catch (err: any) {
    return { error: err.message || 'AI network error' };
  }
}

export const ai = {
  discover: (params?: any) => aiFetch<any[]>('/discover', { method: 'POST', body: JSON.stringify(params || {}) }),
  optimize: (params: any) => aiFetch<any>('/optimize', { method: 'POST', body: JSON.stringify(params) }),
};