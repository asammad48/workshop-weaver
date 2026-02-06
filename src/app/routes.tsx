import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './security/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import MePage from '@/pages/auth/MePage';
import DashboardPage from '@/pages/DashboardPage';
import ThemePage from '@/pages/ThemePage';
import NotFoundPage from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/theme" element={<ThemePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
