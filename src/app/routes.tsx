import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './security/ProtectedRoute';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import MePage from '@/pages/auth/MePage';

// Main pages
import DashboardPage from '@/pages/DashboardPage';
import ThemePage from '@/pages/ThemePage';
import NotFoundPage from '@/pages/NotFoundPage';

// Operations
import JobCardsPage from '@/pages/JobCardsPage';
import CustomersPage from '@/pages/CustomersPage';
import VehiclesPage from '@/pages/VehiclesPage';

// Inventory
import InventoryPage from '@/pages/InventoryPage';
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage';
import TransfersPage from '@/pages/TransfersPage';

// Finance & Reports
import FinancePage from '@/pages/FinancePage';
import ReportsPage from '@/pages/ReportsPage';

// Admin
import UsersPage from '@/pages/admin/UsersPage';
import BranchesPage from '@/pages/admin/BranchesPage';
import AuditPage from '@/pages/admin/AuditPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Main */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/theme" element={<ThemePage />} />

        {/* Operations */}
        <Route path="/jobcards" element={<JobCardsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />

        {/* Inventory */}
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/inventory/transfers" element={<TransfersPage />} />

        {/* Finance & Reports */}
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/reports" element={<ReportsPage />} />

        {/* Admin */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/branches" element={<BranchesPage />} />
        <Route path="/admin/audit" element={<AuditPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
