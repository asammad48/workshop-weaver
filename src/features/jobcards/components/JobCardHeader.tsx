import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Stethoscope, Wrench, Printer, ExternalLink } from "lucide-react";
import { jobCardsRepo } from "@/api/repositories/jobCardsRepo";
import { jobCardDiagnosisRepo } from "@/api/repositories/jobCardDiagnosisRepo";
import { partRequestsRepo } from "@/api/repositories/partRequestsRepo";
import { getLocationsOnce } from "@/api/lookups/locationsLookup";
import { getPartsOnce } from "@/api/lookups/partsLookup";
import { Button } from "@/components/ui/Button";
import { ModalContent } from "@/components/ui/Modal";
import { openModal, closeModal, toast } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

interface JobCardHeaderProps {
  jobCard: any;
  onUpdate?: () => void;
}

export const JobCardHeader: React.FC<JobCardHeaderProps> = ({
  jobCard,
  onUpdate,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (body: any) => jobCardsRepo.status(jobCard.id, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["jobCards"] });
        if (onUpdate) onUpdate();
        closeModal();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const diagnosisMutation = useMutation({
    mutationFn: (body: any) => jobCardDiagnosisRepo.create(jobCard.id, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Diagnosis update added successfully");
        queryClient.invalidateQueries({ queryKey: ["jobCards"] });
        queryClient.invalidateQueries({ queryKey: ["jobCardDiagnosis", jobCard.id] });
        if (onUpdate) onUpdate();
        closeModal();
      } else {
        toast.error(res.message || "Failed to add diagnosis update");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const usePartMutation = useMutation({
    mutationFn: (body: any) => partRequestsRepo.use(jobCard.id, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Part usage recorded");
        queryClient.invalidateQueries({ queryKey: ["jobCardUsage", jobCard.id] });
        if (onUpdate) onUpdate();
        closeModal();
      } else {
        toast.error(res.message || "Failed to record part usage");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const handleStatusChange = () => {
    let formData = {
      status: jobCard.status || 0,
      note: "",
    };

    openModal(
      "Change Job Card Status",
      <ModalContent
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={() => statusMutation.mutate(formData)}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Select
            label="Status *"
            required
            options={[
              { value: 0, label: "New Request" }, // NuevaSolicitud
              { value: 1, label: "Order Placed" }, // PedidoRealizado
              { value: 2, label: "Order Received" }, // PedidoRecibido
              { value: 3, label: "Awaiting Approval" }, // EsperandoAprobacion
              { value: 4, label: "In Progress" }, // EnProceso
              { value: 5, label: "Customer Notified" }, // ClienteInformado
              { value: 6, label: "Ready for Pickup" }, // ListoParaRecoger
              { value: 7, label: "Paid" }, // Pagado
            ]}
            defaultValue={formData.status}
            onChange={(e) => (formData.status = Number(e.target.value))}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Note</label>
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
              placeholder="Optional status change note"
              onChange={(e) => (formData.note = e.target.value)}
            />
          </div>
        </div>
      </ModalContent>,
    );
  };

  const handleDiagnosis = () => {
    let formData = {
      diagnosisNote: "",
      estimatedEta: "",
      estimatedPrice: undefined as number | undefined,
    };

    openModal(
      "Add Diagnosis Update",
      <ModalContent
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!formData.diagnosisNote) {
                  toast.error("Diagnosis note is required");
                  return;
                }
                diagnosisMutation.mutate({
                  ...formData,
                  estimatedEta: formData.estimatedEta ? new Date(formData.estimatedEta) : undefined
                });
              }}
              disabled={diagnosisMutation.isPending}
            >
              {diagnosisMutation.isPending ? "Saving..." : "Add Update"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Diagnosis Note *
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
              rows={4}
              required
              placeholder="Describe findings and work needed"
              onChange={(e) => (formData.diagnosisNote = e.target.value)}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Input
              label="Updated ETA"
              type="datetime-local"
              onChange={(e) => (formData.estimatedEta = e.target.value)}
            />
            <Input
              label="Estimated Price"
              type="number"
              step="0.01"
              onChange={(e) =>
                (formData.estimatedPrice = parseFloat(e.target.value) || undefined)
              }
            />
          </div>
        </div>
      </ModalContent>,
    );
  };

  const handleUsePart = () => {
    openModal(
      "Use Part",
      <UsePartModal 
        onSubmit={(data) => usePartMutation.mutate(data)}
        isPending={usePartMutation.isPending}
      />
    );
  };

  const handlePrint = () => {
    jobCardsRepo.openPrint(jobCard.id);
  };

  const handleViewPublic = () => {
    const url = `${window.location.origin}/r/jobcards/${jobCard.id}`;
    window.open(url, "_blank");
  };

  const canManage =
    user?.role === "HQ_ADMIN" || user?.role === "BRANCH_MANAGER";

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px",
        backgroundColor: "var(--c-card)",
        borderRadius: "8px",
        border: "1px solid var(--c-border)",
        marginBottom: "16px",
        justifyContent: "flex-end",
      }}
    >
      {canManage && (
        <>
          <Button variant="secondary" onClick={handleViewPublic}>
            <ExternalLink size={18} style={{ marginRight: "8px" }} />
            View Public Receipt
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={18} style={{ marginRight: "8px" }} />
            Print JobCard
          </Button>
        </>
      )}
      <Button variant="secondary" onClick={handleUsePart}>
        <Wrench size={18} style={{ marginRight: "8px" }} />
        Use Part
      </Button>
      {(user?.role === "HQ_ADMIN" || user?.role === "BRANCH_MANAGER" || user?.role === "TECHNICIAN") && (
        <Button variant="secondary" onClick={handleDiagnosis}>
          <Stethoscope size={18} style={{ marginRight: "8px" }} />
          Add Diagnosis Update
        </Button>
      )}
      <Button onClick={handleStatusChange}>
        <ClipboardList size={18} style={{ marginRight: "8px" }} />
        Change Status
      </Button>
    </div>
  );
};

const UsePartModal: React.FC<{ onSubmit: (data: any) => void; isPending: boolean }> = ({ onSubmit, isPending }) => {
  const [formData, setFormData] = useState({
    partId: "",
    quantityUsed: 1,
    locationId: "",
    notes: "",
  });

  const { data: parts } = useQuery({ queryKey: ["parts"], queryFn: getPartsOnce });
  const { data: locations } = useQuery({ queryKey: ["locations"], queryFn: getLocationsOnce });

  return (
    <ModalContent
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => onSubmit(formData)} disabled={isPending}>
            {isPending ? "Recording..." : "Use Part"}
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
          onChange={(e) => setFormData(prev => ({ ...prev, partId: e.target.value }))}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label="Quantity *"
            type="number"
            required
            value={formData.quantityUsed}
            onChange={(e) => setFormData(prev => ({ ...prev, quantityUsed: parseFloat(e.target.value) }))}
          />
          <Select
            label="Location *"
            required
            placeholder="Select location"
            value={formData.locationId}
            options={(locations || []).map((l: any) => ({ value: l.id, label: l.name }))}
            onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Notes</label>
          <textarea
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--c-border)", backgroundColor: "var(--c-bg)", color: "var(--c-text)", outline: "none" }}
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
      </div>
    </ModalContent>
  );
};
