import {
  Client,
  DriverCreateRequest,
  DriverResponseApiResponse,
  DriverResponsePageResponseApiResponse,
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const driversRepo = {
  async list(
    pageNumber?: number,
    pageSize?: number,
    search?: string,
    sortBy?: string,
    sortDirection?: string,
    customerId?: string,
  ): Promise<DriverResponsePageResponseApiResponse> {
    try {
      return await client.driversGET(
        pageNumber,
        pageSize,
        search,
        sortBy,
        sortDirection,
        customerId,
      );
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<DriverResponseApiResponse> {
    try {
      return await client.driversGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: DriverCreateRequest): Promise<DriverResponseApiResponse> {
    try {
      return await client.driversPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },
};
