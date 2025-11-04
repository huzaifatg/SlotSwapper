import axios from 'axios';

// Use relative URL for production, absolute for development
const API_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Event Services
export const eventService = {
  getMyEvents: async () => {
    const response = await api.get('/events/mine');
    return response.data;
  },

  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEventStatus: async (eventId, status) => {
    const response = await api.put(`/events/${eventId}/status`, { status });
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  }
};

// Swap Services
export const swapService = {
  getSwappableSlots: async () => {
    const response = await api.get('/swappable-slots');
    return response.data;
  },

  initiateSwap: async (swapData) => {
    const response = await api.post('/swap-request', swapData);
    return response.data;
  },

  respondToSwap: async (requestId, accepted) => {
    const response = await api.post(`/swap-response/${requestId}`, { accepted });
    return response.data;
  },

  getIncomingSwaps: async () => {
    const response = await api.get('/swaps/incoming');
    return response.data;
  },

  getOutgoingSwaps: async () => {
    const response = await api.get('/swaps/outgoing');
    return response.data;
  }
};

export default api;
