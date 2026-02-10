import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Stethoscope, Tool } from "lucide-react";
import { jobCardsRepo } from "@/api/repositories/jobCardsRepo";
import { partRequestsRepo } from "@/api/repositories/partRequestsRepo";
import { getLocationsOnce } from "@/api/lookups/locationsLookup";
import { getPartsOnce } from "@/api/lookups/partsLookup";
import { Button } from "@/components/ui/Button";
import { ModalContent } from "@/components/ui/Modal";
import { openModal, closeModal, toast } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";
import { Input } from "@/components/ui/Input";

interface JobCardHeaderProps {
  jobCard: any;
  onUpdate?: () => void;
}

export const JobCardHeader: React.FC<JobCardHeaderProps> = ({
  jobCard,
  onUpdate,
}) => {
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
    mutationFn: (body: any) => jobCardsRepo.diagnosis(jobCard.id, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Diagnosis updated successfully");
        queryClient.invalidateQueries({ queryKey: ["jobCards"] });
        if (onUpdate) onUpdate();
        closeModal();
      } else {
        toast.error(res.message || "Failed to update diagnosis");
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
      diagnosis: jobCard.diagnosis || "",
      estimateCost: jobCard.estimateCost || 0,
      estimateMinutes: jobCard.estimateMinutes || 0,
    };

    openModal(
      "Update Diagnosis",
      <ModalContent
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={() => diagnosisMutation.mutate(formData)}
              disabled={diagnosisMutation.isPending}
            >
              {diagnosisMutation.isPending ? "Saving..." : "Save Diagnosis"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              Diagnosis *
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
              placeholder="Detailed diagnosis findings"
              defaultValue={formData.diagnosis}
              onChange={(e) => (formData.diagnosis = e.target.value)}
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
              label="Estimated Cost"
              type="number"
              defaultValue={formData.estimateCost}
              onChange={(e) =>
                (formData.estimateCost = parseFloat(e.target.value) || 0)
              }
            />
            <Input
              label="Estimated Minutes"
              type="number"
              defaultValue={formData.estimateMinutes}
              onChange={(e) =>
                (formData.estimateMinutes = parseInt(e.target.value) || 0)
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
      <Button variant="secondary" onClick={handleUsePart}>
        <Tool size={18} style={{ marginRight: "8px" }} />
        Use Part
      </Button>
      <Button variant="secondary" onClick={handleDiagnosis}>
        <Stethoscope size={18} style={{ marginRight: "8px" }} />
        Update Diagnosis
      </Button>
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
    qty: 1,
    locationId: "",
    note: "",
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
          onChange={(val) => setFormData(prev => ({ ...prev, partId: val as unknown as string }))}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label="Quantity *"
            type="number"
            required
            value={formData.qty}
            onChange={(e) => setFormData(prev => ({ ...prev, qty: parseFloat(e.target.value) }))}
          />
          <Select
            label="Location *"
            required
            placeholder="Select location"
            value={formData.locationId}
            options={(locations || []).map((l: any) => ({ value: l.id, label: l.name }))}
            onChange={(val) => setFormData(prev => ({ ...prev, locationId: val as unknown as string }))}
          />
        </div>
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
