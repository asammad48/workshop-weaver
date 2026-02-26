import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardOverviewResponse, InventoryDashboardResponse } from '@/api/generated/apiClient';
import { dashboardRepo } from '@/api/repositories/dashboardRepo';
import { KpiCard } from './components/KpiCard';
import { ChartCard } from './components/ChartCard';
import { AlertTable } from './components/AlertTable';

interface DashboardProps {
  data: DashboardOverviewResponse;
  loading: boolean;
}

export function StoreDashboard({ data, loading }: DashboardProps) {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryDashboardResponse | null>(null);
  const [extraLoading, setExtraLoading] = useState(true);

  useEffect(() => {
    const fetchExtra = async () => {
      setExtraLoading(true);
      try {
        const res = await dashboardRepo.inventory({ branchId: data.branchId });
        setInventory(res);
      } catch (err) {
        console.error('Failed to fetch inventory dashboard data', err);
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
            title="Inventory Movements"
            type="bar"
            series={data.series.filter(s =>
              ['stock_adjustments_count', 'po_received_count'].includes(s.key || '')
            )}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Low Stock Table */}
        <AlertTable
          title="Low Stock Items"
          loading={extraLoading || loading}
          data={inventory?.lowStockTop || []}
          onRowClick={(item) => navigate(`/inventory/parts/${item.partId}`)}
          columns={[
            { header: 'SKU', render: (item) => item.partSku || '-' },
            { header: 'Name', render: (item) => item.partName || '-' },
            { header: 'Location', render: (item) => item.locationName || '-' },
            { header: 'In Hand', render: (item) => item.quantityOnHand || 0 },
            { header: 'Reorder', render: (item) => item.reorderLevel || 0 }
          ]}
        />

        {/* Pending PO Table */}
        <AlertTable
          title="Pending Purchase Orders"
          loading={extraLoading || loading}
          data={inventory?.pendingPoTop || []}
          onRowClick={(item) => navigate(`/inventory/purchase-orders/${item.purchaseOrderId}`)}
          columns={[
            { header: 'Order No', render: (item) => item.orderNo || '-' },
            { header: 'Supplier', render: (item) => item.supplierName || '-' },
            { header: 'Days', render: (item) => item.daysPending || 0 },
            { header: 'Status', render: (item) => item.status || '-' }
          ]}
        />
      </div>

      <div>
        {/* Pending Transfers Table */}
        <AlertTable
          title="Pending Transfers"
          loading={extraLoading || loading}
          data={inventory?.pendingTransfersTop || []}
          onRowClick={(item) => navigate(`/inventory/transfers/${item.transferId}`)}
          columns={[
            { header: 'Transfer No', render: (item) => item.transferNo || '-' },
            { header: 'From', render: (item) => item.fromBranch || '-' },
            { header: 'To', render: (item) => item.toBranch || '-' },
            { header: 'Days', render: (item) => item.daysPending || 0 },
            { header: 'Status', render: (item) => item.status || '-' }
          ]}
        />
      </div>
    </div>
  );
}
