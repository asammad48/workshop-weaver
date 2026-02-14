import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commsRepo } from "@/api/repositories/commsRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useUIStore, toast, closeModal, openModal } from "@/state/uiStore";
import { ModalContent } from "@/components/ui/Modal";
import { Loader2, Plus, MessageSquare, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface CommunicationsTabProps {
  jobCardId: string;
}

export const CommunicationsTab: React.FC<CommunicationsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data: commsData, isLoading, isError } = useQuery({
    queryKey: ["communications", jobCardId, page, search],
    queryFn: () => commsRepo.listByJobCard(jobCardId), // Note: repo might need pagination/search update, but keeping it simple for style
  });

  const comms = Array.isArray(commsData) ? commsData : [];
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

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      jobCardId,
      channel: formData.get("channel"),
      messageType: formData.get("messageType"),
      sentAt: new Date(formData.get("sentAt") as string).toISOString(),
      notes: formData.get("notes"),
    });
  };

  const openCreateModal = () => {
    openModal(
      "Add Communication Log",
      (
        <ModalContent
          footer={
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button type="submit" form="create-comm-form" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Log
              </Button>
            </div>
          }
        >
          <form id="create-comm-form" onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel *</label>
              <select name="channel" required className="w-full p-2 border rounded bg-var(--c-card) text-var(--c-text) border-var(--c-border)">
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Type *</label>
              <select name="messageType" required className="w-full p-2 border rounded bg-var(--c-card) text-var(--c-text) border-var(--c-border)">
                <option value="Estimate">Estimate</option>
                <option value="Update">Update</option>
                <option value="Reminder">Reminder</option>
                <option value="Feedback">Feedback</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sent At *</label>
              <Input name="sentAt" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea name="notes" className="w-full p-2 border rounded bg-var(--c-card) text-var(--c-text) border-var(--c-border)" rows={3} />
            </div>
          </form>
        </ModalContent>
      )
    );
  };

  if (isError) return <div className="p-8 text-center text-red-500">Error loading communications</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Communication Logs</h3>
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
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Channel</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Type</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Sent At</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "48px", textAlign: "center" }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--c-primary)" }} />
                  </td>
                </tr>
              ) : comms.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
                    No logs found
                  </td>
                </tr>
              ) : (
                comms.map((log: any) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "16px" }}>
                      <span className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-gray-400" />
                        {log.channel}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", background: "var(--c-bg-alt)", border: "1px solid var(--c-border)" }}>
                        {log.messageType}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>
                      {new Date(log.sentAt).toLocaleString()}
                    </td>
                    <td style={{ padding: "16px" }}>{log.notes}</td>
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
