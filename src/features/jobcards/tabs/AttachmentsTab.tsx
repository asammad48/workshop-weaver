import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attachmentsRepo } from "@/api/repositories/attachmentsRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { toast } from "@/state/uiStore";
import { Loader2, Plus, FileIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface AttachmentsTabProps {
  jobCardId: string;
}

export const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data: attachmentsData, isLoading, isError } = useQuery({
    queryKey: ["attachments", jobCardId],
    queryFn: () => attachmentsRepo.list("JOB_CARD", jobCardId),
  });

  const attachmentsRaw = attachmentsData?.data || [];
  const attachments = Array.isArray(attachmentsRaw) ? attachmentsRaw : [];
  const totalItems = attachments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("ownerType", "JOB_CARD");
      formData.append("ownerId", jobCardId);
      formData.append("note", note);
      formData.append("file", selectedFile);

      const res = await attachmentsRepo.upload(formData);
      if (!res.success) {
        throw new Error(res.message || "Upload failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", jobCardId] });
      toast.success("File uploaded successfully");
      setIsUploading(false);
      setNote("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
      setIsUploading(false);
    },
  });

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    setIsUploading(true);
    uploadMutation.mutate();
  };

  if (isError) return <div className="p-8 text-center text-red-500">Error loading attachments</div>;

  return (
    <div className="space-y-4">
      <Card>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--c-text)" }}>Upload Attachment</h3>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div style={{ flex: 2 }}>
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Upload
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ padding: "16px", display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--c-muted)" }} />
            <Input 
              placeholder="Search attachments..." 
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
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>FileName</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>ContentType</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Size</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Note</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Uploaded By</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>CreatedAt</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center" }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--c-primary)" }} />
                  </td>
                </tr>
              ) : attachments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
                    No attachments found
                  </td>
                </tr>
              ) : (
                attachments.map((file: any) => (
                  <tr key={file.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "16px" }}>
                      <span className="flex items-center gap-2">
                        <FileIcon size={14} className="text-gray-400" />
                        {file.fileName}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "12px", background: "var(--c-bg-alt)", border: "1px solid var(--c-border)" }}>
                        {file.contentType}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>
                      {file.sizeBytes ? (file.sizeBytes / 1024).toFixed(2) : "0.00"} KB
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)", fontSize: "14px" }}>
                      {file.note || "-"}
                    </td>
                    <td style={{ padding: "16px" }}>{file.uploadedByEmail ?? "-"}</td>
                    <td style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>
                      {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : "-"}
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
