import { 
  Client, 
  AuditLogResponsePageResponseApiResponse 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const auditRepo = {
  async list(
    pageNumber?: number, 
    pageSize?: number, 
    search?: string, 
    sortBy?: string, 
    sortDirection?: string, 
    branchId?: string
  ): Promise<AuditLogResponsePageResponseApiResponse> {
    try {
      return await client.audit(pageNumber, pageSize, search, sortBy, sortDirection, branchId);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
