import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  BarChart3, 
  Calendar, 
  Search, 
  Loader2, 
  AlertCircle,
  FileText,
  DollarSign,
  Users,
  Car,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { stationsRepo } from '@/api/repositories/stationsRepo';
import { roadblockersRepo } from '@/api/repositories/roadblockersRepo';
import { reportsRepo } from '@/api/repositories/reportsRepo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/i18n';

const STORAGE_KEY_FROM = 'reports.from';
const STORAGE_KEY_TO = 'reports.to';

export default function ReportsPage() {
  const { t } = useI18n();
  const [fromDate, setFromDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_FROM) || 
      new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_TO) || 
      new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FROM, fromDate);
  }, [fromDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TO, toDate);
  }, [toDate]);

  const { data: summaryData, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useQuery({
    queryKey: ['reportSummary', fromDate, toDate],
    queryFn: () => reportsRepo.summary(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined
    ),
  });

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

  const summary = summaryData?.data;
  const [agingPage, setAgingPage] = useState(1);
  const [stuckPage, setStuckPage] = useState(1);
  const pageSize = 10;

  const agingItems = (agingData as any)?.data || [];
  const stuckItems = (stuckData as any)?.data || [];

  const totalAgingPages = Math.ceil(agingItems.length / pageSize) || 1;
  const paginatedAging = agingItems.slice((agingPage - 1) * pageSize, agingPage * pageSize);

  const totalStuckPages = Math.ceil(stuckItems.length / pageSize) || 1;
  const paginatedStuck = stuckItems.slice((stuckPage - 1) * pageSize, stuckPage * pageSize);

  const SummaryCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          padding: '12px', 
          borderRadius: '12px', 
          backgroundColor: `${color}10`, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-muted)' }}>{title}</p>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--c-text)' }}>
            {value !== undefined ? value : '0'}
          </h3>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: 'var(--c-text)' }}>
        {t('pages.reports.title')}
      </h1>

      <div style={{ marginBottom: '24px' }}>
        <Card>
          <div style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Input
                label={t('table.fromDate')}
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Input
                label={t('table.toDate')}
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button onClick={() => refetchSummary()} style={{ marginBottom: '4px' }}>
              <Search size={18} style={{ marginRight: '8px' }} />
              {t('pages.reports.generate')}
            </Button>
          </div>
        </Card>
      </div>

      {summaryLoading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
        </div>
      ) : summaryError ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--c-danger)' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 8px' }} />
          <p>Error loading summary report</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <SummaryCard 
            title={t('pages.reports.cards.totalRevenue')} 
            value={summary?.totalRevenue !== undefined ? `$${summary.totalRevenue.toLocaleString()}` : undefined} 
            icon={DollarSign} 
            color="#10b981" 
          />
          <SummaryCard 
            title={t('pages.reports.cards.totalExpenses')} 
            value={summary?.totalExpenses !== undefined ? `$${summary.totalExpenses.toLocaleString()}` : undefined} 
            icon={DollarSign} 
            color="#ef4444" 
          />
          <SummaryCard 
            title={t('pages.reports.cards.totalWages')} 
            value={summary?.totalWages !== undefined ? `$${summary.totalWages.toLocaleString()}` : undefined} 
            icon={Users} 
            color="#3b82f6" 
          />
          <SummaryCard 
            title={t('pages.reports.cards.carsInShop')} 
            value={summary?.vehiclesInShop} 
            icon={Car} 
            color="#f59e0b" 
          />
          {summary?.avgDaysInShop !== undefined && (
            <SummaryCard 
              title={t('pages.reports.cards.avgDaysInShop')}
              value={summary.avgDaysInShop} 
              icon={Clock} 
              color="#8b5cf6" 
            />
          )}
          {summary?.communicationsCount !== undefined && (
            <SummaryCard 
              title={t('pages.reports.cards.commsSent')}
              value={summary.communicationsCount} 
              icon={FileText} 
              color="#ec4899" 
            />
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
          <Card>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--c-border)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--c-text)' }}>{t('pages.reports.roadblockerAging')}</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.type')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.description')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.createdAt')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.daysOpen')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.jobCard')}</th>
                  </tr>
                </thead>
                <tbody>
                  {agingLoading ? (
                    <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}><Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--c-primary)' }} /></td></tr>
                  ) : agingItems.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--c-muted)' }}>No aging roadblockers</td></tr>
                  ) : (
                    paginatedAging.map((item: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--c-border)' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.type}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.description}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--c-muted)' }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: item.daysOpen > 3 ? 'var(--c-danger)' : 'inherit' }}>{item.daysOpen}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.jobCardId?.slice(-8) || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-muted)' }}>{t('table.page')} {agingPage} {t('table.of')} {totalAgingPages}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button variant="secondary" size="sm" disabled={agingPage <= 1} onClick={() => setAgingPage(p => p - 1)}><ChevronLeft size={14} /></Button>
                <Button variant="secondary" size="sm" disabled={agingPage >= totalAgingPages} onClick={() => setAgingPage(p => p + 1)}><ChevronRight size={14} /></Button>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--c-border)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--c-text)' }}>{t('pages.reports.stuckVehicles')}</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.plate')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.customer')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.status')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.entryAt')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.station')}</th>
                    <th style={{ padding: '12px 16px', color: 'var(--c-muted)', fontSize: '12px' }}>{t('table.days')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stuckLoading ? (
                    <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}><Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--c-primary)' }} /></td></tr>
                  ) : stuckItems.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--c-muted)' }}>No stuck vehicles</td></tr>
                  ) : (
                    paginatedStuck.map((item: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--c-border)' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{item.plate}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.customerName || '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '10px', background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--c-muted)' }}>{item.entryAt ? new Date(item.entryAt).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>{item.currentStation}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: item.daysInShop > 5 ? 'var(--c-danger)' : 'inherit' }}>{item.daysInShop}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-muted)' }}>{t('table.page')} {stuckPage} {t('table.of')} {totalStuckPages}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button variant="secondary" size="sm" disabled={stuckPage <= 1} onClick={() => setStuckPage(p => p - 1)}><ChevronLeft size={14} /></Button>
                <Button variant="secondary" size="sm" disabled={stuckPage >= totalStuckPages} onClick={() => setStuckPage(p => p + 1)}><ChevronRight size={14} /></Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
