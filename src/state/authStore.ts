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
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const TOKEN_KEY = 'workshop_token';
const USER_KEY = 'workshop_user';

const loadInitialState = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { accessToken: token, user };
  } catch {
    return { accessToken: null, user: null };
  }
};

const initial = loadInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: initial.accessToken,
  user: initial.user,

  setAuth: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ accessToken: token, user });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ accessToken: null, user: null });
  },

  isAuthenticated: () => {
    return !!get().accessToken;
  },
}));
