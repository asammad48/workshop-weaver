import { 
  Client, 
  SummaryReportResponseApiResponse,
  SummaryReportResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export interface ExtendedSummaryResponse extends SummaryReportResponse {
  totalRevenue?: number;
  avgDaysInShop?: number;
}

export interface ExtendedSummaryApiResponse extends Omit<SummaryReportResponseApiResponse, 'data'> {
  data?: ExtendedSummaryResponse;
}

export const reportsRepo = {
  async summary(from?: Date, to?: Date): Promise<ExtendedSummaryApiResponse> {
    try {
      return await client.summary(from, to) as ExtendedSummaryApiResponse;
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
