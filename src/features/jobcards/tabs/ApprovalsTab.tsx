import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsRepo } from "@/api/repositories/approvalsRepo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/Toast";
import { Loader2, Plus, CheckCircle } from "lucide-react";

interface ApprovalsTabProps {
  jobCardId: string;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [approveRole, setApproveRole] = useState<"supervisor" | "cashier">("supervisor");

  const { data: approvals, isLoading, isError } = useQuery({
    queryKey: ["approvals", jobCardId],
    queryFn: () => approvalsRepo.listByJobCard(jobCardId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => approvalsRepo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", jobCardId] });
      setIsCreateOpen(false);
      toast({ title: "Approval requested" });
    },
    onError: () => toast({ title: "Failed to request approval", variant: "destructive" }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data, role }: { id: string; data: any; role: "supervisor" | "cashier" }) =>
      role === "supervisor" 
        ? approvalsRepo.approveSupervisor(id, data) 
        : approvalsRepo.approveCashier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals", jobCardId] });
      setIsApproveOpen(false);
      toast({ title: "Approval processed" });
    },
    onError: () => toast({ title: "Failed to process approval", variant: "destructive" }),
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      targetType: formData.get("targetType"),
      targetId: jobCardId,
      approvalType: formData.get("approvalType"),
      note: formData.get("note"),
    });
  };

  const handleApproveSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    approveMutation.mutate({
      id: selectedApproval.id,
      role: approveRole,
      data: { note: formData.get("note") },
    });
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="p-8 text-center text-red-500">Error loading approvals</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approvals</CardTitle>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Request Approval
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Approved At</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No approvals found</TableCell>
                </TableRow>
              ) : (
                approvals?.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.approvalType}</TableCell>
                    <TableCell>{app.status}</TableCell>
                    <TableCell>{app.requestedAt ? new Date(app.requestedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{app.approvedAt ? new Date(app.approvedAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{app.note}</TableCell>
                    <TableCell>
                      {app.status === "Pending" && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedApproval(app);
                            setApproveRole("supervisor");
                            setIsApproveOpen(true);
                          }}>Supervisor</Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedApproval(app);
                            setApproveRole("cashier");
                            setIsApproveOpen(true);
                          }}>Cashier</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Request Approval">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetType">Target Type</Label>
            <Select name="targetType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JobCard">Job Card</SelectItem>
                <SelectItem value="Estimate">Estimate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="approvalType">Approval Type</Label>
            <Input name="approvalType" required placeholder="e.g. Parts, Discount" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea name="note" />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title={`Approve as ${approveRole}`}>
        <form onSubmit={handleApproveSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Approval Note</Label>
            <Textarea name="note" placeholder="Add a note..." />
          </div>
          <Button type="submit" className="w-full" disabled={approveMutation.isPending}>
            {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </form>
      </Modal>
    </div>
  );
};
