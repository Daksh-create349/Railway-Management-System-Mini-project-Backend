const API_BASE = '/api';

export const getStoredToken = () => localStorage.getItem('railway_token') || '';
export const setStoredToken = (token) => {
  if (token) localStorage.setItem('railway_token', token);
  else localStorage.removeItem('railway_token');
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('railway_user') || 'null');
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) localStorage.setItem('railway_user', JSON.stringify(user));
  else localStorage.removeItem('railway_user');
};

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || data?.errors?.[0]?.message || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  // Trains
  getTrains: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.source) query.append('source', params.source);
    if (params.destination) query.append('destination', params.destination);
    if (params.page) query.append('page', params.page);
    return request(`/trains?${query.toString()}`);
  },
  createTrain: (body) => request('/trains', { method: 'POST', body: JSON.stringify(body) }),
  getSeatAvailability: (id) => request(`/trains/${id}/seats`),

  // Stations
  getStations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    return request(`/stations?${query.toString()}`);
  },
  createStation: (body) => request('/stations', { method: 'POST', body: JSON.stringify(body) }),

  // Passengers
  getPassengers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    return request(`/passengers?${query.toString()}`);
  },
  createPassenger: (body) => request('/passengers', { method: 'POST', body: JSON.stringify(body) }),

  // Bookings
  createBooking: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getAllBookings: (page = 1) => request(`/bookings?page=${page}`),
  getBookingByPNR: (pnr) => request(`/bookings/pnr/${pnr}`),
  getJourneyHistory: (passengerId) => request(`/bookings/history/${passengerId}`),
  cancelBooking: (id, reason) =>
    request(`/bookings/cancel/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // Admin Dashboard
  getDashboardMetrics: () => request('/admin/dashboard'),

  // Live Operations
  updateTrainStatus: (id, status) =>
    request(`/status/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  simulateTrainStatus: (id) =>
    request(`/status/${id}/simulate`, {
      method: 'POST',
    }),
  getNotifications: () => request('/notifications'),
};
