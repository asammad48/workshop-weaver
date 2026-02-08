import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { History, MoveHorizontal, Loader2, AlertCircle } from "lucide-react";
import { stationsRepo } from "@/api/repositories/stationsRepo";
import { getWorkstationsOnce } from "@/api/lookups/workstationsLookup";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ModalContent } from "@/components/ui/Modal";
import { openModal, closeModal, toast } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";
import { MoveJobCardRequest } from "@/api/generated/apiClient";

interface StationTabProps {
  jobCardId: string;
}

export const StationTab: React.FC<StationTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();

  const {
    data: historyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stationHistory", jobCardId],
    queryFn: () => stationsRepo.stationHistory(jobCardId),
  });

  const history = historyData?.data || [];

  const moveMutation = useMutation({
    mutationFn: (body: MoveJobCardRequest) =>
      stationsRepo.move(jobCardId, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Job card moved successfully");
        queryClient.invalidateQueries({
          queryKey: ["stationHistory", jobCardId],
        });
        queryClient.invalidateQueries({ queryKey: ["jobCard", jobCardId] });
        closeModal();
      } else {
        toast.error(res.message || "Failed to move job card");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "An error occurred");
    },
  });

  const { data: workstationsData } = useQuery({
    queryKey: ["workstations"],
    queryFn: () => getWorkstationsOnce(),
    staleTime: Infinity,
  });

  const handleMove = async () => {
    const workstations = workstationsData || [];
    const workstationOptions = workstations.map((w: any) => ({
      value: w.id,
      label: `${w.code} - ${w.name}`,
    }));

    let formData = {
      workStationId: "",
      notes: "",
    };

    const handleSubmit = () => {
      if (!formData.workStationId) {
        toast.error("Please select a target station");
        return;
      }
      console.log(formData);
      moveMutation.mutate({
        workStationId: formData.workStationId,
        notes: formData.notes,
      } as any);
    };

    openModal(
      "Move Job Card",
      <ModalContent
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={moveMutation.isPending}>
              {moveMutation.isPending ? "Moving..." : "Move"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Select
            label="Target Station *"
            options={workstationOptions}
            placeholder="Select target station"
            required
            onChange={(e) => (formData.workStationId = e.target.value)}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--c-text)",
              }}
            >
              Notes
            </label>
            <textarea
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--c-border)",
                backgroundColor: "var(--c-bg)",
                color: "var(--c-text)",
                outline: "none",
                resize: "vertical",
              }}
              rows={3}
              placeholder="Add some notes (optional)"
              onChange={(e) => (formData.notes = e.target.value)}
            />
          </div>
        </div>
      </ModalContent>,
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

  if (isError) {
    return (
      <div
        style={{
          padding: "48px",
          textAlign: "center",
          color: "var(--c-danger)",
        }}
      >
        <AlertCircle size={24} style={{ margin: "0 auto 8px" }} />
        <p>
          Error loading history: {(error as any)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleMove}>
          <MoveHorizontal size={18} style={{ marginRight: "8px" }} />
          Move to Station
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
                    fontWeight: 500,
                  }}
                >
                  From Station
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  To Station
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Moved At
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Moved By
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "var(--c-muted)",
                    }}
                  >
                    <History
                      size={48}
                      style={{
                        marginBottom: "16px",
                        opacity: 0.2,
                        margin: "0 auto",
                      }}
                    />
                    <p>No station history found</p>
                  </td>
                </tr>
              ) : (
                history.map((item: any) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--c-border)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(var(--c-primary-rgb), 0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {(item as any).fromStationName || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {(item as any).toStationName || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.movedAt
                        ? new Date(item.movedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {(item as any).movedByName || "-"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--c-text)" }}>
                      {item.notes || "-"}
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
