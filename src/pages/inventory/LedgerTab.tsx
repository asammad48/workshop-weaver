import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryRepo } from '@/api/repositories/inventoryRepo';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

interface LedgerTabProps {
  search: string;
  page: number;
  setPage: (page: number) => void;
}

export function LedgerTab({ search, page, setPage }: LedgerTabProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ledger', page, search],
    queryFn: () => inventoryRepo.getLedger(page, 10, search)
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Error loading ledger" />;

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Performed At</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Type</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Part</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Location</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Qty Delta</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Unit Cost</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState message="No movements found" />
          ) : (
            items.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                <td style={{ padding: '16px' }}>{item.performedAt ? format(new Date(item.performedAt), 'yyyy-MM-dd HH:mm') : '—'}</td>
                <td style={{ padding: '16px' }}>
                   <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    background: 'var(--c-bg-alt)',
                    color: 'var(--c-text)',
                    border: '1px solid var(--c-border)' 
                  }}>
                    {item.movementType}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>{item.partName || item.partId}</td>
                <td style={{ padding: '16px' }}>{item.locationName || item.locationId}</td>
                <td style={{ padding: '16px', color: item.qtyDelta < 0 ? 'var(--c-danger)' : 'var(--c-success)', fontWeight: 500 }}>
                  {item.qtyDelta > 0 ? '+' : ''}{item.qtyDelta}
                </td>
                <td style={{ padding: '16px' }}>{item.unitCost ? `$${item.unitCost.toFixed(2)}` : '—'}</td>
                <td style={{ padding: '16px', fontSize: '13px', color: 'var(--c-muted)' }}>{item.notes || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: '48px', textAlign: 'center' }}>
      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
      {message}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
        {message}
      </td>
    </tr>
  );
}

function Pagination({ page, setPage, totalPages }: any) {
  return (
    <div style={{ padding: '16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: 'var(--c-muted)' }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
