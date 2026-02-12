import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersRepo } from '@/api/repositories/purchaseOrdersRepo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Plus, Eye, Send, PackageCheck, Trash2, X } from 'lucide-react';
import { openModal, closeModal, toast, confirm } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { useAuthStore } from '@/state/authStore';
import { format } from 'date-fns';
import { getSuppliersOnce } from '@/api/lookups/suppliersLookup';
import { getPartsOnce } from '@/api/lookups/partsLookup';
import { getLocationsOnce } from '@/api/lookups/locationsLookup';
import { 
  PurchaseOrderCreateRequest, 
  PurchaseOrderItemCreate, 
  PurchaseOrderReceiveRequest,
  ReceiveItem
} from '@/api/generated/apiClient';

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canManage = user?.role === 'STORE' || user?.role === 'HQ_ADMIN';

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase-orders', page, search],
    queryFn: () => purchaseOrdersRepo.getPurchaseOrders(page, 10, search)
  });

  const handleCreate = () => {
    openModal('Create Purchase Order', <CreatePOModal onSuccess={() => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    }} />);
  };

  const handleView = (id: string) => {
    openModal('Purchase Order Details', <PODetails id={id} />);
  };

  const handleSubmit = async (id: string) => {
    const ok = await confirm({
      title: 'Submit Purchase Order',
      message: 'Are you sure you want to submit this order? This will notify the supplier.',
      confirmText: 'Submit',
      danger: false
    });
    if (!ok) return;

    try {
      await purchaseOrdersRepo.submitPurchaseOrder(id);
      toast.success('Purchase order submitted');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit order');
    }
  };

  const handleReceive = (id: string) => {
    openModal('Receive Purchase Order', <ReceivePOModal id={id} onSuccess={() => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    }} />);
  };

  if (isLoading) return <div style={{ padding: '48px', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} /></div>;
  if (error) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>Error loading purchase orders</div>;

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Purchase Orders</h1>
        {canManage && (
          <Button onClick={handleCreate}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Create PO
          </Button>
        )}
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px' }}>
          <Input 
            placeholder="Search orders..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Order No</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Supplier</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Created At</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Submitted</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Received</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>No purchase orders found</td></tr>
              ) : (
                items.map((po: any) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{po.orderNo}</td>
                    <td style={{ padding: '16px' }}>{po.supplierName}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        background: 'var(--c-bg-alt)',
                        color: 'var(--c-text)',
                        border: '1px solid var(--c-border)' 
                      }}>
                        {po.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>{po.createdAt ? format(new Date(po.createdAt), 'yyyy-MM-dd') : '—'}</td>
                    <td style={{ padding: '16px' }}>{po.submittedAt ? format(new Date(po.submittedAt), 'yyyy-MM-dd') : '—'}</td>
                    <td style={{ padding: '16px' }}>{po.receivedAt ? format(new Date(po.receivedAt), 'yyyy-MM-dd') : '—'}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleView(po.id)}>
                          <Eye size={14} />
                        </Button>
                        {canManage && po.status === 'Draft' && (
                          <Button variant="secondary" size="sm" onClick={() => handleSubmit(po.id)}>
                            <Send size={14} />
                          </Button>
                        )}
                        {canManage && po.status === 'Submitted' && (
                          <Button variant="secondary" size="sm" onClick={() => handleReceive(po.id)}>
                            <PackageCheck size={14} />
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
          <span style={{ fontSize: '14px', color: 'var(--c-muted)' }}>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CreatePOModal({ onSuccess }: { onSuccess: () => void }) {
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<any[]>([{ partId: '', qty: 1, unitCost: 0 }]);

  const { data: suppliers = [] } = useQuery({ queryKey: ['lookups', 'suppliers'], queryFn: getSuppliersOnce });
  const { data: parts = [] } = useQuery({ queryKey: ['lookups', 'parts'], queryFn: getPartsOnce });

  const mutation = useMutation({
    mutationFn: (data: PurchaseOrderCreateRequest) => purchaseOrdersRepo.createPurchaseOrder(data),
    onSuccess: () => {
      toast.success('Purchase order created');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create order')
  });

  const addItem = () => setItems([...items, { partId: '', qty: 1, unitCost: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!supplierId || items.some(i => !i.partId || i.qty <= 0)) {
      toast.error('Please fill in all required fields');
      return;
    }
    mutation.mutate(new PurchaseOrderCreateRequest({
      supplierId,
      notes,
      items: items.map(i => new PurchaseOrderItemCreate(i))
    }));
  };

  return (
    <ModalContent footer={
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>Create Order</Button>
      </div>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Supplier *</label>
          <select value={supplierId} onChange={e => setSupplierId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
            <option value="">Select Supplier...</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Line Items *</label>
            <Button variant="secondary" size="sm" onClick={addItem}><Plus size={14} /> Add Item</Button>
          </div>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <select value={item.partId} onChange={e => updateItem(idx, 'partId', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
                  <option value="">Select Part...</option>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ width: '80px' }}>
                <Input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value))} />
              </div>
              <div style={{ width: '100px' }}>
                <Input type="number" placeholder="Cost" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', parseFloat(e.target.value))} />
              </div>
              {items.length > 1 && (
                <Button variant="secondary" size="sm" onClick={() => removeItem(idx)} style={{ color: 'var(--c-danger)' }}><Trash2 size={14} /></Button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)', minHeight: '60px' }} />
        </div>
      </div>
    </ModalContent>
  );
}

function ReceivePOModal({ id, onSuccess }: { id: string, onSuccess: () => void }) {
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: locations = [] } = useQuery({ queryKey: ['lookups', 'locations'], queryFn: getLocationsOnce });
  const { data: po } = useQuery({ queryKey: ['purchase-orders', id], queryFn: () => purchaseOrdersRepo.getPurchaseOrder(id) });

  const mutation = useMutation({
    mutationFn: (data: PurchaseOrderReceiveRequest) => purchaseOrdersRepo.receivePurchaseOrder(id, data),
    onSuccess: () => {
      toast.success('Purchase order received');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to receive order')
  });

  const handleSubmit = () => {
    if (!locationId) {
      toast.error('Please select a receiving location');
      return;
    }
    // API typically handles receiving all items if items array is null/empty or we can map them
    mutation.mutate(new PurchaseOrderReceiveRequest({
      locationId,
      items: (po?.data as any)?.items?.map((i: any) => new ReceiveItem({
        partId: i.partId,
        receiveQty: i.qty,
        unitCost: i.unitCost
      }))
    }));
  };

  return (
    <ModalContent footer={
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={closeModal}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={mutation.isPending}>Receive All Items</Button>
      </div>
    }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>Receiving Location *</label>
          <select value={locationId} onChange={e => setLocationId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
            <option value="">Select Location...</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div style={{ padding: '12px', background: 'var(--c-bg-alt)', borderRadius: '8px', fontSize: '14px' }}>
          <strong>Order:</strong> {po?.data?.orderNo}<br/>
          <strong>Supplier:</strong> {(po?.data as any)?.supplierName}<br/>
          <strong>Items:</strong> {(po?.data as any)?.items?.length || 0}
        </div>
      </div>
    </ModalContent>
  );
}

function PODetails({ id }: { id: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['purchase-orders', id], queryFn: () => purchaseOrdersRepo.getPurchaseOrder(id) });

  if (isLoading) return <div style={{ padding: '24px', textAlign: 'center' }}><Loader2 size={18} className="animate-spin" /></div>;
  const po = data?.data as any;
  if (!po) return <div style={{ padding: '24px', textAlign: 'center' }}>Order not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
        <div>
          <span style={{ color: 'var(--c-muted)' }}>Order No:</span><br/>
          <strong>{po.orderNo}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--c-muted)' }}>Status:</span><br/>
          <strong>{po.status}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--c-muted)' }}>Supplier:</span><br/>
          <strong>{po.supplierName}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--c-muted)' }}>Created:</span><br/>
          <strong>{po.orderedAt ? format(new Date(po.orderedAt), 'yyyy-MM-dd HH:mm') : '—'}</strong>
        </div>
      </div>
      
      <div style={{ border: '1px solid var(--c-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ background: 'var(--c-bg-alt)' }}>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Part</th>
              <th style={{ padding: '8px 12px' }}>Qty</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Cost</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(po.items as any[])?.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--c-border)' }}>
                <td style={{ padding: '8px 12px' }}>{item.partName}</td>
                <td style={{ padding: '8px 12px' }}>{item.qty}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>${item.unitCost?.toFixed(2)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>${(item.qty * item.unitCost)?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {po.notes && (
        <div style={{ fontSize: '14px' }}>
          <span style={{ color: 'var(--c-muted)' }}>Notes:</span><br/>
          <p style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>{po.notes}</p>
        </div>
      )}
    </div>
  );
}
