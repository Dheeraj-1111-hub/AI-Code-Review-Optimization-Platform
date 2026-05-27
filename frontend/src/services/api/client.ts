import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Automatically strip trailing /v1 if it was accidentally included in the environment variable
const baseURL = rawBaseUrl.replace(/\/v1\/?$/, '');

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Clerk Token
api.interceptors.request.use(
  async (config) => {
    try {
      // Access Clerk instance from window object
      const token = await (window as any).Clerk?.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to inject Clerk token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // If it's a 401, Clerk session might have expired.
    // Clerk handles automatic refresh on its end, so if it's 401, the user is likely signed out.
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - session may be expired');
    }
    return Promise.reject(error.response?.data || error);
  }
);
