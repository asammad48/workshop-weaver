import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardOverviewResponse, JobCardAlertRow } from '@/api/generated/apiClient';
import { dashboardRepo } from '@/api/repositories/dashboardRepo';
import { KpiCard } from './components/KpiCard';
import { ChartCard } from './components/ChartCard';
import { AlertTable } from './components/AlertTable';

interface DashboardProps {
  data: DashboardOverviewResponse;
  loading: boolean;
}

export function CashierDashboard({ data, loading }: DashboardProps) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<JobCardAlertRow[]>([]);
  const [extraLoading, setExtraLoading] = useState(true);

  useEffect(() => {
    const fetchExtra = async () => {
      setExtraLoading(true);
      try {
        const res = await dashboardRepo.jobcards({ branchId: data.branchId, requiresApprovalRole: 'Cashier' });
        setAlerts(res.items || []);
      } catch (err) {
        console.error('Failed to fetch cashier jobcard alerts', err);
      } finally {
        setExtraLoading(false);
      }
    };

    if (data.branchId) {
      fetchExtra();
    }
  }, [data.branchId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {data.cards?.map(card => (
          <KpiCard
            key={card.key}
            cardKey={card.key}
            title={card.title || ''}
            value={card.value || 0}
            unit={card.unit}
            trend={card.trend}
            deltaPercent={card.deltaPercent}
          />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {data.series && data.series.length > 0 && (
          <ChartCard
            title="Collections"
            series={data.series.filter(s =>
              ['payments_collected'].includes(s.key || '')
            )}
          />
        )}
      </div>

      {/* Alerts Table */}
      <AlertTable
        title="Job Cards Awaiting Cashier Approval"
        loading={extraLoading || loading}
        data={alerts}
        onRowClick={(item) => navigate(`/jobcards/${item.jobCardId}`)}
        columns={[
          { header: 'Plate', render: (item) => item.plate || '-' },
          { header: 'Customer', render: (item) => item.customerName || '-' },
          { header: 'Status', render: (item) => item.status || '-' },
          { header: 'Due Amount', render: (item) => item.dueAmount ? `$${item.dueAmount.toFixed(2)}` : '$0.00' }
        ]}
      />
    </div>
  );
}
