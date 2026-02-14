import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attachmentsRepo } from "@/api/repositories/attachmentsRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useUIStore, toast } from "@/state/uiStore";
import { Loader2, Plus, FileIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface AttachmentsTabProps {
  jobCardId: string;
}

export const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data: attachmentsData, isLoading, isError } = useQuery({
    queryKey: ["attachments", jobCardId, page, search],
    queryFn: () => attachmentsRepo.list("JobCard", jobCardId),
  });

  const attachments = Array.isArray(attachmentsData) ? attachmentsData : [];
  const totalItems = attachments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const presignData = await attachmentsRepo.presign({
        ownerType: "JobCard",
        ownerId: jobCardId,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      if (!presignData.success || !presignData.data) {
        throw new Error(presignData.message || "Presign failed");
      }

      const { uploadUrl, method, headers, fileKey } = presignData.data;

      const uploadResponse = await fetch(uploadUrl, {
        method: method || "PUT",
        body: file,
        headers: headers || {},
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }

      const metaResponse = await attachmentsRepo.saveMetadata({
        ownerType: "JobCard",
        ownerId: jobCardId,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        fileKey: fileKey,
      });

      if (!metaResponse.success) {
        throw new Error(metaResponse.message || "Failed to save metadata");
      }

      return metaResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", jobCardId] });
      toast.success("File uploaded successfully");
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload failed");
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  if (isError) return <div className="p-8 text-center text-red-500">Error loading attachments</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Attachments</h3>
        <div>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Upload File
          </Button>
        </div>
      </div>

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
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>File Name</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Type</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Size</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "48px", textAlign: "center" }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--c-primary)" }} />
                  </td>
                </tr>
              ) : attachments.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
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
                      {(file.sizeBytes / 1024).toFixed(2)} KB
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px" }}>
                      {new Date(file.createdAt).toLocaleString()}
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
