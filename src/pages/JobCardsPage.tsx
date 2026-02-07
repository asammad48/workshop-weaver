import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobCardsRepo } from '@/api/repositories/jobCardsRepo';
import { getCustomersOnce } from '@/api/lookups/customersLookup';
import { getVehiclesOnce } from '@/api/lookups/vehiclesLookup';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, Plus, Eye, CheckCircle, LogOut } from 'lucide-react';

export default function JobCardsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [checkOutId, setCheckOutId] = useState<string | null>(null);

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
      setIsCreateModalOpen(false);
      Toast.success('Job card created successfully');
    },
    onError: (err: any) => Toast.error(err.message || 'Failed to create job card')
  });

  const checkInMutation = useMutation({
    mutationFn: jobCardsRepo.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] });
      setCheckInId(null);
      Toast.success('Checked in successfully');
    },
    onError: (err: any) => Toast.error(err.message || 'Failed to check in')
  });

  const checkOutMutation = useMutation({
    mutationFn: jobCardsRepo.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] });
      setCheckOutId(null);
      Toast.success('Checked out successfully');
    },
    onError: (err: any) => Toast.error(err.message || 'Failed to check out')
  });

  const canManage = user?.role === 'HQ_ADMIN' || user?.role === 'MANAGER';

  const columns = [
    { header: 'Plate', accessor: (row: any) => row.plate },
    { header: 'Customer', accessor: (row: any) => row.customerName },
    { header: 'Status', accessor: (row: any) => row.status },
    { header: 'Entry', accessor: (row: any) => row.entryAt ? new Date(row.entryAt).toLocaleString() : '-' },
    { header: 'Exit', accessor: (row: any) => row.exitAt ? new Date(row.exitAt).toLocaleString() : '-' },
    { header: 'Mileage', accessor: (row: any) => row.mileage || '-' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {/* Open details */}}>
            <Eye size={16} />
          </Button>
          {canManage && !row.entryAt && (
            <Button variant="outline" size="sm" onClick={() => setCheckInId(row.id)}>
              <CheckCircle size={16} className="mr-1" /> Check-in
            </Button>
          )}
          {canManage && row.entryAt && !row.exitAt && (
            <Button variant="outline" size="sm" onClick={() => setCheckOutId(row.id)}>
              <LogOut size={16} className="mr-1" /> Check-out
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Wrench /> Job Cards
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
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

      <Table
        columns={columns}
        data={data?.data?.items || []}
        isLoading={isLoading}
        isError={isError}
        error={isError ? 'Failed to load job cards' : null}
        pagination={{
          currentPage: page,
          totalPages: data?.data?.totalPages || 1,
          onPageChange: setPage
        }}
      />

      {isCreateModalOpen && (
        <Modal 
          title="Create Job Card" 
          onClose={() => setIsCreateModalOpen(false)}
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createMutation.mutate({
              customerId: formData.get('customerId') as string,
              vehicleId: formData.get('vehicleId') as string,
              mileage: formData.get('mileage') ? Number(formData.get('mileage')) : undefined,
              notes: formData.get('notes') as string
            });
          }}>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <select name="customerId" required className="w-full border rounded p-2">
                  <option value="">Select Customer</option>
                  {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle</label>
                <select name="vehicleId" required className="w-full border rounded p-2">
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
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>Create</Button>
            </div>
          </form>
        </Modal>
      )}

      {checkInId && (
        <ConfirmDialog
          title="Confirm Check-in"
          message="Are you sure you want to check in this vehicle?"
          onConfirm={() => checkInMutation.mutate(checkInId)}
          onCancel={() => setCheckInId(null)}
          isLoading={checkInMutation.isPending}
        />
      )}

      {checkOutId && (
        <ConfirmDialog
          title="Confirm Check-out"
          message="Are you sure you want to check out this vehicle?"
          onConfirm={() => checkOutMutation.mutate(checkOutId)}
          onCancel={() => setCheckOutId(null)}
          isLoading={checkOutMutation.isPending}
        />
      )}
    </div>
  );
}
