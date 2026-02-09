import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play,
  Square,
  History,
  Plus,
  Loader2,
  AlertCircle,
  StopCircle,
} from "lucide-react";
import { getWorkstationsOnce } from "@/api/lookups/workstationsLookup";
import { getTechnicians } from "@/api/lookups/usersLookup";
import { JobTaskStatus, JOB_TASK_STATUS_LABELS } from "@/constants/enums";
import { tasksRepo } from "@/api/repositories/tasksRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ModalContent } from "@/components/ui/Modal";
import { openModal, closeModal, toast } from "@/state/uiStore";
import { Select } from "@/components/forms/Select";

interface TasksTabProps {
  jobCardId: string;
}

export const TasksTab: React.FC<TasksTabProps> = ({ jobCardId }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["jobTasks", jobCardId],
    queryFn: () => tasksRepo.list(jobCardId),
  });

  const tasks = data?.data || [];

  const startMutation = useMutation({
    mutationFn: (id: string) => tasksRepo.startTask(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Task started");
        refetch();
      } else {
        toast.error(res.message || "Failed to start task");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => tasksRepo.stopTask(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Task stopped");
        refetch();
      } else {
        toast.error(res.message || "Failed to stop task");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const createMutation = useMutation({
    mutationFn: tasksRepo.create,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Task created");
        refetch();
        closeModal();
      } else {
        toast.error(res.message || "Failed to create task");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const { data: stationsData } = useQuery({
    queryKey: ["stations"],
    queryFn: () => getWorkstationsOnce(),
  });

  const stations = stationsData || [];

  const handleCreateTask = () => {
    let formData = {
      jobCardId: jobCardId,
      stationCode: "",
      title: "",
      notes: "",
    };

    openModal(
      "Create Task",
      <ModalContent
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData as any)}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Select
            label="Station *"
            placeholder="Select a station"
            required
            options={stations.map((s: any) => ({
              value: s.code,
              label: s.name,
            }))}
            onChange={(val) =>
              (formData.stationCode = val as unknown as string)
            }
          />
          <Input
            label="Title *"
            placeholder="Task title"
            required
            onChange={(e) => (formData.title = e.target.value)}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Notes</label>
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
              placeholder="Optional notes"
              onChange={(e) => (formData.notes = e.target.value)}
            />
          </div>
        </div>
      </ModalContent>,
    );
  };

  const handleViewTimelogs = (taskId: string) => {
    openModal(
      "Task Timelogs",
      <TimelogsModal taskId={taskId} jobCardId={jobCardId} />,
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
        <p>Error loading tasks: {(error as any)?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleCreateTask}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          Add Task
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
                  Station
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Title
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Started
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Ended
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Mins
                </th>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "var(--c-muted)",
                    }}
                  >
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task: any) => (
                  <tr
                    key={task.id}
                    style={{ borderBottom: "1px solid var(--c-border)" }}
                  >
                    <td style={{ padding: "16px" }}>{task.stationCode}</td>
                    <td style={{ padding: "16px" }}>{task.title}</td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor:
                            task.status === JobTaskStatus.DONE
                              ? "rgba(34, 197, 94, 0.1)"
                              : task.status === JobTaskStatus.IN_PROGRESS
                                ? "rgba(59, 130, 246, 0.1)"
                                : "rgba(107, 114, 128, 0.1)",
                          color:
                            task.status === JobTaskStatus.DONE
                              ? "rgb(34, 197, 94)"
                              : task.status === JobTaskStatus.IN_PROGRESS
                                ? "rgb(59, 130, 246)"
                                : "rgb(107, 114, 128)",
                        }}
                      >
                        {JOB_TASK_STATUS_LABELS[task.status as number] ||
                          task.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      {task.startedAt
                        ? new Date(task.startedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {task.endedAt
                        ? new Date(task.endedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {task.totalMinutes || 0}
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                        }}
                      >
                        {task.status !== JobTaskStatus.DONE &&
                          task.status !== JobTaskStatus.IN_PROGRESS && (
                            <Button
                              variant="secondary"
                              size="sm"
                              title="Start Task"
                              onClick={() => startMutation.mutate(task.id)}
                            >
                              <Play size={14} />
                            </Button>
                          )}
                        {task.status === JobTaskStatus.IN_PROGRESS && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Stop Task"
                            onClick={() => stopMutation.mutate(task.id)}
                          >
                            <Square size={14} />
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          title="View Timelogs"
                          onClick={() => handleViewTimelogs(task.id)}
                        >
                          <History size={14} />
                        </Button>
                      </div>
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

const TimelogsModal: React.FC<{ taskId: string; jobCardId: string }> = ({
  taskId,
  jobCardId,
}) => {
  const queryClient = useQueryClient();
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>("");

  useEffect(() => {
    getTechnicians().then(setTechnicians);
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["taskTimelogs", taskId],
    queryFn: () => tasksRepo.listTimelogs(taskId),
  });

  const startTimelogMutation = useMutation({
    mutationFn: (userId: string) => {
      const request: any = {
        jobTaskId: taskId,
        technicianUserId: userId,
      };
      return tasksRepo.startTimelog(jobCardId, request);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Timelog started");
        refetch();
        setSelectedTechId("");
      } else {
        toast.error(res.message || "Failed to start timelog");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const stopTimelogMutation = useMutation({
    mutationFn: (logId: string) => {
      const request: any = { timeLogId: logId };
      return tasksRepo.stopTimelog(jobCardId, request);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Timelog stopped");
        refetch();
      } else {
        toast.error(res.message || "Failed to stop timelog");
      }
    },
    onError: (err: any) => toast.error(err.message || "An error occurred"),
  });

  const handleStartLog = () => {
    if (!selectedTechId) {
      toast.error("Please select a technician first");
      return;
    }
    startTimelogMutation.mutate(selectedTechId);
  };

  const timelogs = data?.data || [];

  return (
    <ModalContent
      footer={
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            padding: "12px",
            backgroundColor: "var(--c-bg-alt)",
            borderRadius: "8px",
            border: "1px solid var(--c-border)",
          }}
        >
          <div style={{ flex: 1 }}>
            <Select
              label="Select Technician"
              placeholder="Choose technician..."
              value={selectedTechId}
              options={technicians.map((t) => ({
                value: t.id,
                label: t.name || t.userName || t.email,
              }))}
              onChange={(e: any) => setSelectedTechId(e.target.value)}
            />
          </div>
          <Button
            onClick={handleStartLog}
            disabled={startTimelogMutation.isPending || !selectedTechId}
            style={{ marginBottom: "2px" }}
          >
            {startTimelogMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} style={{ marginRight: "6px" }} />
            )}
            Start Log
          </Button>
        </div>

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
                    padding: "12px",
                    color: "var(--c-muted)",
                    fontSize: "13px",
                  }}
                >
                  Started
                </th>
                <th
                  style={{
                    padding: "12px",
                    color: "var(--c-muted)",
                    fontSize: "13px",
                  }}
                >
                  Ended
                </th>
                <th
                  style={{
                    padding: "12px",
                    color: "var(--c-muted)",
                    fontSize: "13px",
                  }}
                >
                  Mins
                </th>
                <th
                  style={{
                    padding: "12px",
                    color: "var(--c-muted)",
                    fontSize: "13px",
                  }}
                >
                  By
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    color: "var(--c-muted)",
                    fontSize: "13px",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "24px", textAlign: "center" }}
                  >
                    <Loader2 size={18} className="animate-spin" />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--c-danger)",
                    }}
                  >
                    Error
                  </td>
                </tr>
              ) : timelogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--c-muted)",
                    }}
                  >
                    No timelogs
                  </td>
                </tr>
              ) : (
                timelogs.map((log: any) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: "1px solid var(--c-border)" }}
                  >
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      {log.startedAt
                        ? new Date(log.startedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      {log.endedAt
                        ? new Date(log.endedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      {log.minutes || 0}
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px" }}>
                      {log.createdBy}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {!log.endedAt && (
                        <Button
                          variant="secondary"
                          size="sm"
                          title="Stop Log"
                          onClick={() => stopTimelogMutation.mutate(log.id)}
                          disabled={stopTimelogMutation.isPending}
                        >
                          {stopTimelogMutation.isPending ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <StopCircle size={14} color="var(--c-danger)" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ModalContent>
  );
};
