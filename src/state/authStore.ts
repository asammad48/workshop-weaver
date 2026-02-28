import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  branchId?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const TOKEN_KEY = 'workshop_token';
const REFRESH_TOKEN_KEY = 'workshop_refresh_token';
const USER_KEY = 'workshop_user';

const loadInitialState = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { accessToken: token, refreshToken, user };
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
};

const initial = loadInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: initial.accessToken,
  refreshToken: initial.refreshToken,
  user: initial.user,

  setAuth: (token: string, refreshToken: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ accessToken: token, refreshToken, user });
  },

  setAccessToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ accessToken: token });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ accessToken: null, refreshToken: null, user: null });
  },

  isAuthenticated: () => {
    return !!get().accessToken;
  },
}));
