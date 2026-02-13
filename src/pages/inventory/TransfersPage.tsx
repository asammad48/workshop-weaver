import React, { useState, useEffect } from 'react';
import { transfersRepo } from '@/api/repositories/transfersRepo';
import { getLocationsOnce } from '@/api/lookups/locationsLookup';
import { getPartsOnce } from '@/api/lookups/partsLookup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUIStore } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { openModal, closeModal } = useUIStore();

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const res = await transfersRepo.getTransfers(page, 10);
      if (res.success && res.data) {
        setTransfers(res.data.items || []);
        // Safely access total pages or fallback to 1
        const total = (res.data as any).totalPages || 1;
        setTotalPages(total);
      } else {
        setError(res.message || 'Failed to load transfers');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [page]);

  const handleAction = async (action: 'request' | 'ship' | 'receive', id: string) => {
    const confirmed = await confirm({
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${action} this transfer?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        let res;
        if (action === 'request') res = await transfersRepo.requestTransfer(id);
        else if (action === 'ship') res = await transfersRepo.shipTransfer(id);
        else res = await transfersRepo.receiveTransfer(id);

        if (res.success) {
          toast.success(`Transfer ${action}ed successfully`);
          loadTransfers();
        } else {
          toast.error(res.message || `Failed to ${action} transfer`);
        }
      } catch (err: any) {
        toast.error(err.message || 'An error occurred');
      }
    }
  };

  const openCreateModal = async () => {
    const locations = await getLocationsOnce();
    const parts = await getPartsOnce();

    openModal({
      title: 'Create Stock Transfer',
      content: <CreateTransferForm locations={locations} parts={parts} onSuccess={() => {
        closeModal();
        loadTransfers();
      }} onCancel={closeModal} />
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Transfers</h1>
        <Button onClick={openCreateModal}>Create Transfer</Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : transfers.length === 0 ? (
          <div className="p-8 text-center">No transfers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3">Transfer No</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">From</th>
                  <th className="p-3">To</th>
                  <th className="p-3">Requested</th>
                  <th className="p-3">Shipped</th>
                  <th className="p-3">Received</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{t.transferNo}</td>
                    <td className="p-3">{t.status}</td>
                    <td className="p-3">{t.fromLocation?.name}</td>
                    <td className="p-3">{t.toLocation?.name}</td>
                    <td className="p-3">{t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : '-'}</td>
                    <td className="p-3">{t.shippedAt ? new Date(t.shippedAt).toLocaleDateString() : '-'}</td>
                    <td className="p-3">{t.receivedAt ? new Date(t.receivedAt).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-right space-x-2">
                      {t.status === 'Draft' && <Button size="sm" onClick={() => handleAction('request', t.id)}>Request</Button>}
                      {t.status === 'Requested' && <Button size="sm" onClick={() => handleAction('ship', t.id)}>Ship</Button>}
                      {t.status === 'Shipped' && <Button size="sm" onClick={() => handleAction('receive', t.id)}>Receive</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-3 flex justify-between items-center border-t">
              <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span>Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function CreateTransferForm({ locations, parts, onSuccess, onCancel }: any) {
  const [formData, setFormData] = useState({
    fromLocationId: '',
    toLocationId: '',
    notes: '',
    items: [{ partId: '', qty: 1 }]
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromLocationId || !formData.toLocationId || formData.items.some(i => !i.partId)) {
      toast.error('Please fill required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transfersRepo.createTransfer(formData as any);
      if (res.success) {
        toast.success('Transfer created');
        onSuccess();
      } else {
        toast.error(res.message || 'Creation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const addItem = () => setFormData(d => ({ ...d, items: [...d.items, { partId: '', qty: 1 }] }));
  const removeItem = (idx: number) => setFormData(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">From Location *</label>
          <select 
            className="w-full border rounded p-2"
            value={formData.fromLocationId}
            onChange={e => setFormData({ ...formData, fromLocationId: e.target.value })}
            required
          >
            <option value="">Select Location</option>
            {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">To Location *</label>
          <select 
            className="w-full border rounded p-2"
            value={formData.toLocationId}
            onChange={e => setFormData({ ...formData, toLocationId: e.target.value })}
            required
          >
            <option value="">Select Location</option>
            {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Notes</label>
        <textarea 
          className="w-full border rounded p-2"
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Items *</label>
          <Button type="button" size="sm" variant="secondary" onClick={addItem}>Add Item</Button>
        </div>
        {formData.items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <select 
                className="w-full border rounded p-2"
                value={item.partId}
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[idx].partId = e.target.value;
                  setFormData({ ...formData, items: newItems });
                }}
                required
              >
                <option value="">Select Part</option>
                {parts.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="w-24 space-y-1">
              <Input 
                type="number" 
                min="1" 
                value={item.qty} 
                onChange={e => {
                  const newItems = [...formData.items];
                  newItems[idx].qty = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, items: newItems });
                }}
                required
              />
            </div>
            {formData.items.length > 1 && (
              <Button type="button" variant="secondary" onClick={() => removeItem(idx)}>×</Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Transfer'}
        </Button>
      </div>
    </form>
  );
}
