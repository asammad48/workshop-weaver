import { 
  Client,
  RoadblockerAgingResponseIReadOnlyListApiResponse,
  StuckVehicleResponseIReadOnlyListApiResponse 
} from "../generated/apiClient";
import { createClient } from "./_repoBase";
import { normalizeError } from "./_errors";

const client = createClient(Client);

export const roadblockersRepo = {
  create: async (data: any) => {
    try {
      const response = await client.roadblockers(data);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  listByJobCard: async (jobCardId: string) => {
    try {
      const response = await client.jobcard(jobCardId);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  resolve: async (id: string) => {
    try {
      const response = await client.resolve(id);
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  getAging: async (from?: Date, to?: Date): Promise<RoadblockerAgingResponseIReadOnlyListApiResponse> => {
    try {
      return await client.roadblockersAging(from, to);
    } catch (error) {
      throw normalizeError(error);
    }
  },
  getStuckVehicles: async (): Promise<StuckVehicleResponseIReadOnlyListApiResponse> => {
    try {
      return await client.stuckVehicles();
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
