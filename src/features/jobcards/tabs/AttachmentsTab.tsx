import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attachmentsRepo } from "@/api/repositories/attachmentsRepo";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { useUIStore } from "@/state/uiStore";
import { Loader2, Plus, Paperclip, FileIcon } from "lucide-react";

interface AttachmentsTabProps {
  jobCardId: string;
}

export const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const pushToast = useUIStore((s) => s.pushToast);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: attachments, isLoading, isError } = useQuery({
    queryKey: ["attachments", jobCardId],
    queryFn: () => attachmentsRepo.list("JobCard", jobCardId),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1. Presign
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

      // 2. Upload
      const uploadResponse = await fetch(uploadUrl, {
        method: method || "PUT",
        body: file,
        headers: headers || {},
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }

      // 3. Save Metadata
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
      pushToast("success", "File uploaded successfully");
      setIsUploading(false);
    },
    onError: (error: any) => {
      pushToast("error", error.message || "Upload failed");
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

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading attachments</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
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
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">File Name</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {attachments?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No attachments found</td>
                  </tr>
                ) : (
                  attachments?.map((file: any) => (
                    <tr key={file.id} className="border-t">
                      <td className="px-4 py-2 flex items-center">
                        <FileIcon className="mr-2 h-4 w-4 text-gray-400" />
                        {file.fileName}
                      </td>
                      <td className="px-4 py-2">{file.contentType}</td>
                      <td className="px-4 py-2">{(file.sizeBytes / 1024).toFixed(2)} KB</td>
                      <td className="px-4 py-2">{new Date(file.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
