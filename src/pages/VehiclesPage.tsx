import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Car, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ModalContent } from '@/components/ui/Modal';
import { openModal, closeModal, toast } from '@/state/uiStore';
import { vehiclesRepo } from '@/api/repositories/vehiclesRepo';
import { getCustomersOnce } from '@/api/lookups/customersLookup';
import { VehicleCreateRequest } from '@/api/generated/apiClient';
import { Select } from '@/components/forms/Select';

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  // Data fetching
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['vehicles', { pageNumber, pageSize, search }],
    queryFn: () => vehiclesRepo.list(pageNumber, pageSize, search),
  });

  const vehicles = data?.data?.items ?? [];
  const totalItems = data?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: VehicleCreateRequest) => vehiclesRepo.create(body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Vehicle created successfully');
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        closeModal();
      } else {
        toast.error(res.message || 'Failed to create vehicle');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'An error occurred');
    }
  });

  const handleAddVehicle = async () => {
    const customers = await getCustomersOnce();
    const customerOptions = customers.map(c => ({ value: c.id!, label: c.name! }));
    
    let formData = {
      plate: '',
      make: '',
      model: '',
      year: undefined as number | undefined,
      customerId: ''
    };

    const handleSubmit = async () => {
      if (!formData.plate || !formData.customerId) {
        toast.error('Plate and Customer are required');
        return;
      }
      createMutation.mutate(new VehicleCreateRequest(formData));
    };

    openModal(
      'Add New Vehicle',
      <ModalContent
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Vehicle'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input 
            label="Plate Number *" 
            placeholder="e.g. KAA 123A" 
            required
            onChange={(e) => formData.plate = e.target.value}
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <Input 
                label="Make" 
                placeholder="e.g. Toyota" 
                onChange={(e) => formData.make = e.target.value}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input 
                label="Model" 
                placeholder="e.g. Corolla" 
                onChange={(e) => formData.model = e.target.value}
              />
            </div>
          </div>
          <Input 
            label="Year" 
            type="number"
            placeholder="e.g. 2020" 
            onChange={(e) => formData.year = e.target.value ? parseInt(e.target.value) : undefined}
          />
          <Select 
            label="Customer *"
            options={customerOptions}
            placeholder="Select a customer"
            required
            onChange={(e) => formData.customerId = e.target.value}
          />
        </div>
      </ModalContent>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
          Vehicles
        </h1>
        <Button onClick={handleAddVehicle}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Vehicle
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} 
            />
            <Input
              placeholder="Search vehicles..."
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(1);
              }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Plate</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Make</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Model</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Year</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    Error loading vehicles: {(error as any)?.message || 'Unknown error'}
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    <Car size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                    <p>No vehicles found</p>
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px', color: 'var(--c-text)', fontWeight: 500 }}>{vehicle.plate}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{vehicle.make || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{vehicle.model || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{vehicle.year || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{vehicle.customerName || '-'}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="secondary" size="sm" title="View Details">
                          <Eye size={16} />
                        </Button>
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
            Page {pageNumber} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
