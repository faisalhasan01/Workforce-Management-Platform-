import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT & Active Organization Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    const orgId = localStorage.getItem('nexus_org_id');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (orgId) {
      config.headers['x-organization-id'] = orgId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Authorization Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clear token and notify
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // We can emit event or let context handle
      }
    }
    return Promise.reject(error);
  }
);

export default api;
