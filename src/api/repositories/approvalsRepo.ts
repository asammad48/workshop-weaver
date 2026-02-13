import { apiClient } from "../generated/apiClient";

export const approvalsRepo = {
  list: async (targetType?: string, targetId?: string) => {
    const response = await apiClient.approvalsGET(targetType, targetId);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.approvalsPOST(data);
    return response.data;
  },
  listByJobCard: async (id: string) => {
    const response = await apiClient.approvalsGET2(id);
    return response.data;
  },
  approveSupervisor: async (id: string, data: any) => {
    const response = await apiClient.approveSupervisor(id, data);
    return response.data;
  },
  approveCashier: async (id: string, data: any) => {
    const response = await apiClient.approveCashier(id, data);
    return response.data;
  }
};
