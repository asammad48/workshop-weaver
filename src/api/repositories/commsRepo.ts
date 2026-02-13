import { apiClient } from "../generated/apiClient";

export const commsRepo = {
  listByJobCard: async (jobCardId: string) => {
    const response = await apiClient.communicationsGET(jobCardId);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.communicationsPOST(data);
    return response.data;
  },
};
