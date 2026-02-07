import { 
  Client, 
  MoveJobCardRequest, 
  JobCardStationHistoryResponseApiResponse, 
  JobCardStationHistoryResponseIReadOnlyListApiResponse, 
  StationTimeResponseIReadOnlyListApiResponse 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const stationsRepo = {
  async move(id: string, body?: MoveJobCardRequest): Promise<JobCardStationHistoryResponseApiResponse> {
    try {
      return await client.move(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async stationHistory(id: string): Promise<JobCardStationHistoryResponseIReadOnlyListApiResponse> {
    try {
      return await client.stationHistory(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async stationTime(from?: Date, to?: Date): Promise<StationTimeResponseIReadOnlyListApiResponse> {
    try {
      return await client.stationTime(from, to);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
