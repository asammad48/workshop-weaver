import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, AlertCircle, ShoppingCart, Package, CheckCircle2, UserCheck } from "lucide-react";
import { partRequestsRepo } from "@/api/repositories/partRequestsRepo";
import { getPartsOnce } from "@/api/lookups/partsLookup";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ModalContent } from "@/components/ui/Modal";
import { openModal, closeModal, toast } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";
import { useAuth } from "@/hooks/useAuth";

interface PartRequestsTabProps {
  jobCardId: string;
}

export const PartRequestsTab: React.FC<PartRequestsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["partRequests", jobCardId],
    queryFn: () => partRequestsRepo.list(jobCardId),
  });

  const requests = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (body: any) => partRequestsRepo.create(jobCardId, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Part request created");
        refetch();
        closeModal();
      } else {
        toast.error(res.message || "Failed to create request");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const actionMutation = useMutation({
    mutationFn: ({ type, id }: { type: string, id: string }) => {
      switch (type) {
        case 'ordered': return partRequestsRepo.markOrdered(id);
        case 'arrived': return partRequestsRepo.markArrived(id);
        case 'station': return partRequestsRepo.stationSign(id);
        case 'office': return partRequestsRepo.officeSign(id);
        default: throw new Error("Unknown action");
      }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Status updated");
        refetch();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const handleCreateRequest = () => {
    openModal(
      "New Part Request",
      <CreateRequestModal
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--c-primary)" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {(role === 'TECH' || role === 'MANAGER') && (
          <Button onClick={handleCreateRequest}>
            <Plus size={18} style={{ marginRight: "8px" }} />
            New Request
          </Button>
        )}
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border)", textAlign: "left" }}>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>Part</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>Qty</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>Status</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>Dates</th>
                <th style={{ padding: "16px", textAlign: "right", color: "var(--c-muted)", fontSize: "14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
                    No part requests found
                  </td>
                </tr>
              ) : (
                requests.map((req: any) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "16px" }}>{req.partName || req.partId}</td>
                    <td style={{ padding: "16px" }}>{req.qty}</td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ 
                        padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
                        backgroundColor: 'var(--c-bg-alt)', border: '1px solid var(--c-border)'
                      }}>{req.status}</span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "12px" }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px' }}>
                        <span style={{ color: 'var(--c-muted)' }}>Req:</span> <span>{req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : '-'}</span>
                        {req.orderedAt && <><span style={{ color: 'var(--c-muted)' }}>Ord:</span> <span>{new Date(req.orderedAt).toLocaleDateString()}</span></>}
                        {req.arrivedAt && <><span style={{ color: 'var(--c-muted)' }}>Arr:</span> <span>{new Date(req.arrivedAt).toLocaleDateString()}</span></>}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {role === 'STORE' && !req.orderedAt && (
                          <Button variant="secondary" size="sm" onClick={() => actionMutation.mutate({ type: 'ordered', id: req.id })}>
                            <ShoppingCart size={14} style={{ marginRight: '4px' }} /> Order
                          </Button>
                        )}
                        {role === 'STORE' && req.orderedAt && !req.arrivedAt && (
                          <Button variant="secondary" size="sm" onClick={() => actionMutation.mutate({ type: 'arrived', id: req.id })}>
                            <Package size={14} style={{ marginRight: '4px' }} /> Arrive
                          </Button>
                        )}
                        {role === 'TECH' && req.arrivedAt && !req.stationSignedAt && (
                          <Button variant="secondary" size="sm" onClick={() => actionMutation.mutate({ type: 'station', id: req.id })}>
                            <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Station Sign
                          </Button>
                        )}
                        {(role === 'MANAGER' || role === 'OFFICE') && req.arrivedAt && !req.officeSignedAt && (
                          <Button variant="secondary" size="sm" onClick={() => actionMutation.mutate({ type: 'office', id: req.id })}>
                            <UserCheck size={14} style={{ marginRight: '4px' }} /> Office Sign
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
      </Card>
    </div>
  );
};

const CreateRequestModal: React.FC<{ onSubmit: (data: any) => void; isPending: boolean }> = ({ onSubmit, isPending }) => {
  const [formData, setFormData] = useState({
    partId: "",
    qty: 1,
    stationCode: "",
    note: "",
  });

  const { data: parts } = useQuery({ queryKey: ["parts"], queryFn: getPartsOnce });

  return (
    <ModalContent
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => onSubmit(formData)} disabled={isPending}>
            {isPending ? "Creating..." : "Create Request"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Select
          label="Part *"
          required
          placeholder="Select part"
          value={formData.partId}
          options={(parts || []).map((p: any) => ({ value: p.id, label: p.name }))}
          onChange={(val) => setFormData(prev => ({ ...prev, partId: val as unknown as string }))}
        />
        <Input
          label="Quantity *"
          type="number"
          required
          value={formData.qty}
          onChange={(e) => setFormData(prev => ({ ...prev, qty: parseFloat(e.target.value) }))}
        />
        <Input
          label="Station Code *"
          required
          value={formData.stationCode}
          onChange={(e) => setFormData(prev => ({ ...prev, stationCode: e.target.value }))}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Notes</label>
          <textarea
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--c-border)", backgroundColor: "var(--c-bg)", color: "var(--c-text)", outline: "none" }}
            rows={3}
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
          />
        </div>
      </div>
    </ModalContent>
  );
};
