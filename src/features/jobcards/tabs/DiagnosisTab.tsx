import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Stethoscope, Clock, Tag } from "lucide-react";
import { jobCardDiagnosisRepo } from "@/api/repositories/jobCardDiagnosisRepo";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/i18n";

interface DiagnosisTabProps {
  jobCardId: string;
}

export const DiagnosisTab: React.FC<DiagnosisTabProps> = ({ jobCardId }) => {
  const { t } = useI18n();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["jobCardDiagnosis", jobCardId],
    queryFn: () => jobCardDiagnosisRepo.getTimeline(jobCardId),
  });

  const timeline = data?.data;
  const logs = timeline?.logs || [];

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

  if (isError) {
    return (
      <div style={{ padding: "24px", color: "var(--c-danger)" }}>
        {t("jobCards.diagnosisTab.loadError")}: {(error as any)?.message || t("jobCards.diagnosisTab.unknownError")}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <Card style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--c-muted)" }}>
            <Clock size={16} />
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>{t("jobCards.diagnosisTab.requestedEta")}</span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>
            {timeline?.requestedEta ? new Date(timeline.requestedEta).toLocaleString() : "—"}
          </span>
        </Card>

        <Card style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--c-muted)" }}>
            <Clock size={16} />
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>{t("jobCards.diagnosisTab.latestEstEta")}</span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>
            {timeline?.latestEstimatedEta ? new Date(timeline.latestEstimatedEta).toLocaleString() : "—"}
          </span>
        </Card>

        <Card style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--c-muted)" }}>
            <Tag size={16} />
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>{t("jobCards.diagnosisTab.estPrice")}</span>
          </div>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>
            {timeline?.latestEstimatedPrice !== undefined && timeline?.latestEstimatedPrice !== null
              ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(timeline.latestEstimatedPrice)
              : "—"}
          </span>
        </Card>
      </div>

      {timeline?.latestDiagnosisSummary && (
        <Card style={{ padding: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--c-muted)", textTransform: "uppercase", marginBottom: "12px" }}>{t("jobCards.diagnosisTab.latestDiagnosisSummary")}</h3>
          <p style={{ fontSize: "14px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{timeline.latestDiagnosisSummary}</p>
        </Card>
      )}

      {/* Logs Table */}
      <Card>
        <div style={{ padding: "16px", borderBottom: "1px solid var(--c-border)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{t("jobCards.diagnosisTab.timeline")}</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border)", textAlign: "left" }}>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t("jobCards.diagnosisTab.date")}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t("jobCards.diagnosisTab.by")}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t("jobCards.diagnosisTab.diagnosisNote")}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t("jobCards.diagnosisTab.newEta")}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t("jobCards.diagnosisTab.estPrice")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
                    <Stethoscope size={48} style={{ marginBottom: "16px", opacity: 0.2, margin: "0 auto" }} />
                    <p>{t("jobCards.diagnosisTab.noUpdates")}</p>
                  </td>
                </tr>
              ) : (
                [...logs].reverse().map((log: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "16px", fontSize: "14px", whiteSpace: "nowrap" }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      {log.createdByEmail || "—"}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", whiteSpace: "pre-wrap" }}>
                      {log.diagnosisNote}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", whiteSpace: "nowrap" }}>
                      {log.estimatedEta ? new Date(log.estimatedEta).toLocaleString() : "—"}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px" }}>
                      {log.estimatedPrice !== undefined && log.estimatedPrice !== null
                        ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(log.estimatedPrice)
                        : "—"}
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
