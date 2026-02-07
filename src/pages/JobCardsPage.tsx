import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

const JobCardsPage = () => {
  const { user } = useAuth();
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    mileage: undefined as number | undefined,
    notes: "",
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["jobCards", page, search],
    queryFn: () => jobCardsRepo.list(page, 10, search),
  });

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
    onSuccess: () => {
      toast.success("Job card created successfully");
      closeModal();
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create job card");
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
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

  const canManage = user?.role === "HQ_ADMIN" || user?.role === "MANAGER";

  const renderCreateForm = () => (
    <ModalContent>
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            required
          >
            <option value="">Select Customer</option>
            {customers?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Vehicle</label>
          <select
            className="w-full p-2 border rounded"
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            required
          >
            <option value="">Select Vehicle</option>
            {vehicles?.map((v: any) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Mileage</label>
          <Input
            type="number"
            value={formData.mileage || ""}
            onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || undefined })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </ModalContent>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Cards</h1>
        <Button onClick={() => openModal("Create Job Card", renderCreateForm())}>
          Create Job Card
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search plate or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm mb-4"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Plate</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Status</th>
                <th className="p-2">Entry At</th>
                <th className="p-2">Exit At</th>
                <th className="p-2">Mileage</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
              ) : isError ? (
                <tr><td colSpan={7} className="p-4 text-center text-red-500">Error loading data</td></tr>
              ) : data?.data?.items?.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center">No job cards found</td></tr>
              ) : (
                data?.data?.items?.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{item.plate}</td>
                    <td className="p-2">{item.customerName}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2">{item.entryAt ? new Date(item.entryAt).toLocaleString() : "-"}</td>
                    <td className="p-2">{item.exitAt ? new Date(item.exitAt).toLocaleString() : "-"}</td>
                    <td className="p-2">{item.mileage}</td>
                    <td className="p-2 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => {}}>Open</Button>
                      {canManage && !item.entryAt && (
                        <Button size="sm" onClick={() => handleAction(item.id, "checkIn")}>Check-in</Button>
                      )}
                      {canManage && item.entryAt && !item.exitAt && (
                        <Button size="sm" variant="secondary" onClick={() => handleAction(item.id, "checkOut")}>Check-out</Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ModalHost />
      <ConfirmDialogHost />
    </div>
  );
};

export default JobCardsPage;

