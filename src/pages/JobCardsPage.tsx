import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wrench, 
  Plus, 
  Search,
  Eye, 
  CheckCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { jobCardsRepo } from '@/api/repositories/jobCardsRepo';
import { getCustomersOnce } from '@/api/lookups/customersLookup';
import { getVehiclesOnce } from '@/api/lookups/vehiclesLookup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ModalContent } from '@/components/ui/Modal';
import { useUIStore, toast, confirm, closeModal, openModal } from '@/state/uiStore';
import { useAuth } from '@/hooks/useAuth';

export default function JobCardsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Lookups
  const { data: customers = [] } = useQuery({ queryKey: ['customers-lookup'], queryFn: getCustomersOnce });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles-lookup'], queryFn: getVehiclesOnce });

  // Main list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['job-cards', page, search],
    queryFn: () => jobCardsRepo.list(page, pageSize, search)
  });

  const items = data?.data?.items || [];
  const totalItems = (data?.data as any)?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const createMutation = useMutation({
    mutationFn: jobCardsRepo.create,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Job card created successfully');
        queryClient.invalidateQueries({ queryKey: ['job-cards'] });
        closeModal();
      } else {
        toast.error(res.message || 'Failed to create job card');
      }
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create job card')
  });

  const checkInMutation = useMutation({
    mutationFn: jobCardsRepo.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] });
      toast.success('Checked in successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to check in')
  });

  const checkOutMutation = useMutation({
    mutationFn: jobCardsRepo.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] });
      toast.success('Checked out successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to check out')
  });

  const handleCheckIn = async (id: string) => {
    const ok = await confirm({
      title: 'Confirm Check-in',
      message: 'Are you sure you want to check in this vehicle?',
      confirmText: 'Check-in'
    });
    if (ok) checkInMutation.mutate(id);
  };

  const handleCheckOut = async (id: string) => {
    const ok = await confirm({
      title: 'Confirm Check-out',
      message: 'Are you sure you want to check out this vehicle?',
      confirmText: 'Check-out'
    });
    if (ok) checkOutMutation.mutate(id);
  };

  const handleCreate = () => {
    let formData: any = {
      customerId: '',
      vehicleId: '',
      mileage: undefined,
      notes: ''
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.customerId || !formData.vehicleId) {
        toast.error('Customer and Vehicle are required');
        return;
      }
      createMutation.mutate(formData as any);
    };

    openModal(
      'Create Job Card',
      <ModalContent
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Job Card'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px', color: 'var(--c-text)' }}>Customer *</label>
            <select 
              required 
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--c-border)',
                backgroundColor: 'var(--c-card)',
                color: 'var(--c-text)',
                outline: 'none'
              }}
              onChange={(e) => formData.customerId = e.target.value}
            >
              <option value="">Select Customer</option>
              {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px', color: 'var(--c-text)' }}>Vehicle *</label>
            <select 
              required 
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--c-border)',
                backgroundColor: 'var(--c-card)',
                color: 'var(--c-text)',
                outline: 'none'
              }}
              onChange={(e) => formData.vehicleId = e.target.value}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <Input 
            label="Mileage" 
            type="number" 
            placeholder="Enter current mileage"
            onChange={(e) => formData.mileage = e.target.value ? Number(e.target.value) : undefined}
          />
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px', color: 'var(--c-text)' }}>Notes</label>
            <textarea 
              placeholder="Initial report or notes"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--c-border)',
                backgroundColor: 'var(--c-card)',
                color: 'var(--c-text)',
                outline: 'none',
                minHeight: '80px',
                resize: 'vertical'
              }}
              onChange={(e) => formData.notes = e.target.value}
            />
          </div>
        </form>
      </ModalContent>
    );
  };

  const canManage = user?.role === 'HQ_ADMIN' || user?.role === 'MANAGER';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
            Job Cards
          </h1>
          <p style={{ color: 'var(--c-muted)', marginTop: '4px' }}>Manage entry and exit tracking</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          New Job Card
        </Button>
      </div>

      <Card>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--c-border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} 
            />
            <input
              type="text"
              placeholder="Search job cards..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                borderRadius: '6px',
                border: '1px solid var(--c-border)',
                backgroundColor: 'var(--c-bg)',
                color: 'var(--c-text)',
                outline: 'none'
              }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--c-muted)' }}>Plate</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--c-muted)' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--c-muted)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--c-muted)' }}>Entry</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--c-muted)' }}>Exit</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--c-muted)' }}>Mileage</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    Loading job cards...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    Failed to load job cards
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    <Wrench size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                    <p>No job cards found</p>
                  </td>
                </tr>
              ) : (
                items.map((row: any) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--c-text)', fontWeight: 500 }}>{row.plate}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--c-text)' }}>{row.customerName}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '999px', 
                        fontSize: '12px', 
                        backgroundColor: 'var(--c-bg)',
                        color: 'var(--c-text)',
                        border: '1px solid var(--c-border)'
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--c-text)' }}>{row.entryAt ? new Date(row.entryAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--c-text)' }}>{row.exitAt ? new Date(row.exitAt).toLocaleString() : '-'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--c-text)' }}>{row.mileage || '-'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye size={16} />
                        </Button>
                        {canManage && !row.entryAt && (
                          <Button variant="secondary" size="sm" onClick={() => handleCheckIn(row.id)}>
                            <CheckCircle size={16} style={{ marginRight: '4px' }} /> In
                          </Button>
                        )}
                        {canManage && row.entryAt && !row.exitAt && (
                          <Button variant="secondary" size="sm" onClick={() => handleCheckOut(row.id)}>
                            <LogOut size={16} style={{ marginRight: '4px' }} /> Out
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

        {totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--c-muted)' }}>
              Showing {items.length} of {totalItems} items
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '14px', color: 'var(--c-text)' }}>
                Page {page} of {totalPages}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
