import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardRepo } from '@/api/repositories/dashboardRepo';
import { DashboardOverviewResponse } from '@/api/generated/apiClient';
import { DateRangePicker } from '@/features/dashboard/components/DateRangePicker';
import { Loader2, Calendar } from 'lucide-react';
import { HqAdminDashboard } from '@/features/dashboard/HqAdminDashboard';
import { ManagerDashboard } from '@/features/dashboard/ManagerDashboard';
import { StoreDashboard } from '@/features/dashboard/StoreDashboard';
import { CashierDashboard } from '@/features/dashboard/CashierDashboard';
import { TechDashboard } from '@/features/dashboard/TechDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardRepo.overview({
        branchId: user?.branchId,
        from: dateRange.from,
        to: dateRange.to,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user, dateRange]);

  const renderRoleDashboard = () => {
    if (!data) return null;

    const role = user?.role?.toUpperCase();

    switch (role) {
      case 'HQ_ADMIN':
        return <HqAdminDashboard data={data} loading={loading} />;
      case 'BRANCH_MANAGER':
      case 'MANAGER': // just in case
        return <ManagerDashboard data={data} loading={loading} />;
      case 'STOREKEEPER':
      case 'STORE':
        return <StoreDashboard data={data} loading={loading} />;
      case 'CASHIER':
        return <CashierDashboard data={data} loading={loading} />;
      case 'TECHNICIAN':
      case 'TECH':
        return <TechDashboard data={data} loading={loading} />;
      default:
        // Fallback to a basic view if role is unknown or RECEPTIONIST
        return <HqAdminDashboard data={data} loading={loading} />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--c-text)', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '14px' }}>
            Welcome back, {user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            background: 'var(--c-card)',
            border: '1px solid var(--c-border)',
            borderRadius: '8px',
            color: 'var(--c-muted)',
            fontSize: '14px',
            height: '40px'
          }}>
            <Calendar size={16} />
            <span style={{ whiteSpace: 'nowrap' }}>Last 30 Days</span>
          </div>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onChange={setDateRange}
          />
        </div>
      </div>

      {loading && !data ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: 'var(--c-primary)' }} />
        </div>
      ) : error ? (
        <div style={{
          padding: '24px',
          backgroundColor: 'var(--c-danger-soft)',
          color: 'var(--c-danger)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      ) : (
        renderRoleDashboard()
      )}
    </div>
  );
}
