import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const STORAGE_KEY = 'sapr_auth_session';

function getTokenFromStorage(): string | null {
  const rawSession = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  // Public auth endpoints must never carry stale bearer tokens.
  const publicAuthEndpoints = ['/auth/login', '/auth/recover-password', '/auth/reset-password'];
  if (publicAuthEndpoints.some((endpoint) => config.url?.includes(endpoint))) {
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = getTokenFromStorage();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
