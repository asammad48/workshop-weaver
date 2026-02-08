import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Eye, 
  LogIn, 
  LogOut,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { jobCardsRepo } from "@/api/repositories/jobCardsRepo";
import { getCustomersOnce } from "@/api/lookups/customersLookup";
import { getVehiclesOnce } from "@/api/lookups/vehiclesLookup";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ModalContent, ModalHost } from "@/components/ui/Modal";
import { ConfirmDialogHost, confirm } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";

const JobCardsPage = () => {
  const { user } = useAuth();
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const [formData] = useState({
    customerId: "",
    vehicleId: "",
    mileage: undefined as number | undefined,
    notes: "",
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["jobCards", { pageNumber, pageSize, search }],
    queryFn: () => jobCardsRepo.list(pageNumber, pageSize, search),
  });

  const items = data?.data?.items ?? [];
  const totalItems = data?.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const { data: customers } = useQuery({
    queryKey: ["customersLookup"],
    queryFn: () => getCustomersOnce(),
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehiclesLookup"],
    queryFn: () => getVehiclesOnce(),
  });

  const createMutation = useMutation({
    mutationFn: jobCardsRepo.create,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Job card created successfully");
        closeModal();
        refetch();
      } else {
        toast.error(res.message || "Failed to create job card");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const checkInMutation = useMutation({
    mutationFn: jobCardsRepo.checkIn,
    onSuccess: () => {
      toast.success("Checked in successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to check in");
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: jobCardsRepo.checkOut,
    onSuccess: () => {
      toast.success("Checked out successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to check out");
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      customerId: formData.customerId,
      vehicleId: formData.vehicleId,
      mileage: formData.mileage,
      initialReport: formData.notes,
    } as any);
  };

  const handleAction = async (id: string, action: "checkIn" | "checkOut") => {
    const isConfirmed = await confirm({
      title: action === "checkIn" ? "Check-in Vehicle" : "Check-out Vehicle",
      message: `Are you sure you want to ${action === "checkIn" ? "check-in" : "check-out"} this vehicle?`,
      confirmText: action === "checkIn" ? "Check-in" : "Check-out",
      danger: action === "checkOut",
    });

    if (isConfirmed) {
      if (action === "checkIn") checkInMutation.mutate(id);
      else checkOutMutation.mutate(id);
    }
  };
import { StationTab } from "@/features/jobcards/tabs/StationTab";

const JobCardsPage = () => {
  const { user } = useAuth();
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [activeTab, setActiveTab] = useState("details");

  const handleView = (item: any) => {
    const ModalContentBody = () => {
      const [localTab, setLocalTab] = useState("details");
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '400px' }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--c-border)',
            gap: '24px',
            marginBottom: '8px'
          }}>
            {['details', 'stations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setLocalTab(tab)}
                style={{
                  padding: '12px 4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: localTab === tab ? 'var(--c-primary)' : 'var(--c-muted)',
                  borderBottom: localTab === tab ? '2px solid var(--c-primary)' : '2px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            {localTab === 'details' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle & Customer</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--c-muted)' }}>Customer</span>
                      <span style={{ fontWeight: 500 }}>{item.customerName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--c-muted)' }}>Plate Number</span>
                      <span style={{ fontWeight: 500 }}>{item.plate}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--c-muted)' }}>Status</span>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: item.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: item.status === 'COMPLETED' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'
                      }}>{item.status}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline & Usage</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--c-muted)' }}>Mileage</span>
                      <span style={{ fontWeight: 500 }}>{item.mileage?.toLocaleString() || '0'} km</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--c-muted)' }}>Check-in</span>
                      <span style={{ fontWeight: 500 }}>{item.entryAt ? new Date(item.entryAt).toLocaleString() : "-"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--c-muted)' }}>Check-out</span>
                      <span style={{ fontWeight: 500 }}>{item.exitAt ? new Date(item.exitAt).toLocaleString() : "-"}</span>
                    </div>
                  </div>
                </div>

                {item.notes && (
                  <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Notes</h3>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: 'var(--c-bg)', 
                      borderRadius: '6px', 
                      border: '1px solid var(--c-border)',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {item.notes}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <StationTab jobCardId={item.id} />
            )}
          </div>
        </div>
      );
    };

    openModal(
      `Job Card Details: ${item.plate}`,
      <ModalContent
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Close</Button>
          </div>
        }
      >
        <ModalContentBody />
      </ModalContent>
    );
  };

  const canManage = user?.role === "HQ_ADMIN" || user?.role === "MANAGER";

  const renderCreateForm = () => {
    const customerOptions = (customers || []).map((c: any) => ({ value: c.id, label: c.name }));
    const vehicleOptions = (vehicles || []).map((v: any) => ({ value: v.id, label: v.name }));

    return (
      <ModalContent
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select 
            label="Customer *"
            options={customerOptions}
            placeholder="Select Customer"
            required
            onChange={(e) => formData.customerId = e.target.value}
          />
          <Select 
            label="Vehicle *"
            options={vehicleOptions}
            placeholder="Select Vehicle"
            required
            onChange={(e) => formData.vehicleId = e.target.value}
          />
          <Input
            label="Mileage"
            type="number"
            placeholder="Enter current mileage"
            onChange={(e) => formData.mileage = parseInt(e.target.value) || undefined}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--c-text)' }}>Notes</label>
            <textarea
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--c-border)',
                backgroundColor: 'var(--c-bg)',
                color: 'var(--c-text)',
                outline: 'none',
                resize: 'vertical'
              }}
              rows={3}
              placeholder="Initial report or notes"
              onChange={(e) => formData.notes = e.target.value}
            />
          </div>
        </div>
      </ModalContent>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
          Job Cards
        </h1>
        <Button onClick={() => openModal("Create Job Card", renderCreateForm())}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create Job Card
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
              placeholder="Search plate or customer..."
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
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Customer</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Entry At</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Exit At</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Mileage</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    Error loading data: {(error as any)?.message || 'Unknown error'}
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
                items.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{item.plate}</td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{item.customerName}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: item.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' : 
                                       item.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: item.status === 'COMPLETED' ? 'rgb(34, 197, 94)' : 
                               item.status === 'IN_PROGRESS' ? 'rgb(59, 130, 246)' : 'rgb(107, 114, 128)'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>
                      {item.entryAt ? new Date(item.entryAt).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>
                      {item.exitAt ? new Date(item.exitAt).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-text)' }}>{item.mileage}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="secondary" size="sm" title="View Details" onClick={() => handleView(item)}>
                          <Eye size={16} />
                        </Button>
                        {canManage && !item.entryAt && (
                          <Button variant="secondary" size="sm" title="Check-in" onClick={() => handleAction(item.id, "checkIn")}>
                            <LogIn size={16} />
                          </Button>
                        )}
                        {canManage && item.entryAt && !item.exitAt && (
                          <Button variant="secondary" size="sm" title="Check-out" onClick={() => handleAction(item.id, "checkOut")}>
                            <LogOut size={16} />
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

      <ModalHost />
      <ConfirmDialogHost />
    </div>
  );
};

export default JobCardsPage;

