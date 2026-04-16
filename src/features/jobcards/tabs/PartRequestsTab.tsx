import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Package,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { partRequestsRepo } from "@/api/repositories/partRequestsRepo";
import { getPartsOnce } from "@/api/lookups/partsLookup";
import { getWorkstationsOnce } from "@/api/lookups/workstationsLookup";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ModalContent } from "@/components/ui/Modal";
import { openModal, closeModal, toast } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";
import { useAuth } from "@/hooks/useAuth";
import { UserRole, Roles, JOB_PART_REQUEST_STATUS_LABELS } from "@/constants/enums";
import { useI18n } from "@/i18n";

interface PartRequestsTabProps {
  jobCardId: string;
}

export const PartRequestsTab: React.FC<PartRequestsTabProps> = ({
  jobCardId,
}) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userRoleId = user?.role;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["partRequests", jobCardId],
    queryFn: () => partRequestsRepo.list(jobCardId),
  });

  const requests = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (body: any) => partRequestsRepo.create(jobCardId, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t("jobCards.partRequestsTab.partRequestCreated"));
        refetch();
        closeModal();
      } else {
        toast.error(res.message || t("jobCards.partRequestsTab.partRequestCreateFailed"));
      }
    },
    onError: (err: any) => toast.error(err.message || t("jobCards.header.toasts.genericError")),
  });

  const actionMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) => {
      switch (type) {
        case "ordered":
          return partRequestsRepo.markOrdered(id);
        case "arrived":
          return partRequestsRepo.markArrived(id);
        case "station":
          return partRequestsRepo.stationSign(id);
        case "office":
          return partRequestsRepo.officeSign(id);
        default:
          throw new Error(t("jobCards.partRequestsTab.unknownAction"));
      }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(t("jobCards.partRequestsTab.statusUpdated"));
        refetch();
      } else {
        toast.error(res.message || t("jobCards.partRequestsTab.statusUpdateFailed"));
      }
    },
    onError: (err: any) => toast.error(err.message || t("jobCards.header.toasts.genericError")),
  });

  const handleCreateRequest = () => {
    openModal(
      t("jobCards.partRequestsTab.newPartRequest"),
      <CreateRequestModal
        jobCardId={jobCardId}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />,
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <Loader2
          size={24}
          className="animate-spin"
          style={{ margin: "0 auto", color: "var(--c-primary)" }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleCreateRequest}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          {t("jobCards.partRequestsTab.newRequest")}
        </Button>
      </div>

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
                  }}
                >
                  {t("jobCards.partRequestsTab.part")}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                  }}
                >
                  {t("jobCards.partRequestsTab.supplier")}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                  }}
                >
                  {t("jobCards.partRequestsTab.qty")}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                  }}
                >
                  {t("jobCards.partRequestsTab.station")}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                  }}
                >
                  {t("jobCards.partRequestsTab.status")}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                  }}
                >
                  {t("jobCards.partRequestsTab.dates")}
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                  }}
                >
                  {t("jobCards.partRequestsTab.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "var(--c-muted)",
                    }}
                  >
                    {t("jobCards.partRequestsTab.noRequests")}
                  </td>
                </tr>
              ) : (
                requests.map((req: any) => (
                  <tr
                    key={req.id}
                    style={{ borderBottom: "1px solid var(--c-border)" }}
                  >
                    <td style={{ padding: "16px" }}>
                      {req.partSku || req.partName
                        ? `${req.partSku ?? ""} — ${req.partName ?? ""}`
                        : req.partId}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {req.supplierName ?? "-"}
                    </td>
                    <td style={{ padding: "16px" }}>{req.qty}</td>
                    <td style={{ padding: "16px" }}>
                      {req.workStationName ?? req.stationCode ?? "-"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: "var(--c-bg-alt)",
                          border: "1px solid var(--c-border)",
                        }}
                      >
                        {JOB_PART_REQUEST_STATUS_LABELS[req.status] || req.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "12px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "80px 1fr",
                          gap: "4px",
                        }}
                      >
                        <span style={{ color: "var(--c-muted)" }}>{t("jobCards.partRequestsTab.requested")}</span>{" "}
                        <span>
                          {req.requestedAt
                            ? new Date(req.requestedAt).toLocaleDateString()
                            : "-"}
                        </span>
                        {req.orderedAt && (
                          <>
                            <span style={{ color: "var(--c-muted)" }}>
                              {t("jobCards.partRequestsTab.ordered")}
                            </span>{" "}
                            <span>
                              {new Date(req.orderedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                        {req.arrivedAt && (
                          <>
                            <span style={{ color: "var(--c-muted)" }}>
                              {t("jobCards.partRequestsTab.arrived")}
                            </span>{" "}
                            <span>
                              {new Date(req.arrivedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                        {req.signedAt && (
                          <>
                            <span style={{ color: "var(--c-muted)" }}>
                              {t("jobCards.partRequestsTab.signed")}
                            </span>{" "}
                            <span>
                              {new Date(req.signedAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                                {(userRoleId === Roles.STOREKEEPER || userRoleId === Roles.BRANCH_MANAGER) && !req.orderedAt && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              actionMutation.mutate({
                                type: "ordered",
                                id: req.id,
                              })
                            }
                          >
                            <ShoppingCart
                              size={14}
                              style={{ marginRight: "4px" }}
                            />{" "}
                            {t("jobCards.partRequestsTab.order")}
                          </Button>
                        )}
                                {(String(userRoleId) === Roles.STOREKEEPER || String(userRoleId) === Roles.BRANCH_MANAGER) &&
                          req.orderedAt &&
                          !req.arrivedAt && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                actionMutation.mutate({
                                  type: "arrived",
                                  id: req.id,
                                })
                              }
                            >
                              <Package
                                size={14}
                                style={{ marginRight: "4px" }}
                              />{" "}
                              {t("jobCards.partRequestsTab.arrive")}
                            </Button>
                          )}
                                {(String(userRoleId) === Roles.TECHNICIAN || String(userRoleId) === Roles.BRANCH_MANAGER) &&
                          req.arrivedAt &&
                          !req.stationSignedAt && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                actionMutation.mutate({
                                  type: "station",
                                  id: req.id,
                                })
                              }
                            >
                              <CheckCircle2
                                size={14}
                                style={{ marginRight: "4px" }}
                              />{" "}
                              {t("jobCards.partRequestsTab.stationSign")}
                            </Button>
                          )}
                        {(String(userRoleId) === Roles.BRANCH_MANAGER ||
                          String(userRoleId) === Roles.RECEPTIONIST) &&
                          req.arrivedAt &&
                          !req.officeSignedAt && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                actionMutation.mutate({
                                  type: "office",
                                  id: req.id,
                                })
                              }
                            >
                              <UserCheck
                                size={14}
                                style={{ marginRight: "4px" }}
                              />{" "}
                              {t("jobCards.partRequestsTab.officeSign")}
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

const CreateRequestModal: React.FC<{
  jobCardId: string;
  onSubmit: (data: any) => void;
  isPending: boolean;
}> = ({ jobCardId, onSubmit, isPending }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    partId: "",
    qty: 1,
    stationCode: "",
    note: "",
  });

  const { data: parts } = useQuery({
    queryKey: ["parts"],
    queryFn: getPartsOnce,
  });
  const { data: workstations } = useQuery({
    queryKey: ["workstations"],
    queryFn: () => getWorkstationsOnce(),
  });

  const handleSubmit = () => {
    const requestData = {
      ...formData,
      jobCardId,
    };

    onSubmit(requestData);
  };

  return (
    <ModalContent
      footer={
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <Button variant="secondary" onClick={closeModal}>
            {t("jobCards.partRequestsTab.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? t("jobCards.partRequestsTab.creating") : t("jobCards.partRequestsTab.createRequest")}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Select
          label={t("jobCards.partRequestsTab.part")}
          required
          placeholder={t("jobCards.partRequestsTab.selectPart")}
          value={formData.partId}
          options={(parts || []).map((p: any) => ({
            value: p.id,
            label: p.name,
          }))}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, partId: e.target.value }))
          }
        />
        <Input
          label={t("jobCards.partRequestsTab.quantity")}
          type="number"
          required
          value={formData.qty}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              qty: parseFloat(e.target.value),
            }))
          }
        />
        <Select
          label={t("jobCards.partRequestsTab.stationField")}
          required
          placeholder={t("jobCards.partRequestsTab.selectStation")}
          value={formData.stationCode}
          options={(workstations || []).map((w: any) => ({
            value: w.code, // 👈 use code instead of id
            label: `${w.code} - ${w.name}`,
          }))}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              stationCode: e.target.value, // 👈 store code
            }))
          }
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>{t("jobCards.partRequestsTab.notes")}</label>
          <textarea
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--c-border)",
              backgroundColor: "var(--c-bg)",
              color: "var(--c-text)",
              outline: "none",
            }}
            rows={3}
            value={formData.note}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, note: e.target.value }))
            }
          />
        </div>
      </div>
    </ModalContent>
  );
};
