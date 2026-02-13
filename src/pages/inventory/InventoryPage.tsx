import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { inventoryRepo } from '@/api/repositories/inventoryRepo';
import { useUIStore, toast, openModal, closeModal } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Plus,
  Settings2
} from 'lucide-react';
import { StockTab } from './StockTab';
import { LedgerTab } from './LedgerTab';
import { StockAdjustModal } from './StockAdjustModal';

type Tab = 'suppliers' | 'parts' | 'locations' | 'stock' | 'ledger';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('suppliers');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const renderContent = () => {
    switch (activeTab) {
      case 'suppliers': return <SuppliersTable search={search} page={page} setPage={setPage} />;
      case 'parts': return <PartsTable search={search} page={page} setPage={setPage} />;
      case 'locations': return <LocationsTable search={search} page={page} setPage={setPage} />;
      case 'stock': return <StockTab search={search} page={page} setPage={setPage} />;
      case 'ledger': return <LedgerTab search={search} page={page} setPage={setPage} />;
    }
  };

  const handleCreate = () => {
    if (activeTab === 'stock') {
      openModal('Adjust Stock', <StockAdjustModal onSuccess={() => { closeModal(); queryClient.invalidateQueries({ queryKey: ['stock'] }); }} />);
      return;
    }

    const props = {
      suppliers: { title: 'Create Supplier', content: <SupplierForm onSuccess={() => { closeModal(); queryClient.invalidateQueries({ queryKey: ['suppliers'] }); }} /> },
      parts: { title: 'Create Part', content: <PartForm onSuccess={() => { closeModal(); queryClient.invalidateQueries({ queryKey: ['parts'] }); }} /> },
      locations: { title: 'Create Location', content: <LocationForm onSuccess={() => { closeModal(); queryClient.invalidateQueries({ queryKey: ['locations'] }); }} /> },
      stock: { title: 'Adjust Stock', content: null },
      ledger: { title: 'Ledger', content: null }
    }[activeTab];
    
    if (props && props.content) {
      openModal(props.title, props.content);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Inventory Management</h1>
        {activeTab !== 'ledger' && (
          <Button onClick={handleCreate}>
            {activeTab === 'stock' ? <Settings2 size={18} style={{ marginRight: '8px' }} /> : <Plus size={18} style={{ marginRight: '8px' }} />}
            {activeTab === 'stock' ? 'Adjust Stock' : 'Create New'}
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--c-border)', marginBottom: '24px', overflowX: 'auto' }}>
        {(['suppliers', 'parts', 'locations', 'stock', 'ledger'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            style={{ 
              padding: '12px 4px', 
              fontSize: '14px', 
              whiteSpace: 'nowrap',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--c-primary)' : 'var(--c-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--c-primary)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder={`Search ${activeTab}...`} 
              style={{ paddingLeft: '40px' }}
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          {renderContent()}
        </div>
      </Card>
    </div>
  );
}

function SuppliersTable({ search, page, setPage }: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => inventoryRepo.getSuppliers(page, 10, search)
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Error loading suppliers" />;

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Name</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Phone</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Email</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Address</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState message="No suppliers found" />
          ) : (
            items.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                <td style={{ padding: '16px' }}>{s.name}</td>
                <td style={{ padding: '16px' }}>{s.phone || '—'}</td>
                <td style={{ padding: '16px' }}>{s.email || '—'}</td>
                <td style={{ padding: '16px' }}>{s.address || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </>
  );
}

function PartsTable({ search, page, setPage }: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['parts', page, search],
    queryFn: () => inventoryRepo.getParts(page, 10, search)
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Error loading parts" />;

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>SKU</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Name</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Brand</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Unit</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState message="No parts found" />
          ) : (
            items.map((p: any) => (
              <tr 
                key={p.id} 
                style={{ borderBottom: '1px solid var(--c-border)', cursor: 'pointer' }}
                onClick={() => openModal('Part Details', <PartDetails id={p.id} />)}
                className="hover:bg-muted/50"
              >
                <td style={{ padding: '16px' }}>{p.sku}</td>
                <td style={{ padding: '16px' }}>{p.name}</td>
                <td style={{ padding: '16px' }}>{p.brand || '—'}</td>
                <td style={{ padding: '16px' }}>{p.unit || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </>
  );
}

function LocationsTable({ search, page, setPage }: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations', page, search],
    queryFn: () => inventoryRepo.getLocations(page, 10, search)
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Error loading locations" />;

  const items = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Code</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Name</th>
            <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <EmptyState message="No locations found" />
          ) : (
            items.map((l: any) => (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                <td style={{ padding: '16px' }}>{l.code}</td>
                <td style={{ padding: '16px' }}>{l.name}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    background: l.isActive ? 'var(--c-bg-alt)' : 'rgba(var(--c-danger-rgb), 0.1)', 
                    color: l.isActive ? 'var(--c-success)' : 'var(--c-danger)',
                    border: '1px solid var(--c-border)' 
                  }}>
                    {l.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} totalPages={totalPages} />
    </>
  );
}

function Pagination({ page, setPage, totalPages }: any) {
  return (
    <div style={{ padding: '16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: 'var(--c-muted)' }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p: any) => p - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p: any) => p + 1)}>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
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

function SupplierForm({ onSuccess }: any) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const mutation = useMutation({
    mutationFn: (data: any) => inventoryRepo.createSupplier(data),
    onSuccess: () => {
      toast.success('Supplier created successfully');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create supplier')
  });

  return (
    <ModalContent 
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={!form.name || mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
      </div>
    </ModalContent>
  );
}

function PartForm({ onSuccess }: any) {
  const [form, setForm] = useState({ sku: '', name: '', brand: '', unit: '' });
  const mutation = useMutation({
    mutationFn: (data: any) => inventoryRepo.createPart(data),
    onSuccess: () => {
      toast.success('Part created successfully');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create part')
  });

  return (
    <ModalContent 
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={!form.sku || !form.name || mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
        <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Input label="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <Input label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
      </div>
    </ModalContent>
  );
}

function LocationForm({ onSuccess }: any) {
  const [form, setForm] = useState({ code: '', name: '', isActive: true });
  const mutation = useMutation({
    mutationFn: (data: any) => inventoryRepo.createLocation(data),
    onSuccess: () => {
      toast.success('Location created successfully');
      onSuccess();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create location')
  });

  return (
    <ModalContent 
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={!form.code || !form.name || mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
        <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="isActive"
            checked={form.isActive} 
            onChange={e => setForm({ ...form, isActive: e.target.checked })} 
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="isActive" style={{ fontSize: '14px', cursor: 'pointer' }}>Is Active</label>
        </div>
      </div>
    </ModalContent>
  );
}

function PartDetails({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['parts', id],
    queryFn: () => inventoryRepo.getPart(id)
  });

  if (isLoading) return <LoadingState />;
  const p = data?.data as any;
  if (!p) return <div style={{ padding: '24px', textAlign: 'center' }}>Part not found</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
        <span style={{ color: 'var(--c-muted)' }}>SKU:</span>
        <span style={{ fontWeight: 500 }}>{p.sku}</span>
        <span style={{ color: 'var(--c-muted)' }}>Name:</span>
        <span style={{ fontWeight: 500 }}>{p.name}</span>
        <span style={{ color: 'var(--c-muted)' }}>Brand:</span>
        <span style={{ fontWeight: 500 }}>{p.brand || '—'}</span>
        <span style={{ color: 'var(--c-muted)' }}>Unit:</span>
        <span style={{ fontWeight: 500 }}>{p.unit || '—'}</span>
      </div>
    </div>
  );
}
