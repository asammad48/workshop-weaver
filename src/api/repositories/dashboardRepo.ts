import {
  Client,
  DashboardOverviewResponse,
  JobCardAlertRowPageResponse,
  InventoryDashboardResponse,
  EmployeeKpiRowPageResponse,
  ApprovalRole
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const dashboardRepo = {
  async overview(params: { branchId?: string, from?: Date, to?: Date, tz?: string }): Promise<DashboardOverviewResponse> {
    try {
      const res = await client.overview(params.branchId, params.from, params.to, params.tz);
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch dashboard overview');
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async jobcards(params: {
    branchId?: string,
    status?: string,
    minDaysInShop?: number,
    hasRoadblocker?: boolean,
    requiresApprovalRole?: string | ApprovalRole,
    pageNumber?: number,
    pageSize?: number
  }): Promise<JobCardAlertRowPageResponse> {
    try {
      // requiresApprovalRole in apiClient is ApprovalRole enum
      let role: ApprovalRole | undefined = undefined;
      if (typeof params.requiresApprovalRole === 'string') {
        if (params.requiresApprovalRole === 'ServiceAdvisor') role = ApprovalRole._1;
        else if (params.requiresApprovalRole === 'Cashier') role = ApprovalRole._2;
      } else {
        role = params.requiresApprovalRole;
      }

      const res = await client.jobcardsGET(
        params.branchId,
        params.status,
        params.minDaysInShop,
        params.hasRoadblocker,
        role,
        params.pageNumber,
        params.pageSize
      );
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch jobcard alerts');
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async inventory(params: {
    branchId?: string,
    belowReorderOnly?: boolean,
    pendingPoOnly?: boolean,
    pendingTransfersOnly?: boolean,
    pageNumber?: number,
    pageSize?: number
  }): Promise<InventoryDashboardResponse> {
    try {
      const res = await client.inventory(
        params.branchId,
        params.belowReorderOnly,
        params.pendingPoOnly,
        params.pendingTransfersOnly,
        params.pageNumber,
        params.pageSize
      );
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch inventory dashboard');
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async employeesKpi(params: {
    branchId?: string,
    from?: Date,
    to?: Date,
    employeeUserId?: string,
    pageNumber?: number,
    pageSize?: number
  }): Promise<EmployeeKpiRowPageResponse> {
    try {
      const res = await client.kpi(
        params.branchId,
        params.from,
        params.to,
        params.employeeUserId,
        params.pageNumber,
        params.pageSize
      );
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch employee KPI');
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
