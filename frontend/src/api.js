// Single place where the frontend talks to the backend (docs/api-contract.md).
// While the backend is not ready, USE_MOCK stays true. Set it to false to call the real API.
import { mockSearchStops, mockSearchRoutes, mockChat } from './mock/mockApi.js';

const USE_MOCK = true;
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    throw new Error(`Server error ${res.status}`);
  }
  return res.json();
}

// GET /stops?q=&limit=
export function searchStops(q, limit = 10) {
  if (USE_MOCK) return mockSearchStops(q, limit);
  return request(`/stops?q=${encodeURIComponent(q)}&limit=${limit}`);
}

// POST /routes/search
export function searchRoutes(body) {
  if (USE_MOCK) return mockSearchRoutes(body);
  return request('/routes/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// POST /chat
export function sendChat(body) {
  if (USE_MOCK) return mockChat(body);
  return request('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
