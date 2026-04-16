import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commsRepo } from "@/api/repositories/commsRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/forms/Select";
import { useUIStore, toast, closeModal, openModal } from "@/state/uiStore";
import { ModalContent } from "@/components/ui/Modal";
import { Loader2, Plus, MessageSquare, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n";

interface CommunicationsTabProps {
  jobCardId: string;
}

export const CommunicationsTab: React.FC<CommunicationsTabProps> = ({ jobCardId }) => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data: commsData, isLoading, isError } = useQuery({
    queryKey: ["communications", jobCardId, page, search],
    queryFn: () => commsRepo.listByJobCard(jobCardId),
  });

  const comms = commsData?.data || [];
  const totalItems = comms.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const createMutation = useMutation({
    mutationFn: (data: any) => commsRepo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", jobCardId] });
      closeModal();
      toast.success("Communication log created");
    },
    onError: () => toast.error("Failed to create log"),
  });

  const openCreateModal = () => {
    openModal(
      "Add Communication Log",
      <CreateLogModal
        jobCardId={jobCardId}
        onSave={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
    );
  };

  if (isError) return <div className="p-8 text-center text-red-500">Error loading communications</div>;

  return (
    <div className="space-y-4">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Log
        </Button>
      </div>

      <Card>
        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--c-muted)" }} />
            <Input 
              placeholder="Search logs..." 
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
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t('table.type')}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t('table.direction')}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t('table.occurredAt')}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t('table.createdBy')}</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>{t('table.summary')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px", textAlign: "center" }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--c-primary)" }} />
                  </td>
                </tr>
              ) : comms.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
                    No logs found
                  </td>
                </tr>
              ) : (
                comms.map((log: any) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "16px" }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquare size={14} style={{ color: "var(--c-muted)" }} />
                        <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", background: "var(--c-bg-alt)", border: "1px solid var(--c-border)" }}>
                          {log.type === 1 ? "Diagnosis" :
                           log.type === 2 ? "Estimate" :
                           log.type === 3 ? "Update" :
                           log.type === 4 ? "Ready For Pickup" :
                           log.type === 5 ? "Payment Reminder" :
                           log.type === 6 ? "Other" : log.type}
                        </span>
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", background: "var(--c-bg-alt)", border: "1px solid var(--c-border)" }}>
                        {log.direction === 1 ? "Outbound" :
                         log.direction === 2 ? "Inbound" :
                         log.direction === 3 ? "Internal" : log.direction}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>
                      {log.occurredAt ? new Date(log.occurredAt).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "16px" }}>{log.createdByEmail ?? "-"}</td>
                    <td style={{ padding: "16px" }}>{log.summary}</td>
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

const CreateLogModal: React.FC<{
  jobCardId: string;
  onSave: (data: any) => void;
  isPending: boolean;
}> = ({ jobCardId, onSave, isPending }) => {
  const [formData, setFormData] = useState({
    type: "1",
    direction: "1",
    occurredAt: new Date().toISOString().slice(0, 16),
    summary: "",
  });

  return (
    <ModalContent
      footer={
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => {
            onSave({
              jobCardId,
              type: parseInt(formData.type),
              direction: parseInt(formData.direction),
              occurredAt: new Date(formData.occurredAt).toISOString(),
              summary: formData.summary,
            });
          }} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Log
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Select
            label="Message Type"
            options={[
              { value: "1", label: "Diagnosis" },
              { value: "2", label: "Estimate" },
              { value: "3", label: "Update" },
              { value: "4", label: "Ready For Pickup" },
              { value: "5", label: "Payment Reminder" },
              { value: "6", label: "Other" },
            ]}
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          />
          <Select
            label="Direction"
            options={[
              { value: "1", label: "Outbound" },
              { value: "2", label: "Inbound" },
              { value: "3", label: "Internal" },
            ]}
            value={formData.direction}
            onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value }))}
          />
        </div>
        <Input
          label="Occurred At"
          type="datetime-local"
          required
          value={formData.occurredAt}
          onChange={(e) => setFormData(prev => ({ ...prev, occurredAt: e.target.value }))}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Summary (Notes)</label>
          <textarea
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--c-border)",
              backgroundColor: "var(--c-bg)",
              color: "var(--c-text)",
              outline: "none",
              minHeight: "100px",
              resize: "vertical"
            }}
            placeholder="Enter communication notes..."
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          />
        </div>
      </div>
    </ModalContent>
  );
};
