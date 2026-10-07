import axios from 'axios';

// all backend calls go through this one axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// send the login token with every request: admin routes use the admin token, the rest use the coach token
api.interceptors.request.use((config) => {
  const key = config.url.startsWith('/admin') ? 'adminToken' : 'coachToken';
  const token = sessionStorage.getItem(key);
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export default api;
