import axiosInstance from '../api';
import { LoginRequest, LoginResponse } from '../types';

interface RecoverPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface AuthSession {
  token: string;
  user: LoginResponse;
}

const STORAGE_KEY = 'sapr_auth_session';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthSession> => {
    const { data } = await axiosInstance.post<LoginResponse>('/auth/login', credentials);

    return {
      token: data.token,
      user: data,
    };
  },

  recoverPassword: async (payload: RecoverPasswordRequest): Promise<void> => {
    await axiosInstance.post('/auth/recover-password', payload);
  },

  resetPassword: async (payload: ResetPasswordRequest): Promise<void> => {
    await axiosInstance.post('/auth/reset-password', payload);
  },

  saveSession: (session: AuthSession, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    storage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  getSession: (): AuthSession | null => {
    const stored = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthSession;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  },

  isAuthenticated: (): boolean => {
    return Boolean(localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY));
  },

  getToken: (): string | null => {
    const session = authService.getSession();
    return session?.token ?? null;
  },
};
