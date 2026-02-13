import React, { useState, useEffect } from 'react';
import { transfersRepo } from '@/api/repositories/transfersRepo';
import { getLocationsOnce } from '@/api/lookups/locationsLookup';
import { getPartsOnce } from '@/api/lookups/partsLookup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUIStore, toast, confirm, closeModal, openModal } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { Select } from '@/components/forms/Select';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  ArrowRight,
  Truck,
  PackageCheck,
  ClipboardList
} from 'lucide-react';

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const loadTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transfersRepo.getTransfers(page, pageSize);
      if (res.success && res.data) {
        setTransfers(res.data.items || []);
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
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} this transfer?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      danger: action !== 'receive'
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
    const locationOptions = locations.map(l => ({ value: l.id, label: l.name }));
    const partOptions = parts.map(p => ({ value: p.id, label: p.name }));

    openModal(
      'Create Stock Transfer',
      <CreateTransferForm 
        locations={locationOptions} 
        parts={partOptions} 
        onSuccess={() => {
          closeModal();
          loadTransfers();
        }} 
        onCancel={closeModal} 
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Stock Transfers</h1>
        <Button onClick={openCreateModal}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create Transfer
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder="Search transfers..." 
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Transfer No</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>From</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>To</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Requested</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Shipped</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Received</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    {error}
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No transfers found
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{t.transferNo}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        background: 'var(--c-bg-alt)', 
                        border: '1px solid var(--c-border)',
                        color: t.status === 'Received' ? 'var(--c-success)' : t.status === 'Shipped' ? 'var(--c-primary)' : 'inherit'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>{t.fromLocation?.name}</td>
                    <td style={{ padding: '16px' }}>{t.toLocation?.name}</td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>
                      {t.requestedAt ? new Date(t.requestedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>
                      {t.shippedAt ? new Date(t.shippedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>
                      {t.receivedAt ? new Date(t.receivedAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {t.status === 'Draft' && (
                          <Button variant="secondary" size="sm" onClick={() => handleAction('request', t.id)} title="Request Transfer">
                            <ClipboardList size={16} />
                          </Button>
                        )}
                        {t.status === 'Requested' && (
                          <Button variant="secondary" size="sm" onClick={() => handleAction('ship', t.id)} title="Ship Transfer">
                            <Truck size={16} />
                          </Button>
                        )}
                        {t.status === 'Shipped' && (
                          <Button variant="primary" size="sm" onClick={() => handleAction('receive', t.id)} title="Receive Transfer">
                            <PackageCheck size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--c-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
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

  const handleSubmit = async () => {
    if (!formData.fromLocationId || !formData.toLocationId || formData.items.some(i => !i.partId)) {
      toast.error('Please fill required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transfersRepo.createTransfer(formData as any);
      if (res.success) {
        toast.success('Transfer created successfully');
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
    <ModalContent
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Transfer'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Select 
            label="From Location"
            options={locations}
            placeholder="Select Location"
            value={formData.fromLocationId}
            onChange={e => setFormData({ ...formData, fromLocationId: e.target.value })}
            required
          />
          <Select 
            label="To Location"
            options={locations}
            placeholder="Select Location"
            value={formData.toLocationId}
            onChange={e => setFormData({ ...formData, toLocationId: e.target.value })}
            required
          />
        </div>

        <Input 
          label="Notes"
          placeholder="Enter any notes..."
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Items *</label>
            <Button type="button" size="sm" variant="secondary" onClick={addItem}>
              <Plus size={14} style={{ marginRight: '4px' }} />
              Add Item
            </Button>
          </div>
          
          {formData.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Select 
                  options={parts}
                  placeholder="Select Part"
                  value={item.partId}
                  onChange={e => {
                    const newItems = [...formData.items];
                    newItems[idx].partId = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  required
                />
              </div>
              <div style={{ width: '100px' }}>
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
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => removeItem(idx)}
                  style={{ marginTop: '4px' }}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </ModalContent>
  );
}

