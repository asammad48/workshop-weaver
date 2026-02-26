import { useNavigate } from 'react-router-dom';
import { DashboardOverviewResponse } from '@/api/generated/apiClient';
import { KpiCard } from './components/KpiCard';
import { ChartCard } from './components/ChartCard';
import { AlertTable } from './components/AlertTable';

interface DashboardProps {
  data: DashboardOverviewResponse;
  loading: boolean;
}

export function TechDashboard({ data, loading }: DashboardProps) {
  const navigate = useNavigate();

  const alerts = data.alerts?.topJobCardAlerts || [];

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
            title="Tasks Completed"
            series={data.series.filter(s =>
              ['tasks_completed'].includes(s.key || '')
            )}
          />
        )}
      </div>

      {/* Alerts Table */}
      <AlertTable
        title="My Active Job Cards"
        loading={loading}
        data={alerts}
        onRowClick={(item) => navigate(`/jobcards/${item.jobCardId}`)}
        columns={[
          { header: 'Plate', render: (item) => item.plate || '-' },
          { header: 'Status', render: (item) => item.status || '-' },
          { header: 'Has Roadblocker', render: (item) => item.hasRoadblocker ? 'Yes' : 'No' }
        ]}
      />
    </div>
  );
}
