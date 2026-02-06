import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/state/authStore';
import { AppLayout } from '@/components/layout/AppLayout';

/**
 * Route guard that redirects to login if no token exists
 */
export function ProtectedRoute() {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();

  if (!token) {
    // Redirect to login, preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
