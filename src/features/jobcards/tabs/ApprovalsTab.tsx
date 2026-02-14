import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsRepo } from "@/api/repositories/approvalsRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ModalContent } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/forms/Select";
import { useUIStore, toast, closeModal, openModal } from "@/state/uiStore";
import { Loader2, Plus, Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface ApprovalsTabProps {
  jobCardId: string;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data: approvalsData, isLoading, isError } = useQuery({
    queryKey: ["approvals", jobCardId, page, search],
    queryFn: () => approvalsRepo.listByJobCard(jobCardId),
  });

  const approvals = Array.isArray(approvalsData) ? approvalsData : [];
  const totalItems = approvals.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const createMutation = useMutation({
    mutationFn: (data: any) => approvalsRepo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", jobCardId] });
      closeModal();
      toast.success("Approval requested");
    },
    onError: () => toast.error("Failed to request approval"),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data, role }: { id: string; data: any; role: "supervisor" | "cashier" }) =>
      role === "supervisor" 
        ? approvalsRepo.approveSupervisor(id, data) 
        : approvalsRepo.approveCashier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", jobCardId] });
      closeModal();
      toast.success("Approval processed");
    },
    onError: () => toast.error("Failed to process approval"),
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
    let targetType = "JobCard";
    let approvalType = "";
    let note = "";

    const renderModal = () => openModal(
      "Request Approval",
      (
        <ModalContent
          footer={
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={() => {
                createMutation.mutate({
                  targetType,
                  targetId: jobCardId,
                  approvalType,
                  note,
                });
              }} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          }
        >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select 
            label="Target Type"
            options={[
              { value: "JobCard", label: "Job Card" },
              { value: "Estimate", label: "Estimate" },
            ]}
            defaultValue={targetType}
            onChange={(e) => {
              targetType = e.target.value;
              renderModal();
            }}
          />
          <Input 
            label="Approval Type" 
            required 
            placeholder="e.g. Parts, Discount" 
            defaultValue={approvalType}
            onChange={(e) => {
              approvalType = e.target.value;
              renderModal();
            }}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-var(--c-text)">Note</label>
            <textarea 
              className="w-full p-2 border rounded bg-var(--c-card) text-var(--c-text) border-var(--c-border) focus:outline-none focus:border-var(--c-primary)" 
              rows={3} 
              defaultValue={note}
              onChange={(e) => {
                note = e.target.value;
                renderModal();
              }}
            />
          </div>
        </div>
        </ModalContent>
      )
    );

    renderModal();
  };

  const openApproveModal = (approval: any, role: "supervisor" | "cashier") => {
    let note = "";

    const renderModal = () => openModal(
      `Approve as ${role}`,
      (
        <ModalContent
          footer={
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={() => {
                approveMutation.mutate({
                  id: approval.id,
                  role,
                  data: { note },
                });
              }} disabled={approveMutation.isPending}>
                {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
            </div>
          }
        >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-var(--c-text)">Approval Note</label>
            <textarea 
              className="w-full p-2 border rounded bg-var(--c-card) text-var(--c-text) border-var(--c-border) focus:outline-none focus:border-var(--c-primary)" 
              placeholder="Add a note..." 
              rows={3} 
              defaultValue={note}
              onChange={(e) => {
                note = e.target.value;
                renderModal();
              }}
            />
          </div>
        </div>
        </ModalContent>
      )
    );

    renderModal();
  };

  if (isError) return <div className="p-8 text-center text-red-500">Error loading approvals</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Approvals</h3>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Request Approval
        </Button>
      </div>

      <Card>
        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--c-muted)" }} />
            <Input 
              placeholder="Search approvals..." 
              style={{ paddingLeft: "40px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border)", textAlign: "left" }}>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Type</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Requested At</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Approved At</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Note</th>
                <th style={{ padding: "16px", textAlign: "right", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center" }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--c-primary)" }} />
                  </td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
                    No approvals found
                  </td>
                </tr>
              ) : (
                approvals.map((app: any) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "16px" }}>{app.approvalType}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ 
                        fontSize: "12px", 
                        padding: "2px 8px", 
                        borderRadius: "12px", 
                        background: app.status === 'Approved' ? 'rgba(34, 197, 94, 0.1)' : app.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' : 'var(--c-bg-alt)',
                        color: app.status === 'Approved' ? 'rgb(34, 197, 94)' : app.status === 'Pending' ? 'rgb(234, 179, 8)' : 'var(--c-text)',
                        border: '1px solid currentColor'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>
                      {app.requestedAt ? new Date(app.requestedAt).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>
                      {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "16px" }}>{app.note}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      {app.status === "Pending" && (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <Button variant="secondary" size="sm" onClick={() => openApproveModal(app, "supervisor")}>
                            <Shield size={14} className="mr-1" /> Supervisor
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => openApproveModal(app, "cashier")}>
                            <Shield size={14} className="mr-1" /> Cashier
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: "var(--c-muted)" }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
