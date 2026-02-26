import { useNavigate } from 'react-router-dom';
import { DashboardOverviewResponse } from '@/api/generated/apiClient';
import { KpiCard } from './components/KpiCard';
import { ChartCard } from './components/ChartCard';
import { AlertTable } from './components/AlertTable';

interface DashboardProps {
  data: DashboardOverviewResponse;
  loading: boolean;
}

export function HqAdminDashboard({ data, loading }: DashboardProps) {
  const navigate = useNavigate();

  const alerts = data.alerts?.topJobCardAlerts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
            title="Overview"
            series={data.series.filter(s =>
              ['jobcards_created', 'jobcards_closed', 'revenue_collected'].includes(s.key || '')
            )}
          />
        )}
      </div>

      {/* Alerts Table */}
      <AlertTable
        title="Recent Job Cards"
        loading={loading}
        data={alerts}
        onRowClick={(item) => navigate(`/jobcards/${item.jobCardId}`)}
        columns={[
          { header: 'Plate', render: (item) => item.plate || '-' },
          { header: 'Customer', render: (item) => item.customerName || '-' },
          { header: 'Status', render: (item) => (
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'var(--c-bg-alt)',
              border: '1px solid var(--c-border)'
            }}>
              {item.status}
            </span>
          )},
          { header: 'Days in Shop', render: (item) => item.daysInShop || 0 },
          { header: 'Requires Approval', render: (item) => item.requiresApproval ? 'Yes' : 'No' },
          { header: 'Due Amount', render: (item) => item.dueAmount ? `$${item.dueAmount.toFixed(2)}` : '$0.00' }
        ]}
      />
    </div>
  );
}
