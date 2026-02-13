import { apiClient } from "../generated/apiClient";

export const attachmentsRepo = {
  list: async (ownerType?: string, ownerId?: string) => {
    const response = await apiClient.attachments(ownerType, ownerId);
    return response.data;
  },
  presign: async (data: any) => {
    const response = await apiClient.presign(data);
    return response.data;
  },
  saveMetadata: async (data: any) => {
    const response = await apiClient.metadata(data);
    return response.data;
  },
};
