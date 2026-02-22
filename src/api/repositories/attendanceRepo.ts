import {
  Client,
  AttendanceCheckInRequest,
  AttendanceCheckOutRequest,
  AttendanceUpsertStatusRequest,
  AttendanceRecordResponse,
  AttendanceRecordResponsePageResponse,
  AttendanceMonthResponse,
} from "@/api/generated/apiClient";
import { createClient } from "./_repoBase";
import { normalizeError } from "./_errors";

const client = createClient(Client);

export const attendanceRepo = {
  async checkIn(
    body: AttendanceCheckInRequest,
  ): Promise<AttendanceRecordResponse | undefined> {
    try {
      const res = await client.checkIn(body);
      return res.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async checkOut(
    body: AttendanceCheckOutRequest,
  ): Promise<AttendanceRecordResponse | undefined> {
    try {
      const res = await client.checkOut(body);
      return res.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async today(
    branchId?: string,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<AttendanceRecordResponsePageResponse | undefined> {
    try {
      const res = await client.today(branchId, pageNumber, pageSize);
      return res.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async employeeMonth(
    year?: number,
    month?: number,
    branchId?: string,
  ): Promise<AttendanceMonthResponse | undefined> {
    try {
      const res = await client.month(year, month, branchId);
      return res.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async upsertStatus(
    body: AttendanceUpsertStatusRequest,
  ): Promise<AttendanceRecordResponse | undefined> {
    try {
      const res = await client.statusPUT(body);
      return res.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
};
