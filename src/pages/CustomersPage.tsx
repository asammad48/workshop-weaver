import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ModalContent } from '@/components/ui/Modal';
import { openModal, closeModal, toast } from '@/state/uiStore';
import { customersRepo } from '@/api/repositories/customersRepo';
import { CustomerCreateRequest, CustomerType } from '@/api/generated/apiClient';
import { Select } from '@/components/forms/Select';
import { CUSTOMER_TYPE_OPTIONS, getCustomerTypeLabel } from '@/constants/customerType';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customers', { pageNumber, pageSize, search }],
    queryFn: () => customersRepo.list(pageNumber, pageSize, search),
  });

  const customers = data?.data?.items ?? [];
  const totalItems = data?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const createMutation = useMutation({
    mutationFn: (body: CustomerCreateRequest) => customersRepo.create(body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Customer created successfully');
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        closeModal();
      } else {
        toast.error(res.message || 'Failed to create customer');
      }
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'An error occurred';
      toast.error(message);
    },
  });

  const handleAddCustomer = () => {
    const formData = {
      fullName: '',
      phone: '',
      email: '',
      nationalId: '',
      customerType: '1',
    };

    const handleSubmit = async () => {
      if (!formData.fullName || !formData.phone) {
        toast.error('Full Name and Phone are required');
        return;
      }

      createMutation.mutate(
        new CustomerCreateRequest({
          ...formData,
          customerType: Number(formData.customerType) as CustomerType,
        }),
      );
    };

    openModal(
      'Add New Customer',
      <ModalContent
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name *"
            placeholder="Enter customer full name"
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
          <Select
            label="Customer Type *"
            options={[...CUSTOMER_TYPE_OPTIONS]}
            value={formData.customerType}
            onChange={(e) => {
              formData.customerType = e.target.value;
            }}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email address (optional)"
            onChange={(e) => {
              formData.email = e.target.value;
            }}
          />
          <Input
            label="National ID"
            placeholder="Enter national ID (optional)"
            onChange={(e) => {
              formData.nationalId = e.target.value;
            }}
          />
        </div>
      </ModalContent>,
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
          Customers
        </h1>
        <Button onClick={handleAddCustomer}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Customer
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
              placeholder="Search customers..."
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
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Full Name</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Phone</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Customer Type</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>National ID</th>
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
                    Error loading customers: {(error instanceof Error ? error.message : 'Unknown error')}
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    <Users size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                    <p>No customers found</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{customer.fullName}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{customer.phone}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          background: customer.customerType === 2 ? 'rgba(14, 165, 233, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                          color: customer.customerType === 2 ? 'rgb(2, 132, 199)' : 'rgb(22, 163, 74)',
                        }}
                      >
                        {getCustomerTypeLabel(customer.customerType)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{customer.email || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{customer.nationalId || '-'}</td>
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
