import { 
  Client, 
  VehicleResponsePageResponseApiResponse, 
  VehicleResponseApiResponse, 
  VehicleCreateRequest 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const vehiclesRepo = {
  async list(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string): Promise<VehicleResponsePageResponseApiResponse> {
    try {
      return await client.vehiclesGET(pageNumber, pageSize, search, sortBy, sortDirection);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<VehicleResponseApiResponse> {
    try {
      return await client.vehiclesGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: VehicleCreateRequest): Promise<VehicleResponseApiResponse> {
    try {
      return await client.vehiclesPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
