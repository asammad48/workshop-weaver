import { Client } from "../generated/apiClient";
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
    return await client.roadblockersAging(from, to);
  },
  getStuckVehicles: async () => {
    return await client.stuckVehicles();
  }
};
