import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { JobCardStatus, JOB_CARD_STATUS_LABELS } from "@/constants/enums";
import {
  Plus,
  Search,
  Eye,
  LogIn,
  LogOut,
  Wrench,
  Printer,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { jobCardsRepo } from "@/api/repositories/jobCardsRepo";
import { getCustomersOnce } from "@/api/lookups/customersLookup";
import { getVehiclesOnce } from "@/api/lookups/vehiclesLookup";
import { driversRepo } from "@/api/repositories/driversRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ModalContent, ModalHost } from "@/components/ui/Modal";
import { ConfirmDialogHost, confirm } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";
import { StationTab } from "@/features/jobcards/tabs/StationTab";
import { TasksTab } from "@/features/jobcards/tabs/TasksTab";
import { JobCardHeader } from "@/features/jobcards/components/JobCardHeader";
import { JobCardDetails } from "@/features/jobcards/components/JobCardDetails";
import { getCustomerTypeLabel } from "@/constants/customerType";

interface JobCardFormProps {
  customers: any[];
  vehicles: any[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

const CreateJobCardForm = ({
  customers,
  vehicles,
  onCancel,
  onSubmit,
  isPending,
}: JobCardFormProps) => {
  const [formState, setFormState] = useState({
    customerId: "",
    vehicleId: "",
    driverId: "",
    mileage: undefined as number | undefined,
    notes: "",
    requestedEta: "",
  });

  const customerOptions = (customers || []).map((c: any) => ({
    value: c.id,
    label: c.name,
  }));

  const filteredVehicles = (vehicles || []).filter(
    (v: any) => !formState.customerId || v.customerId === formState.customerId
  );

  const vehicleOptions = filteredVehicles.map((v: any) => ({
    value: v.id,
    label: v.name,
  }));

  const selectedCustomer = (customers || []).find(
    (customer: any) => customer.id === formState.customerId,
  );
  const isFleetCustomer =
    getCustomerTypeLabel(selectedCustomer?.customerType) === "Fleet";

  const { data: driversResponse, isLoading: isDriversLoading } = useQuery({
    queryKey: ["driversLookup", formState.customerId],
    queryFn: () => driversRepo.list(1, 1000, undefined, undefined, undefined, formState.customerId),
    enabled: isFleetCustomer && !!formState.customerId,
  });

  const driverOptions = (driversResponse?.data?.items || []).map((driver: any) => ({
    value: driver.id,
    label: driver.fullName || "-",
  }));

  const handleCreateLocal = () => {
    onSubmit({
      vehicleId: formState.vehicleId,
      driverId: formState.driverId || undefined,
      mileage: formState.mileage,
      initialReport: formState.notes,
      requestedEta: formState.requestedEta
        ? new Date(formState.requestedEta)
        : undefined,
    });
  };

  return (
    <ModalContent
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCreateLocal} disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Select
          label="Customer *"
          value={formState.customerId}
          options={customerOptions}
          placeholder="Select Customer"
          required
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              customerId: e.target.value,
              vehicleId: "",
              driverId: "",
            }))
          }
        />
        <Select
          label="Vehicle *"
          value={formState.vehicleId}
          options={vehicleOptions}
          placeholder="Select Vehicle"
          required
          disabled={!formState.customerId}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, vehicleId: e.target.value }))
          }
        />
        {isFleetCustomer && (
          <Select
            label="Driver"
            value={formState.driverId}
            options={driverOptions}
            placeholder={isDriversLoading ? "Loading drivers..." : "Select Driver"}
            disabled={!formState.customerId || isDriversLoading}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, driverId: e.target.value }))
            }
          />
        )}
        <Input
          label="Mileage"
          type="number"
          value={formState.mileage || ""}
          placeholder="Enter current mileage"
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              mileage: parseInt(e.target.value) || undefined,
            }))
          }
        />
        <Input
          label="Requested ETA"
          type="datetime-local"
          value={formState.requestedEta}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, requestedEta: e.target.value }))
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--c-text)",
            }}
          >
            Notes
          </label>
          <textarea
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--c-border)",
              backgroundColor: "var(--c-bg)",
              color: "var(--c-text)",
              outline: "none",
              resize: "vertical",
            }}
            rows={3}
            value={formState.notes}
            placeholder="Initial report or notes"
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, notes: e.target.value }))
            }
          />
        </div>
      </div>
    </ModalContent>
  );
};

const JobCardsPage = () => {
  const { user } = useAuth();
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedJobCard, setSelectedJobCard] = useState<any>(null);
  const pageSize = 10;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["jobCards", { pageNumber, pageSize, search, fromDate, toDate }],
    queryFn: () =>
      jobCardsRepo.list(
        pageNumber,
        pageSize,
        search,
        undefined,
        undefined,
        fromDate ? new Date(fromDate) : undefined,
        toDate ? new Date(toDate) : undefined,
      ),
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

  const handleView = (item: any) => {
    setSelectedJobCard(item);
  };

  const handlePrint = (item: any) => {
    jobCardsRepo.openPrint(item.id);
  };

  const canManage =
    user?.role === "HQ_ADMIN" || user?.role === "BRANCH_MANAGER";


  if (selectedJobCard) {
    return (
      <div style={{ padding: "24px" }}>
        <JobCardDetails
          jobCard={selectedJobCard}
          onBack={() => setSelectedJobCard(null)}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--c-text)",
            margin: 0,
          }}
        >
          Job Cards
        </h1>
        <Button
          onClick={() =>
            openModal(
              "Create Job Card",
              <CreateJobCardForm
                customers={customers || []}
                vehicles={vehicles || []}
                onCancel={closeModal}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
              />
            )
          }
        >
          <Plus size={18} style={{ marginRight: "8px" }} />
          Create Job Card
        </Button>
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ minWidth: "180px", flex: 1 }}>
              <Input
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPageNumber(1);
                }}
              />
            </div>
            <div style={{ minWidth: "180px", flex: 1 }}>
              <Input
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPageNumber(1);
                }}
              />
            </div>
          </div>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--c-muted)",
              }}
            />
            <Input
              placeholder="Search plate or customer..."
              style={{ paddingLeft: "40px" }}
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
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--c-border)",
                  textAlign: "left",
                }}
              >
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Plate
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Customer
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Driver
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Branch
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Entry At
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Exit At
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Mileage
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{ padding: "48px", textAlign: "center" }}
                  >
                    <Loader2
                      size={24}
                      className="animate-spin"
                      style={{ margin: "0 auto", color: "var(--c-primary)" }}
                    />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "var(--c-danger)",
                    }}
                  >
                    Error loading data:{" "}
                    {(error as any)?.message || "Unknown error"}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "var(--c-muted)",
                    }}
                  >
                    <Wrench
                      size={48}
                      style={{
                        marginBottom: "16px",
                        opacity: 0.2,
                        margin: "0 auto",
                      }}
                    />
                    <p>No job cards found</p>
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid var(--c-border)" }}
                  >
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.vehiclePlate || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.customerName || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.driverName || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.branchName || "-"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor:
                            item.status === JobCardStatus.PAGADO
                              ? "rgba(34, 197, 94, 0.1)"
                              : item.status === JobCardStatus.EN_PROCESO
                                ? "rgba(59, 130, 246, 0.1)"
                                : "rgba(107, 114, 128, 0.1)",
                          color:
                            item.status === JobCardStatus.PAGADO
                              ? "rgb(34, 197, 94)"
                              : item.status === JobCardStatus.EN_PROCESO
                                ? "rgb(59, 130, 246)"
                                : "rgb(107, 114, 128)",
                        }}
                      >
                        {JOB_CARD_STATUS_LABELS[item.status as number] ||
                          item.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.entryAt
                        ? new Date(item.entryAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.exitAt
                        ? new Date(item.exitAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.mileage}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          title="View Details"
                          onClick={() => handleView(item)}
                        >
                          <Eye size={16} />
                        </Button>
                        {canManage && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Print JobCard"
                            onClick={() => handlePrint(item)}
                          >
                            <Printer size={16} />
                          </Button>
                        )}
                        {canManage && !item.entryAt && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Check-in"
                            onClick={() => handleAction(item.id, "checkIn")}
                          >
                            <LogIn size={16} />
                          </Button>
                        )}
                        {canManage && item.entryAt && !item.exitAt && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Check-out"
                            onClick={() => handleAction(item.id, "checkOut")}
                          >
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

        <div
          style={{
            padding: "16px",
            borderTop: "1px solid var(--c-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--c-muted)" }}>
            Page {pageNumber} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
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

      <ModalHost />
      <ConfirmDialogHost />
    </div>
  );
};

export default JobCardsPage;
