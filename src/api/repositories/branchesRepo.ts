import { 
  Client, 
  BranchResponsePageResponseApiResponse, 
  BranchResponseApiResponse, 
  BranchCreateRequest 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const branchesRepo = {
  async list(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string): Promise<BranchResponsePageResponseApiResponse> {
    try {
      return await client.branchesGET(pageNumber, pageSize, search, sortBy, sortDirection);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<BranchResponseApiResponse> {
    try {
      return await client.branchesGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: BranchCreateRequest): Promise<BranchResponseApiResponse> {
    try {
      return await client.branchesPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
