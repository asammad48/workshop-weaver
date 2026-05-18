import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Stethoscope, Wrench, ExternalLink } from "lucide-react";
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
import { useI18n } from "@/i18n";

interface JobCardHeaderProps {
  jobCard: any;
  onUpdate?: () => void;
}

export const JobCardHeader: React.FC<JobCardHeaderProps> = ({
  jobCard,
  onUpdate,
}) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (body: any) => jobCardsRepo.status(jobCard.id, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t("jobCards.header.toasts.statusUpdated"));
        queryClient.invalidateQueries({ queryKey: ["jobCards"] });
        if (onUpdate) onUpdate();
        closeModal();
      } else {
        toast.error(res.message || t("jobCards.header.toasts.statusUpdateFailed"));
      }
    },
    onError: (err: any) => toast.error(err.message || t("jobCards.header.toasts.genericError")),
  });

  const diagnosisMutation = useMutation({
    mutationFn: (body: any) => jobCardDiagnosisRepo.create(jobCard.id, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t("jobCards.header.toasts.diagnosisAdded"));
        queryClient.invalidateQueries({ queryKey: ["jobCards"] });
        queryClient.invalidateQueries({ queryKey: ["jobCardDiagnosis", jobCard.id] });
        if (onUpdate) onUpdate();
        closeModal();
      } else {
        toast.error(res.message || t("jobCards.header.toasts.diagnosisAddFailed"));
      }
    },
    onError: (err: any) => toast.error(err.message || t("jobCards.header.toasts.genericError")),
  });

  const usePartMutation = useMutation({
    mutationFn: (body: any) => partRequestsRepo.use(jobCard.id, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t("jobCards.header.toasts.partUsageRecorded"));
        queryClient.invalidateQueries({ queryKey: ["jobCardUsage", jobCard.id] });
        if (onUpdate) onUpdate();
        closeModal();
      } else {
        toast.error(res.message || t("jobCards.header.toasts.partUsageFailed"));
      }
    },
    onError: (err: any) => toast.error(err.message || t("jobCards.header.toasts.genericError")),
  });

  const handleStatusChange = () => {
    let formData = {
      status: jobCard.status || 0,
      note: "",
    };

    openModal(
      t("jobCards.header.modals.changeStatus"),
      <ModalContent
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button variant="secondary" onClick={closeModal}>
              {t("jobCards.header.actions.cancel")}
            </Button>
            <Button
              onClick={() => statusMutation.mutate(formData)}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? t("jobCards.header.actions.updating") : t("jobCards.header.actions.updateStatus")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Select
            label={t("jobCards.header.fields.status")}
            required
            options={[
              { value: 0, label: t("jobCards.header.statusOptions.newRequest") },
              { value: 1, label: t("jobCards.header.statusOptions.orderPlaced") },
              { value: 2, label: t("jobCards.header.statusOptions.orderReceived") },
              { value: 3, label: t("jobCards.header.statusOptions.awaitingApproval") },
              { value: 4, label: t("jobCards.header.statusOptions.inProgress") },
              { value: 5, label: t("jobCards.header.statusOptions.customerNotified") },
              { value: 6, label: t("jobCards.header.statusOptions.readyForPickup") },
              { value: 7, label: t("jobCards.header.statusOptions.paid") },
            ]}
            defaultValue={formData.status}
            onChange={(e) => (formData.status = Number(e.target.value))}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>{t("jobCards.header.fields.note")}</label>
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
              placeholder={t("jobCards.header.fields.statusNotePlaceholder")}
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
      t("jobCards.header.modals.addDiagnosis"),
      <ModalContent
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button variant="secondary" onClick={closeModal}>
              {t("jobCards.header.actions.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (!formData.diagnosisNote) {
                  toast.error(t("jobCards.header.toasts.diagnosisRequired"));
                  return;
                }
                diagnosisMutation.mutate({
                  ...formData,
                  estimatedEta: formData.estimatedEta ? new Date(formData.estimatedEta) : undefined
                });
              }}
              disabled={diagnosisMutation.isPending}
            >
              {diagnosisMutation.isPending ? t("jobCards.header.actions.saving") : t("jobCards.header.actions.addUpdate")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>
              {t("jobCards.header.fields.diagnosisNote")}
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
              placeholder={t("jobCards.header.fields.diagnosisPlaceholder")}
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
              label={t("jobCards.header.fields.updatedEta")}
              type="datetime-local"
              onChange={(e) => (formData.estimatedEta = e.target.value)}
            />
            <Input
              label={t("jobCards.header.fields.estimatedPrice")}
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
      t("jobCards.header.modals.usePart"),
      <UsePartModal 
        onSubmit={(data) => usePartMutation.mutate(data)}
        isPending={usePartMutation.isPending}
      />
    );
  };

  const handleViewWorkshopReceipt = () => {
    jobCardsRepo.openFullReport(jobCard.id);
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
            {t("jobCards.header.actions.viewPublicReceipt")}
          </Button>
          <Button variant="secondary" onClick={handleViewWorkshopReceipt}>
            <ExternalLink size={18} style={{ marginRight: "8px" }} />
            {t("jobCards.header.actions.viewWorkshopReceipt")}
          </Button>
        </>
      )}
      <Button variant="secondary" onClick={handleUsePart}>
        <Wrench size={18} style={{ marginRight: "8px" }} />
        {t("jobCards.header.actions.usePart")}
      </Button>
      {(user?.role === "HQ_ADMIN" || user?.role === "BRANCH_MANAGER" || user?.role === "TECHNICIAN") && (
        <Button variant="secondary" onClick={handleDiagnosis}>
          <Stethoscope size={18} style={{ marginRight: "8px" }} />
          {t("jobCards.header.actions.addDiagnosisUpdate")}
        </Button>
      )}
      <Button onClick={handleStatusChange}>
        <ClipboardList size={18} style={{ marginRight: "8px" }} />
        {t("jobCards.header.actions.changeStatus")}
      </Button>
    </div>
  );
};

const UsePartModal: React.FC<{ onSubmit: (data: any) => void; isPending: boolean }> = ({ onSubmit, isPending }) => {
  const { t } = useI18n();
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
          <Button variant="secondary" onClick={closeModal}>{t("jobCards.header.actions.cancel")}</Button>
          <Button onClick={() => onSubmit(formData)} disabled={isPending}>
            {isPending ? t("jobCards.header.actions.recording") : t("jobCards.header.actions.usePart")}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Select
          label={t("jobCards.header.fields.part")}
          required
          placeholder={t("jobCards.header.fields.selectPart")}
          value={formData.partId}
          options={(parts || []).map((p: any) => ({ value: p.id, label: p.name }))}
          onChange={(e) => setFormData(prev => ({ ...prev, partId: e.target.value }))}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label={t("jobCards.header.fields.quantity")}
            type="number"
            required
            value={formData.quantityUsed}
            onChange={(e) => setFormData(prev => ({ ...prev, quantityUsed: parseFloat(e.target.value) }))}
          />
          <Select
            label={t("jobCards.header.fields.location")}
            required
            placeholder={t("jobCards.header.fields.selectLocation")}
            value={formData.locationId}
            options={(locations || []).map((l: any) => ({ value: l.id, label: l.name }))}
            onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>{t("jobCards.header.fields.notes")}</label>
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
