import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryRepo } from '@/api/repositories/inventoryRepo';
import { Button } from '@/components/ui/Button';
import { Loader2, Settings2 } from 'lucide-react';
import { openModal, closeModal, toast } from '@/state/uiStore';
import { useAuthStore } from '@/state/authStore';
import { StockAdjustModal } from './StockAdjustModal';

interface StockTabProps {
  search: string;
  page: number;
  setPage: (page: number) => void;
}

export function StockTab({ search, page, setPage }: StockTabProps) {
  const { user } = useAuthStore();
  const canAdjust = user?.role === 'STORE' || user?.role === 'HQ_ADMIN';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', page, search],
    queryFn: () => inventoryRepo.getStock(page, 10, search)
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Error loading stock" />;

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  const handleAdjust = (item: any) => {
    openModal(
      'Adjust Stock',
      <StockAdjustModal 
        partId={item.partId} 
        locationId={item.locationId}
        onSuccess={() => {
          closeModal();
          refetch();
          toast.success('Stock adjusted successfully');
        }}
      />
    );
  };

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Part</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Location</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Qty On Hand</th>
            {canAdjust && <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState message="No stock found" />
          ) : (
            items.map((item: any, idx: number) => (
              <tr key={`${item.partId}-${item.locationId}-${idx}`} style={{ borderBottom: '1px solid var(--c-border)' }}>
                <td style={{ padding: '16px' }}>{item.partName || item.partId}</td>
                <td style={{ padding: '16px' }}>{item.locationName || item.locationId}</td>
                <td style={{ padding: '16px' }}>{item.qtyOnHand}</td>
                {canAdjust && (
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Button variant="secondary" size="sm" onClick={() => handleAdjust(item)}>
                      <Settings2 size={14} style={{ marginRight: '4px' }} />
                      Adjust
                    </Button>
                  </td>
                )}
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
