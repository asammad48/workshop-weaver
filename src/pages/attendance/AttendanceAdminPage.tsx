import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceRepo } from "@/api/repositories/attendanceRepo";
import { getUsersOnce } from "@/api/lookups/usersLookup";
import { getBranchesOnce } from "@/api/lookups/branchesLookup";
import { useAuthStore } from "@/state/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/forms/Select";
import { Input } from "@/components/ui/Input";
import { toast, openModal, closeModal } from "@/state/uiStore";
import { ModalContent } from "@/components/ui/Modal";
import { Loader2, Edit, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_OPTIONS,
} from "@/constants/enums";
import {
  AttendanceUpsertStatusRequest,
  AttendanceStatus,
} from "@/api/generated/apiClient";

export default function AttendanceAdminPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"today" | "month">("today");

  // Filters
  const [branchId, setBranchId] = useState(
    user?.role === "HQ_ADMIN" ? "" : user?.branchId || "",
  );
  const [employeeUserId, setEmployeeUserId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    return Number(localStorage.getItem("ui.pageSize")) || 10;
  });

  // Month filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  // Lookups
  const { data: users = [] } = useQuery({
    queryKey: ["usersLookup"],
    queryFn: getUsersOnce,
  });
  const { data: branches = [] } = useQuery({
    queryKey: ["branchesLookup"],
    queryFn: getBranchesOnce,
  });

  const branchOptions = useMemo(
    () => [
      { value: "", label: "All Branches" },
      ...branches.map((b) => ({ value: b.id!, label: b.name! })),
    ],
    [branches],
  );

  const employeeOptions = useMemo(
    () => [
      { value: "", label: "All Employees" },
      ...users.map((u) => ({ value: u.id!, label: u.email! })),
    ],
    [users],
  );

  // Today Data
  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ["attendance", "today", branchId, employeeUserId, page, pageSize],
    queryFn: () => attendanceRepo.today(branchId || undefined, page, pageSize),
    enabled: activeTab === "today",
  });

  // Month Data
  const { data: monthData, isLoading: monthLoading } = useQuery({
    queryKey: ["attendance", "month", employeeUserId, year, month, branchId],
    queryFn: () =>
      attendanceRepo.employeeMonth(year, month, branchId || undefined),
    enabled: activeTab === "month" && !!employeeUserId,
  });

  const upsertMutation = useMutation({
    mutationFn: (req: AttendanceUpsertStatusRequest) =>
      attendanceRepo.upsertStatus(req),
    onSuccess: () => {
      toast.success("Status updated successfully");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to update status"),
  });

  const handleEditStatus = (record: any) => {
    let workDate = record.workDate
      ? new Date(record.workDate).toISOString().split("T")[0]
      : "";
    let status = record.status || AttendanceStatus._1;
    let checkInAt = record.checkInAt
      ? new Date(record.checkInAt).toISOString().slice(0, 16)
      : "";
    let checkOutAt = record.checkOutAt
      ? new Date(record.checkOutAt).toISOString().slice(0, 16)
      : "";
    let note = record.note || "";

    const renderModal = () =>
      openModal(
        "Edit Attendance Status",
        <ModalContent
          footer={
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  upsertMutation.mutate(
                    new AttendanceUpsertStatusRequest({
                      employeeUserId: record.employeeUserId,
                      workDate: new Date(workDate),
                      status: status as AttendanceStatus,
                      checkInAt: checkInAt ? new Date(checkInAt) : undefined,
                      checkOutAt: checkOutAt ? new Date(checkOutAt) : undefined,
                      note,
                    }),
                  );
                }}
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Input
              label="Work Date"
              type="date"
              required
              defaultValue={workDate}
              onChange={(e) => (workDate = e.target.value)}
            />
            <Select
              label="Status"
              options={ATTENDANCE_STATUS_OPTIONS}
              defaultValue={status}
              onChange={(e) => (status = Number(e.target.value))}
            />
            <Input
              label="Check-in At"
              type="datetime-local"
              defaultValue={checkInAt}
              onChange={(e) => (checkInAt = e.target.value)}
            />
            <Input
              label="Check-out At"
              type="datetime-local"
              defaultValue={checkOutAt}
              onChange={(e) => (checkOutAt = e.target.value)}
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label style={{ fontSize: "14px", fontWeight: 500 }}>Note</label>
              <textarea
                defaultValue={note}
                onChange={(e) => (note = e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--c-border)",
                  background: "var(--c-bg)",
                  color: "var(--c-text)",
                  fontSize: "14px",
                  minHeight: "80px",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </ModalContent>,
      );

    renderModal();
  };

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: String(currentYear - i),
  }));
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const todayItems = todayData?.items || [];
  const todayTotalItems = todayData?.totalCount || 0;
  const todayTotalPages = Math.ceil(todayTotalItems / pageSize) || 1;

  const monthRecords = monthData?.records || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--c-text)" }}>
        Attendance Management
      </h1>

      <Card>
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "flex-end",
          }}
        >
          {user?.role === "HQ_ADMIN" && (
            <div style={{ width: "200px" }}>
              <Select
                label="Branch"
                options={branchOptions}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              />
            </div>
          )}
          <div style={{ width: "250px" }}>
            <Select
              label="Employee"
              options={employeeOptions}
              value={employeeUserId}
              onChange={(e) => setEmployeeUserId(e.target.value)}
            />
          </div>
          <div style={{ width: "100px" }}>
            <Select
              label="Page Size"
              options={[
                { value: 10, label: "10" },
                { value: 25, label: "25" },
                { value: 50, label: "50" },
                { value: 100, label: "100" },
              ]}
              value={pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPageSize(val);
                localStorage.setItem("ui.pageSize", String(val));
                setPage(1);
              }}
            />
          </div>
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          gap: "2px",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <button
          onClick={() => setActiveTab("today")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom:
              activeTab === "today"
                ? "2px solid var(--c-primary)"
                : "2px solid transparent",
            color:
              activeTab === "today" ? "var(--c-primary)" : "var(--c-muted)",
            fontWeight: activeTab === "today" ? 600 : 400,
            cursor: "pointer",
          }}
        >
          Today's List
        </button>
        <button
          onClick={() => setActiveTab("month")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom:
              activeTab === "month"
                ? "2px solid var(--c-primary)"
                : "2px solid transparent",
            color:
              activeTab === "month" ? "var(--c-primary)" : "var(--c-muted)",
            fontWeight: activeTab === "month" ? 600 : 400,
            cursor: "pointer",
          }}
        >
          Employee Month View
        </button>
      </div>

      {activeTab === "today" && (
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
                    Employee
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      color: "var(--c-muted)",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      color: "var(--c-muted)",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Check-in
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      color: "var(--c-muted)",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Check-out
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
                    Note
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
                {todayLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ padding: "48px", textAlign: "center" }}
                    >
                      <Loader2
                        size={24}
                        className="animate-spin"
                        style={{ margin: "0 auto", color: "var(--c-primary)" }}
                      />
                    </td>
                  </tr>
                ) : todayItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "48px",
                        textAlign: "center",
                        color: "var(--c-muted)",
                      }}
                    >
                      No attendance records found for today
                    </td>
                  </tr>
                ) : (
                  todayItems.map((rec) => (
                    <tr
                      key={rec.id}
                      style={{ borderBottom: "1px solid var(--c-border)" }}
                    >
                      <td style={{ padding: "16px" }}>{rec.employeeEmail}</td>
                      <td style={{ padding: "16px" }}>
                        {rec.workDate
                          ? new Date(rec.workDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        {rec.checkInAt
                          ? new Date(rec.checkInAt).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        {rec.checkOutAt
                          ? new Date(rec.checkOutAt).toLocaleTimeString()
                          : "-"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "var(--c-bg-alt)",
                            border: "1px solid var(--c-border)",
                            color:
                              rec.status === 1
                                ? "var(--c-success)"
                                : "var(--c-text)",
                          }}
                        >
                          {rec.status
                            ? ATTENDANCE_STATUS_LABELS[
                                rec.status as unknown as number
                              ]
                            : "-"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rec.note || "-"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditStatus(rec)}
                          title="Edit Status"
                        >
                          <Edit size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid var(--c-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "14px", color: "var(--c-muted)" }}>
              Page {page} of {todayTotalPages}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= todayTotalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "month" && (
        <Card>
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--c-border)",
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ width: "120px" }}>
              <Select
                label="Year"
                options={years}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
            <div style={{ width: "150px" }}>
              <Select
                label="Month"
                options={months}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
            </div>
          </div>
          {!employeeUserId ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: "var(--c-muted)",
              }}
            >
              Please select an employee to view monthly records
            </div>
          ) : (
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
                      Date
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
                      Check-in
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        color: "var(--c-muted)",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      Check-out
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        color: "var(--c-muted)",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      Note
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
                  {monthLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: "48px", textAlign: "center" }}
                      >
                        <Loader2
                          size={24}
                          className="animate-spin"
                          style={{
                            margin: "0 auto",
                            color: "var(--c-primary)",
                          }}
                        />
                      </td>
                    </tr>
                  ) : monthRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "48px",
                          textAlign: "center",
                          color: "var(--c-muted)",
                        }}
                      >
                        No records found for this period
                      </td>
                    </tr>
                  ) : (
                    monthRecords.map((rec, idx) => (
                      <tr
                        key={rec.id || idx}
                        style={{ borderBottom: "1px solid var(--c-border)" }}
                      >
                        <td style={{ padding: "16px" }}>
                          {rec.workDate
                            ? new Date(rec.workDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: "var(--c-bg-alt)",
                              border: "1px solid var(--c-border)",
                              color:
                                rec.status === 1
                                  ? "var(--c-success)"
                                  : "var(--c-text)",
                            }}
                          >
                            {rec.status
                              ? ATTENDANCE_STATUS_LABELS[
                                  rec.status as unknown as number
                                ]
                              : "-"}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          {rec.checkInAt
                            ? new Date(rec.checkInAt).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {rec.checkOutAt
                            ? new Date(rec.checkOutAt).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td
                          style={{
                            padding: "16px",
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {rec.note || "-"}
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditStatus(rec)}
                            title="Edit Status"
                          >
                            <Edit size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
