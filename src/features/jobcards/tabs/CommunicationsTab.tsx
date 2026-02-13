import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commsRepo } from "@/api/repositories/commsRepo";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/state/uiStore";
import { Loader2, Plus, MessageSquare } from "lucide-react";

interface CommunicationsTabProps {
  jobCardId: string;
}

export const CommunicationsTab: React.FC<CommunicationsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const pushToast = useUIStore((s) => s.pushToast);

  const { data: comms, isLoading, isError } = useQuery({
    queryKey: ["communications", jobCardId],
    queryFn: () => commsRepo.listByJobCard(jobCardId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => commsRepo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications", jobCardId] });
      closeModal();
      pushToast("success", "Communication log created");
    },
    onError: () => pushToast("error", "Failed to create log"),
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
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Channel *</label>
            <select name="channel" required className="w-full p-2 border rounded">
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Phone">Phone</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Type *</label>
            <select name="messageType" required className="w-full p-2 border rounded">
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
            <textarea name="notes" className="w-full p-2 border rounded" />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Log
          </Button>
        </form>
      )
    );
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading communications</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-semibold">Communication Logs</h3>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" /> Add Log
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Channel</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Sent At</th>
                  <th className="px-4 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {comms?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No logs found</td>
                  </tr>
                ) : (
                  comms?.map((log: any) => (
                    <tr key={log.id} className="border-t">
                      <td className="px-4 py-2">{log.channel}</td>
                      <td className="px-4 py-2">{log.messageType}</td>
                      <td className="px-4 py-2">{new Date(log.sentAt).toLocaleString()}</td>
                      <td className="px-4 py-2">{log.notes}</td>
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
