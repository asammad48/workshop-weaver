import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobCardsRepo } from '@/api/repositories/jobCardsRepo';
import { getCustomersOnce } from '@/api/lookups/customersLookup';
import { getVehiclesOnce } from '@/api/lookups/vehiclesLookup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ModalContent } from '@/components/ui/Modal';
import { useUIStore, toast, confirm } from '@/state/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, Plus, Eye, CheckCircle, LogOut, Loader2, AlertCircle } from 'lucide-react';
import styles from '@/components/ui/ui.module.css';

export default function JobCardsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const openModal = useUIStore(s => s.openModal);
  const closeModal = useUIStore(s => s.closeModal);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Lookups
  const { data: customers = [] } = useQuery({ queryKey: ['customers-lookup'], queryFn: getCustomersOnce });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles-lookup'], queryFn: getVehiclesOnce });

  // Main list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['job-cards', page, search],
    queryFn: () => jobCardsRepo.list(page, 10, search)
  });

  const createMutation = useMutation({
    mutationFn: jobCardsRepo.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] });
      closeModal();
      toast('Job card created successfully', 'success');
    },
    onError: (err: any) => toast(err.message || 'Failed to create job card', 'error')
  });

  const checkInMutation = useMutation({
    mutationFn: jobCardsRepo.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] });
      toast('Checked in successfully', 'success');
    },
    onError: (err: any) => toast(err.message || 'Failed to check in', 'error')
  });

  const checkOutMutation = useMutation({
    mutationFn: jobCardsRepo.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] });
      toast('Checked out successfully', 'success');
    },
    onError: (err: any) => toast(err.message || 'Failed to check out', 'error')
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
    openModal({
      title: 'Create Job Card',
      content: (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          createMutation.mutate({
            customerId: formData.get('customerId') as string,
            vehicleId: formData.get('vehicleId') as string,
            mileage: formData.get('mileage') ? Number(formData.get('mileage')) : undefined,
            notes: formData.get('notes') as string
          } as any);
        }}>
          <ModalContent>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <select name="customerId" required className="w-full border rounded p-2 bg-white">
                  <option value="">Select Customer</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle</label>
                <select name="vehicleId" required className="w-full border rounded p-2 bg-white">
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mileage</label>
                <Input name="mileage" type="number" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea name="notes" className="w-full border rounded p-2" rows={3} />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" type="button" onClick={closeModal}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </div>
          </ModalContent>
        </form>
      )
    });
  };

  const canManage = user?.role === 'HQ_ADMIN' || user?.role === 'MANAGER';
  const items = data?.data?.items || [];
  const totalPages = (data?.data as any)?.totalPages || 1;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Wrench /> Job Cards
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-2" /> New Job Card
        </Button>
      </div>

      <Card className="mb-6 p-4">
        <Input 
          placeholder="Search job cards..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-sm"
        />
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="animate-spin mb-2" />
            <p>Loading job cards...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-danger">
            <AlertCircle className="mb-2" />
            <p>Failed to load job cards</p>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="mt-2">Try Again</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Wrench className="mb-2 opacity-20" size={48} />
            <p>No job cards found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="p-3">Plate</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Exit</th>
                  <th className="p-3">Mileage</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((row: any) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.plate}</td>
                    <td className="p-3">{row.customerName}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-muted">
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">{row.entryAt ? new Date(row.entryAt).toLocaleString() : '-'}</td>
                    <td className="p-3">{row.exitAt ? new Date(row.exitAt).toLocaleString() : '-'}</td>
                    <td className="p-3">{row.mileage || '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => {/* Details */}}>
                          <Eye size={14} />
                        </Button>
                        {canManage && !row.entryAt && (
                          <Button variant="secondary" size="sm" onClick={() => handleCheckIn(row.id)}>
                            <CheckCircle size={14} className="mr-1" /> In
                          </Button>
                        )}
                        {canManage && row.entryAt && !row.exitAt && (
                          <Button variant="secondary" size="sm" onClick={() => handleCheckOut(row.id)}>
                            <LogOut size={14} className="mr-1" /> Out
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div className="p-3 flex items-center justify-between border-t bg-muted/20">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
