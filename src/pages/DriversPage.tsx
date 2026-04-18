import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CarFront, ChevronLeft, ChevronRight, Eye, Loader2, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ModalContent } from '@/components/ui/Modal';
import { openModal, closeModal, toast } from '@/state/uiStore';
import { Select } from '@/components/forms/Select';
import { DriverCreateRequest } from '@/api/generated/apiClient';
import { driversRepo } from '@/api/repositories/driversRepo';
import { getFleetCustomersOnce } from '@/api/lookups/customersLookup';
import { useI18n } from '@/i18n';

export default function DriversPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['drivers', { pageNumber, pageSize, search }],
    queryFn: () => driversRepo.list(pageNumber, pageSize, search),
  });

  const createMutation = useMutation({
    mutationFn: (body: DriverCreateRequest) => driversRepo.create(body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Driver created successfully');
        queryClient.invalidateQueries({ queryKey: ['drivers'] });
        closeModal();
      } else {
        toast.error(res.message || 'Failed to create driver');
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    },
  });

  const drivers = data?.data?.items ?? [];
  const totalItems = data?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleAddDriver = async () => {
    const fleetCustomers = await queryClient.fetchQuery({
      queryKey: ['fleetCustomersLookup'],
      queryFn: () => getFleetCustomersOnce(),
    });
    const customerOptions = (fleetCustomers ?? [])
      .filter((customer) => customer.id)
      .map((customer) => ({
        value: customer.id!,
        label: customer.fullName || '-',
      }));

    const formData = {
      customerId: '',
      fullName: '',
      phone: '',
      licenseNumber: '',
    };

    const handleSubmit = async () => {
      if (!formData.customerId || !formData.fullName || !formData.phone) {
        toast.error('Customer, Full Name and Phone are required');
        return;
      }

      createMutation.mutate(new DriverCreateRequest(formData));
    };

    openModal(
      'Add New Driver',
      <ModalContent
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Driver'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Fleet Customer *"
            options={customerOptions}
            placeholder="Select fleet customer"
            value={formData.customerId}
            onChange={(e) => {
              formData.customerId = e.target.value;
            }}
            required
          />
          <Input
            label="Full Name *"
            placeholder="Enter driver full name"
            required
            onChange={(e) => {
              formData.fullName = e.target.value;
            }}
          />
          <Input
            label="Phone *"
            type="tel"
            placeholder="Enter phone number"
            required
            onChange={(e) => {
              formData.phone = e.target.value;
            }}
          />
          <Input
            label="License Number"
            placeholder="Enter license number (optional)"
            onChange={(e) => {
              formData.licenseNumber = e.target.value;
            }}
          />
        </div>
      </ModalContent>,
    );
  };

  const handleViewDetails = (id?: string) => {
    if (!id) return;

    openModal(
      'Driver Details',
      <DriverDetailsContent id={id} />,
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
          {t('pages.drivers.title')}
        </h1>
        <Button onClick={handleAddDriver}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          {t('pages.drivers.add')}
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
              placeholder={t('pages.drivers.searchPlaceholder')}
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
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>{t('table.fullName')}</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>{t('table.phone')}</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>{t('table.license')}</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>{t('table.customer')}</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    Error loading drivers: {(error instanceof Error ? error.message : 'Unknown error')}
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    <CarFront size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                    <p>{t('pages.drivers.empty')}</p>
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{driver.fullName}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{driver.phone || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{driver.licenseNumber || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{driver.customerName || '-'}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="secondary" size="sm" title="View Details" onClick={() => handleViewDetails(driver.id)}>
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
            {t('table.page')} {pageNumber} {t('table.of')} {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DriverDetailsContent({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversRepo.get(id),
  });

  const driver = data?.data;

  if (isLoading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--c-primary)' }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '24px', color: 'var(--c-danger)' }}>
        {(error instanceof Error ? error.message : 'Failed to load driver details')}
      </div>
    );
  }

  return (
    <ModalContent
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '12px', columnGap: '12px' }}>
        <span style={{ color: 'var(--c-muted)' }}>Full Name</span>
        <span style={{ color: 'var(--c-text)', fontWeight: 500 }}>{driver?.fullName || '-'}</span>

        <span style={{ color: 'var(--c-muted)' }}>Phone</span>
        <span style={{ color: 'var(--c-text)' }}>{driver?.phone || '-'}</span>

        <span style={{ color: 'var(--c-muted)' }}>License Number</span>
        <span style={{ color: 'var(--c-text)' }}>{driver?.licenseNumber || '-'}</span>

        <span style={{ color: 'var(--c-muted)' }}>Customer</span>
        <span style={{ color: 'var(--c-text)' }}>{driver?.customerName || '-'}</span>
      </div>
    </ModalContent>
  );
}
