import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardOverviewResponse, JobCardAlertRow, EmployeeKpiRow } from '@/api/generated/apiClient';
import { dashboardRepo } from '@/api/repositories/dashboardRepo';
import { KpiCard } from './components/KpiCard';
import { ChartCard } from './components/ChartCard';
import { AlertTable } from './components/AlertTable';

interface DashboardProps {
  data: DashboardOverviewResponse;
  loading: boolean;
}

export function ManagerDashboard({ data, loading }: DashboardProps) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<JobCardAlertRow[]>([]);
  const [kpis, setKpis] = useState<EmployeeKpiRow[]>([]);
  const [extraLoading, setExtraLoading] = useState(true);

  useEffect(() => {
    const fetchExtra = async () => {
      setExtraLoading(true);
      try {
        const [jobcardsRes, kpiRes] = await Promise.all([
          dashboardRepo.jobcards({ branchId: data.branchId, minDaysInShop: 3, pageSize: 5 }),
          dashboardRepo.employeesKpi({ branchId: data.branchId, pageSize: 5 })
        ]);
        setAlerts(jobcardsRes.items || []);
        setKpis(kpiRes.items || []);
      } catch (err) {
        console.error('Failed to fetch extra dashboard data', err);
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
            title="Performance"
            series={data.series.filter(s =>
              ['jobcards_in_shop', 'tasks_completed'].includes(s.key || '')
            )}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Alerts Table */}
        <AlertTable
          title="Job Cards (3+ Days in Shop)"
          loading={extraLoading || loading}
          data={alerts}
          onRowClick={(item) => navigate(`/jobcards/${item.jobCardId}`)}
          columns={[
            { header: 'Plate', render: (item) => item.plate || '-' },
            { header: 'Status', render: (item) => item.status || '-' },
            { header: 'Days', render: (item) => item.daysInShop || 0 }
          ]}
        />

        {/* Employee KPI Table */}
        <AlertTable
          title="Employee Performance"
          loading={extraLoading || loading}
          data={kpis}
          columns={[
            { header: 'Email', render: (item) => item.employeeEmail || '-' },
            { header: 'Tasks', render: (item) => item.tasksCompleted || 0 },
            { header: 'Overdue', render: (item) => (
              <span style={{ color: (item.tasksOverdue || 0) > 0 ? 'var(--c-danger)' : 'inherit' }}>
                {item.tasksOverdue || 0}
              </span>
            )},
            { header: 'Avg Min', render: (item) => item.avgTaskMinutes?.toFixed(1) || 0 },
            { header: 'Present', render: (item) => item.attendancePresentDays || 0 }
          ]}
        />
      </div>
    </div>
  );
}
