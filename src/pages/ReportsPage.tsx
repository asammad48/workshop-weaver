import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  BarChart3, 
  Calendar, 
  Search, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { stationsRepo } from '@/api/repositories/stationsRepo';
import { roadblockersRepo } from '@/api/repositories/roadblockersRepo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const { data: agingData, isLoading: agingLoading } = useQuery({
    queryKey: ['roadblockersAging', fromDate, toDate],
    queryFn: () => roadblockersRepo.getAging(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined
    ),
  });

  const { data: stuckData, isLoading: stuckLoading } = useQuery({
    queryKey: ['stuckVehicles'],
    queryFn: () => roadblockersRepo.getStuckVehicles(),
  });

  const reports = stationTimeData?.data || [];
  const agingItems = agingData?.data || [];
  const stuckItems = stuckData?.data || [];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        Reports
      </h1>

      <div style={{ marginBottom: '24px' }}>
        <Card>
          <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button onClick={() => refetch()} style={{ marginBottom: '4px' }}>
              <Search size={18} style={{ marginRight: '8px' }} />
              Generate Report
            </Button>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Card>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--c-text)' }}>
              Station Time Report
            </h2>
            <div style={{ color: 'var(--c-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {fromDate} to {toDate}
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                  <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Station Code</th>
                  <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Total Minutes</th>
                  <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Jobs Count</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '48px', textAlign: 'center' }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                      <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
                      <p>Error loading report: {(error as any)?.message || 'Unknown error'}</p>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                      <FileText size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                      <p>No data found for the selected period</p>
                    </td>
                  </tr>
                ) : (
                  reports.map((report: any, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--c-border)' }}>
                      <td style={{ padding: '16px', color: 'var(--c-text)', fontWeight: 500 }}>
                        {report.stationCode || report.stationName || '-'}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--c-text)' }}>
                        {report.totalMinutes || 0}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--c-text)' }}>
                        {report.jobsCount || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
          <Card>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--c-border)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--c-text)' }}>Roadblocker Aging</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>Type</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>Description</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>Days Open</th>
                  </tr>
                </thead>
                <tbody>
                  {agingLoading ? (
                    <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center' }}>Loading...</td></tr>
                  ) : agingItems.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--c-muted)' }}>No aging roadblockers</td></tr>
                  ) : (
                    agingItems.map((item: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--c-border)' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.type}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.description}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: item.daysOpen > 3 ? 'var(--c-danger)' : 'inherit' }}>{item.daysOpen}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--c-border)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--c-text)' }}>Stuck Vehicles</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>Plate</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>Station</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {stuckLoading ? (
                    <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center' }}>Loading...</td></tr>
                  ) : stuckItems.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--c-muted)' }}>No stuck vehicles</td></tr>
                  ) : (
                    stuckItems.map((item: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--c-border)' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{item.plate}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.currentStation}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: item.daysInShop > 5 ? 'var(--c-danger)' : 'inherit' }}>{item.daysInShop}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
