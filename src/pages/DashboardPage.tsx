import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardRepo } from '@/api/repositories/dashboardRepo';
import { DashboardOverviewResponse } from '@/api/generated/apiClient';
import { DateRangePicker } from '@/features/dashboard/components/DateRangePicker';
import { Calendar, Download, Loader2 } from 'lucide-react';
import { HqAdminDashboard } from '@/features/dashboard/HqAdminDashboard';
import { ManagerDashboard } from '@/features/dashboard/ManagerDashboard';
import { StoreDashboard } from '@/features/dashboard/StoreDashboard';
import { CashierDashboard } from '@/features/dashboard/CashierDashboard';
import { TechDashboard } from '@/features/dashboard/TechDashboard';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { reportsRepo } from '@/api/repositories/reportsRepo';
import { toast } from '@/components/ui/Toast';
import { downloadJobCardsPdf } from '@/features/dashboard/jobCardReportPdf';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });

  const [reportOpen, setReportOpen] = useState(false);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportPreview, setReportPreview] = useState<Array<{ jobCardId?: string; customerName?: string; vehiclePlate?: string; status?: string }>>([]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardRepo.overview({
        branchId: user?.branchId,
        from: dateRange.from,
        to: dateRange.to,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setData(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user, dateRange]);

  const reportDateLabel = useMemo(() => {
    if (!reportFrom && !reportTo) return 'All dates';
    return `${reportFrom || '-'} to ${reportTo || '-'}`;
  }, [reportFrom, reportTo]);

  const handleDownloadReport = async () => {
    setReportLoading(true);
    try {
      const res = await reportsRepo.jobCards(
        reportFrom ? new Date(reportFrom) : undefined,
        reportTo ? new Date(reportTo) : undefined,
      );

      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to load report data');
        return;
      }

      const items = res.data.items ?? [];
      setReportPreview(items.slice(0, 8));
      downloadJobCardsPdf(items, reportFrom, reportTo);
      toast.success(`Report downloaded with ${items.length} records`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download report';
      toast.error(message);
    } finally {
      setReportLoading(false);
    }
  };

  const renderRoleDashboard = () => {
    if (!data) return null;

    const role = user?.role?.toUpperCase();

    switch (role) {
      case 'HQ_ADMIN':
        return <HqAdminDashboard data={data} loading={loading} />;
      case 'BRANCH_MANAGER':
      case 'MANAGER':
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
        return <HqAdminDashboard data={data} loading={loading} />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--c-text)', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--c-muted)', fontSize: '14px' }}>Welcome back, {user?.email}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setReportOpen((v) => !v)}>
            <Download size={16} style={{ marginRight: '8px' }} />
            Download Report
          </Button>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 12px',
              background: 'var(--c-card)',
              border: '1px solid var(--c-border)',
              borderRadius: '8px',
              color: 'var(--c-muted)',
              fontSize: '14px',
              height: '40px',
            }}
          >
            <Calendar size={16} />
            <span style={{ whiteSpace: 'nowrap' }}>Last 30 Days</span>
          </div>
          <DateRangePicker from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
        </div>
      </div>

      {reportOpen && (
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ minWidth: '200px', flex: 1 }}>
                <Input label="From Date" type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
              </div>
              <div style={{ minWidth: '200px', flex: 1 }}>
                <Input label="To Date" type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
              </div>
              <Button onClick={handleDownloadReport} disabled={reportLoading}>
                {reportLoading ? <Loader2 size={16} className="animate-spin" style={{ marginRight: '8px' }} /> : <Download size={16} style={{ marginRight: '8px' }} />}
                Apply & Download PDF
              </Button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--c-muted)' }}>Selected range: {reportDateLabel}</div>

            {reportPreview.length > 0 && (
              <div style={{ overflowX: 'auto', border: '1px solid var(--c-border)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--c-muted)' }}>Job Card</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--c-muted)' }}>Customer</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--c-muted)' }}>Plate</th>
                      <th style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--c-muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportPreview.map((item, idx) => (
                      <tr key={`${item.jobCardId || idx}-${idx}`} style={{ borderBottom: '1px solid var(--c-border)' }}>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--c-text)' }}>{item.jobCardId?.slice(-8) || '-'}</td>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--c-text)' }}>{item.customerName || '-'}</td>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--c-text)' }}>{item.vehiclePlate || '-'}</td>
                        <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--c-text)' }}>{item.status || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {loading && !data ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: 'var(--c-primary)' }} />
        </div>
      ) : error ? (
        <div style={{ padding: '24px', backgroundColor: 'var(--c-danger-soft)', color: 'var(--c-danger)', borderRadius: '8px', textAlign: 'center' }}>
          {error}
        </div>
      ) : (
        renderRoleDashboard()
      )}
    </div>
  );
}
