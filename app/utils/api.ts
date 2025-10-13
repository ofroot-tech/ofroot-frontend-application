import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
});

// Attach auth header from cookie via Next API only on server side
// For client-side simplicity, we rely on Next API routes to handle cookies securely.
api.interceptors.request.use((config) => {
  // No token from localStorage; tokens are httpOnly cookies managed by Next API routes
  return config;
});

export default api;
