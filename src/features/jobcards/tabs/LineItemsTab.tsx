import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { lineItemsRepo } from "@/api/repositories/lineItemsRepo";
import { jobCardsRepo } from "@/api/repositories/jobCardsRepo";
import { getPartsOnce } from "@/api/lookups/partsLookup";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ModalContent } from "@/components/ui/Modal";
import { openModal, closeModal, toast } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";

interface LineItemsTabProps {
  jobCardId: string;
}

export const LineItemsTab: React.FC<LineItemsTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["lineItems", jobCardId],
    queryFn: () => lineItemsRepo.list(jobCardId),
  });

  const lineItems = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (body: any) => lineItemsRepo.create(jobCardId, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Line item added");
        refetch();
        closeModal();
      } else {
        toast.error(res.message || "Failed to add line item");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lineItemsRepo.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Line item deleted");
        refetch();
      } else {
        toast.error(res.message || "Failed to delete line item");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const handleAddLineItem = () => {
    let formData = {
      itemType: 0,
      description: "",
      quantity: 1,
      unitPrice: 0,
      partId: undefined as string | undefined,
    };

    openModal(
      "Add Line Item",
      <AddLineItemModal
        jobCardId={jobCardId}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
      />
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto", color: "var(--c-primary)" }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "var(--c-danger)" }}>
        <AlertCircle size={24} style={{ margin: "0 auto 8px" }} />
        <p>Error loading line items: {(error as any)?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleAddLineItem}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          Add Line Item
        </Button>
      </div>

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border)", textAlign: "left" }}>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Type</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Description</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Qty</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Unit Price</th>
                <th style={{ padding: "16px", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Total</th>
                <th style={{ padding: "16px", textAlign: "right", color: "var(--c-muted)", fontSize: "14px", fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "var(--c-muted)" }}>
                    No line items found
                  </td>
                </tr>
              ) : (
                lineItems.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                    <td style={{ padding: "16px" }}>{item.itemType === 1 ? "Part" : item.itemType === 2 ? "Labor" : item.itemType === 3 ? "Other" : "Unknown"}</td>
                    <td style={{ padding: "16px" }}>{item.description}</td>
                    <td style={{ padding: "16px" }}>{item.qty}</td>
                    <td style={{ padding: "16px" }}>{item.unitPrice?.toLocaleString()}</td>
                    <td style={{ padding: "16px" }}>{item.total?.toLocaleString()}</td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={14} color="var(--c-danger)" />
                      </Button>
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

const AddLineItemModal: React.FC<{ jobCardId: string, onSubmit: (data: any) => void; isPending: boolean }> = ({ jobCardId, onSubmit, isPending }) => {
  const [formData, setFormData] = useState({
    itemType: 1, // Default to StockPart
    description: "",
    quantity: 1,
    unitPrice: 0,
    partId: "" as string | undefined,
    partRequestId: "" as string | undefined,
  });

  const { data: parts } = useQuery({
    queryKey: ["parts"],
    queryFn: getPartsOnce,
  });

  const { data: partRequests } = useQuery({
    queryKey: ["partRequests", jobCardId],
    queryFn: () => jobCardsRepo.getPartRequests(jobCardId),
    enabled: !!jobCardId && typeof jobCardsRepo.getPartRequests === 'function',
  });

  const handlePartChange = (val: string) => {
    const part = parts?.find((p: any) => p.id === val);
    console.log("handlePartChange val:", val, "found part:", part);
    if (part) {
      setFormData(prev => ({
        ...prev,
        partId: part.id,
        description: part.name,
        unitPrice: part.sellingPrice || 0,
      }));
    } else {
      setFormData(prev => ({ ...prev, partId: val }));
    }
  };

  return (
    <ModalContent
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button onClick={() => {
            const submissionData = {
              type: formData.itemType,
              title: formData.description,
              qty: formData.quantity,
              unitPrice: formData.unitPrice,
              partId: formData.partId || undefined,
              jobPartRequestId: formData.partRequestId || undefined,
            };
            onSubmit(submissionData);
          }} disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Select
          label="Item Type *"
          required
          value={formData.itemType.toString()}
          options={[
            { value: "0", label: "Labor" },
            { value: "1", label: "Stock Part" },
            { value: "2", label: "Ordered Part" },
            { value: "3", label: "Misc" },
          ]}
          onChange={(val) => setFormData(prev => ({ ...prev, itemType: parseInt(val as unknown as string) }))}
        />

        {(formData.itemType === 1 || formData.itemType === 2) && (
          <>
            <Select
              label="Part"
              placeholder="Select a part (optional)"
              value={formData.partId || ""}
              options={(parts || []).map((p: any) => ({
                value: p.id,
                label: p.name,
              }))}
              onChange={(val) => handlePartChange(val as unknown as string)}
            />
            <Select
              label="Part Request"
              placeholder="Link to part request (optional)"
              value={formData.partRequestId || ""}
              options={(partRequests?.data || []).map((pr: any) => ({
                value: pr.id,
                label: `${pr.partName} (${pr.quantity})`,
              }))}
              onChange={(val) => {
                const selectedId = val as unknown as string;
                setFormData(prev => ({ ...prev, partRequestId: selectedId }));
              }}
            />
          </>
        )}

        <Input
          label="Description *"
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label="Quantity *"
            type="number"
            required
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
          />
          <Input
            label="Unit Price *"
            type="number"
            required
            value={formData.unitPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) }))}
          />
        </div>
      </div>
    </ModalContent>
  );
};
