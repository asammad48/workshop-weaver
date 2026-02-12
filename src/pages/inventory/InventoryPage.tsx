import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { inventoryRepo } from '@/api/repositories/inventoryRepo';
import { useUIStore } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Tab = 'suppliers' | 'parts' | 'locations';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('suppliers');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const showModal = useUIStore((s) => s.showModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const renderContent = () => {
    switch (activeTab) {
      case 'suppliers': return <SuppliersTable search={search} page={page} setPage={setPage} />;
      case 'parts': return <PartsTable search={search} page={page} setPage={setPage} />;
      case 'locations': return <LocationsTable search={search} page={page} setPage={setPage} />;
    }
  };

  const handleCreate = () => {
    const props = {
      suppliers: { title: 'Create Supplier', content: <SupplierForm onSuccess={() => { closeModal(); queryClient.invalidateQueries({ queryKey: ['suppliers'] }); }} /> },
      parts: { title: 'Create Part', content: <PartForm onSuccess={() => { closeModal(); queryClient.invalidateQueries({ queryKey: ['parts'] }); }} /> },
      locations: { title: 'Create Location', content: <LocationForm onSuccess={() => { closeModal(); queryClient.invalidateQueries({ queryKey: ['locations'] }); }} /> },
    }[activeTab];
    showModal(props.title, props.content);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Master Data</h1>
        <Button onClick={handleCreate}>Create New</Button>
      </div>

      <div className="flex space-x-4 border-b">
        {(['suppliers', 'parts', 'locations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-primary font-bold' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Input 
            placeholder={`Search ${activeTab}...`} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </CardHeader>
        <CardBody>
          {renderContent()}
        </CardBody>
      </Card>
    </div>
  );
}

function SuppliersTable({ search, page, setPage }: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => inventoryRepo.getSuppliers(page, 10, search)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  const items = data?.data?.items || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Email</th>
            <th className="p-2">Address</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s: any) => (
            <tr key={s.id} className="border-b hover:bg-muted/50">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.phone}</td>
              <td className="p-2">{s.email}</td>
              <td className="p-2">{s.address}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="p-4 text-center">No suppliers found</td></tr>}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} hasNext={data?.data?.hasNextPage} />
    </div>
  );
}

function PartsTable({ search, page, setPage }: any) {
  const showModal = useUIStore((s) => s.showModal);
  const { data, isLoading, error } = useQuery({
    queryKey: ['parts', page, search],
    queryFn: () => inventoryRepo.getParts(page, 10, search)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  const items = data?.data?.items || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">SKU</th>
            <th className="p-2">Name</th>
            <th className="p-2">Brand</th>
            <th className="p-2">Unit</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p: any) => (
            <tr 
              key={p.id} 
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => showModal('Part Details', <PartDetails id={p.id} />)}
            >
              <td className="p-2">{p.sku}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.brand}</td>
              <td className="p-2">{p.unit}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="p-4 text-center">No parts found</td></tr>}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} hasNext={data?.data?.hasNextPage} />
    </div>
  );
}

function LocationsTable({ search, page, setPage }: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations', page, search],
    queryFn: () => inventoryRepo.getLocations(page, 10, search)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  const items = data?.data?.items || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Code</th>
            <th className="p-2">Name</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l: any) => (
            <tr key={l.id} className="border-b hover:bg-muted/50">
              <td className="p-2">{l.code}</td>
              <td className="p-2">{l.name}</td>
              <td className="p-2">{l.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={3} className="p-4 text-center">No locations found</td></tr>}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} hasNext={data?.data?.hasNextPage} />
    </div>
  );
}

function Pagination({ page, setPage, hasNext }: any) {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      <Button size="sm" variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
      <span className="py-1 px-3 border rounded text-sm">{page}</span>
      <Button size="sm" variant="secondary" onClick={() => setPage(p => p + 1)} disabled={!hasNext}>Next</Button>
    </div>
  );
}

function SupplierForm({ onSuccess }: any) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const mutation = useMutation({
    mutationFn: inventoryRepo.createSupplier,
    onSuccess
  });

  return (
    <ModalContent footer={<Button onClick={() => mutation.mutate(form)} disabled={!form.name}>Save</Button>}>
      <div className="space-y-4">
        <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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
    mutationFn: inventoryRepo.createPart,
    onSuccess
  });

  return (
    <ModalContent footer={<Button onClick={() => mutation.mutate(form)} disabled={!form.sku || !form.name}>Save</Button>}>
      <div className="space-y-4">
        <Input label="SKU *" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
        <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Input label="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <Input label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
      </div>
    </ModalContent>
  );
}

function LocationForm({ onSuccess }: any) {
  const [form, setForm] = useState({ code: '', name: '', isActive: true });
  const mutation = useMutation({
    mutationFn: inventoryRepo.createLocation,
    onSuccess
  });

  return (
    <ModalContent footer={<Button onClick={() => mutation.mutate(form)} disabled={!form.code || !form.name}>Save</Button>}>
      <div className="space-y-4">
        <Input label="Code *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
        <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <div className="flex items-center space-x-2">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
          <label>Is Active</label>
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

  if (isLoading) return <div>Loading...</div>;
  const p = data?.data;
  if (!p) return <div>Part not found</div>;

  return (
    <div className="space-y-2">
      <p><strong>SKU:</strong> {p.sku}</p>
      <p><strong>Name:</strong> {p.name}</p>
      <p><strong>Brand:</strong> {p.brand}</p>
      <p><strong>Unit:</strong> {p.unit}</p>
    </div>
  );
}
