import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceRepo } from "@/api/repositories/attendanceRepo";
import { useAuthStore } from "@/state/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/forms/Select";
import { toast } from "@/state/uiStore";
import { Loader2, LogIn, LogOut } from "lucide-react";
import {
  AttendanceCheckInRequest,
  AttendanceCheckOutRequest,
} from "@/api/generated/apiClient";
import { ATTENDANCE_STATUS_LABELS } from "@/constants/enums";
import { useI18n } from "@/i18n";

export default function MyAttendancePage() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceRepo.employeeMonth(year, month);
      if (res) {
        setTransfers((res as any).days || []);
      } else {
        setError("Failed to load attendance records");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [user?.id, year, month]);

  const checkInMutation = useMutation({
    mutationFn: (req: AttendanceCheckInRequest) => attendanceRepo.checkIn(req),
    onSuccess: () => {
      toast.success("Checked in successfully");
      setNote("");
      loadAttendance();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: any) => toast.error(err.message || "Check-in failed"),
  });

  const checkOutMutation = useMutation({
    mutationFn: (req: AttendanceCheckOutRequest) =>
      attendanceRepo.checkOut(req),
    onSuccess: () => {
      toast.success("Checked out successfully");
      setNote("");
      loadAttendance();
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: any) => toast.error(err.message || "Check-out failed"),
  });

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

  const handleCheckIn = () => {
    checkInMutation.mutate(new AttendanceCheckInRequest({ note }));
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(new AttendanceCheckOutRequest({ note }));
  };

  const records = transfers;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{ fontSize: "24px", fontWeight: 600, color: "var(--c-text)" }}
        >
          {t('pages.attendance.myTitle')}
        </h1>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            borderRadius: "6px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      <Card>
        <div
          style={{ padding: "16px", borderBottom: "1px solid var(--c-border)" }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--c-text)",
            }}
          >
            {t('pages.attendance.today')}
          </h2>
        </div>
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--c-text)",
              }}
            >
              {t('pages.attendance.noteOptional')}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter a note..."
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
          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending || checkOutMutation.isPending}
              style={{ flex: 1 }}
            >
              {checkInMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} style={{ marginRight: "8px" }} />
              )}
              {t('pages.attendance.checkIn')}
            </Button>
            <Button
              onClick={handleCheckOut}
              variant="secondary"
              disabled={checkInMutation.isPending || checkOutMutation.isPending}
              style={{ flex: 1 }}
            >
              {checkOutMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} style={{ marginRight: "8px" }} />
              )}
              {t('pages.attendance.checkOut')}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid var(--c-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--c-text)",
            }}
          >
            {t('pages.attendance.monthlyView')}
          </h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ width: "120px" }}>
              <Select
                options={years}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
            <div style={{ width: "150px" }}>
              <Select
                options={months}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              />
            </div>
          </div>
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
                  {t('table.status')}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {t('pages.attendance.checkIn')}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {t('pages.attendance.checkOut')}
                </th>
                <th
                  style={{
                    padding: "16px",
                    color: "var(--c-muted)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {t('table.notes')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "48px", textAlign: "center" }}
                  >
                    <Loader2
                      size={24}
                      className="animate-spin"
                      style={{ margin: "0 auto", color: "var(--c-primary)" }}
                    />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: "var(--c-muted)",
                    }}
                  >
                    {t('pages.attendance.noRecords')}
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
