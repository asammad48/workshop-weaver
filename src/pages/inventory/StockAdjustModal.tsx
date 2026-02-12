import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { inventoryRepo } from '@/api/repositories/inventoryRepo';
import { getPartsOnce } from '@/api/lookups/partsLookup';
import { getLocationsOnce } from '@/api/lookups/locationsLookup';
import { ModalContent } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { closeModal, toast } from '@/state/uiStore';
import { StockAdjustRequest } from '@/api/generated/apiClient';

interface StockAdjustModalProps {
  partId?: string;
  locationId?: string;
  onSuccess: () => void;
}

export function StockAdjustModal({ partId: initialPartId, locationId: initialLocationId, onSuccess }: StockAdjustModalProps) {
  const [form, setForm] = useState<Partial<StockAdjustRequest>>({
    partId: initialPartId || '',
    locationId: initialLocationId || '',
    quantityDelta: 0,
    reason: ''
  });

  const { data: parts = [] } = useQuery({
    queryKey: ['lookups', 'parts'],
    queryFn: getPartsOnce
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['lookups', 'locations'],
    queryFn: getLocationsOnce
  });

  const mutation = useMutation({
    mutationFn: (data: StockAdjustRequest) => inventoryRepo.adjustStock(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to adjust stock');
    }
  });

  const handleSubmit = () => {
    if (!form.partId || !form.locationId || form.quantityDelta === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    mutation.mutate(new StockAdjustRequest(form as any));
  };

  return (
    <ModalContent
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Part</label>
          <select 
            value={form.partId} 
            onChange={e => setForm({ ...form, partId: e.target.value })}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid var(--c-border)',
              background: 'var(--c-bg)',
              color: 'var(--c-text)'
            }}
            disabled={!!initialPartId}
          >
            <option value="">Select Part...</option>
            {parts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Location</label>
          <select 
            value={form.locationId} 
            onChange={e => setForm({ ...form, locationId: e.target.value })}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid var(--c-border)',
              background: 'var(--c-bg)',
              color: 'var(--c-text)'
            }}
            disabled={!!initialLocationId}
          >
            <option value="">Select Location...</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <Input 
          label="Quantity Delta (Negative to decrease)" 
          type="number" 
          value={form.quantityDelta} 
          onChange={e => setForm({ ...form, quantityDelta: parseFloat(e.target.value) || 0 })}
          required 
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Notes</label>
          <textarea 
            value={form.reason || ''} 
            onChange={e => setForm({ ...form, reason: e.target.value })}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid var(--c-border)',
              background: 'var(--c-bg)',
              color: 'var(--c-text)',
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="Reason for adjustment..."
          />
        </div>
      </div>
    </ModalContent>
  );
}
