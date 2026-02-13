import { 
  Client, 
  SummaryReportResponseApiResponse 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const reportsRepo = {
  async summary(from?: Date, to?: Date): Promise<SummaryReportResponseApiResponse> {
    try {
      return await client.summary(from, to);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
