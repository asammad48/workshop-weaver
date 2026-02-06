import { useAuthStore } from '@/state/authStore';

/**
 * Hook for accessing authentication state and actions
 */
export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  
  const isAuthenticated = !!accessToken;

  return {
    accessToken,
    user,
    isAuthenticated,
    setAuth,
    logout,
  };
}
