import { apiClient } from "../generated/apiClient";

export const roadblockersRepo = {
  create: async (data: any) => {
    const response = await apiClient.roadblockers(data);
    return response.data;
  },
  listByJobCard: async (jobCardId: string) => {
    const response = await apiClient.jobcard(jobCardId);
    return response.data;
  },
  resolve: async (id: string) => {
    const response = await apiClient.resolve(id);
    return response.data;
  },
  getAging: async (from?: Date, to?: Date) => {
    const response = await apiClient.roadblockersAging(from, to);
    return response.data;
  },
  getStuckVehicles: async () => {
    const response = await apiClient.stuckVehicles();
    return response.data;
  }
};
