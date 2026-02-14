import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsRepo } from "@/api/repositories/approvalsRepo";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ModalContent } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/state/uiStore";
import { Loader2, Plus } from "lucide-react";

interface ApprovalsTabProps {
  jobCardId: string;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const pushToast = useUIStore((s) => s.pushToast);

  const { data: approvals, isLoading, isError } = useQuery({
    queryKey: ["approvals", jobCardId],
    queryFn: () => approvalsRepo.listByJobCard(jobCardId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => approvalsRepo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", jobCardId] });
      closeModal();
      pushToast("success", "Approval requested");
    },
    onError: () => pushToast("error", "Failed to request approval"),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data, role }: { id: string; data: any; role: "supervisor" | "cashier" }) =>
      role === "supervisor" 
        ? approvalsRepo.approveSupervisor(id, data) 
        : approvalsRepo.approveCashier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", jobCardId] });
      closeModal();
      pushToast("success", "Approval processed");
    },
    onError: () => pushToast("error", "Failed to process approval"),
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      targetType: formData.get("targetType"),
      targetId: jobCardId,
      approvalType: formData.get("approvalType"),
      note: formData.get("note"),
    });
  };

  const handleApproveSubmit = (e: React.FormEvent<HTMLFormElement>, id: string, role: "supervisor" | "cashier") => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    approveMutation.mutate({
      id,
      role,
      data: { note: formData.get("note") },
    });
  };

  const openCreateModal = () => {
    openModal(
      "Request Approval",
      (
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Type</label>
            <select name="targetType" required className="w-full p-2 border rounded">
              <option value="JobCard">Job Card</option>
              <option value="Estimate">Estimate</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Approval Type</label>
            <Input name="approvalType" required placeholder="e.g. Parts, Discount" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Note</label>
            <textarea name="note" className="w-full p-2 border rounded" />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </form>
      )
    );
  };

  const openApproveModal = (approval: any, role: "supervisor" | "cashier") => {
    openModal(
      `Approve as ${role}`,
      (
        <form onSubmit={(e) => handleApproveSubmit(e, approval.id, role)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Approval Note</label>
            <textarea name="note" className="w-full p-2 border rounded" placeholder="Add a note..." />
          </div>
          <Button type="submit" className="w-full" disabled={approveMutation.isPending}>
            {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </form>
      )
    );
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading approvals</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Approvals</h3>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" /> Request Approval
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Requested At</th>
                  <th className="px-4 py-2">Approved At</th>
                  <th className="px-4 py-2">Note</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(approvals) && approvals.length > 0 ? (
                  approvals.map((app: any) => (
                    <tr key={app.id} className="border-t">
                      <td className="px-4 py-2">{app.approvalType}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          app.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{app.requestedAt ? new Date(app.requestedAt).toLocaleString() : "-"}</td>
                      <td className="px-4 py-2">{app.approvedAt ? new Date(app.approvedAt).toLocaleString() : "-"}</td>
                      <td className="px-4 py-2">{app.note}</td>
                      <td className="px-4 py-2">
                        {app.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => openApproveModal(app, "supervisor")}>Supervisor</Button>
                            <Button variant="secondary" size="sm" onClick={() => openApproveModal(app, "cashier")}>Cashier</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No approvals found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
