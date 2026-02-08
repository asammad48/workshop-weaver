import { 
  Client, 
  JobTaskResponseIReadOnlyListApiResponse, 
  JobTaskResponseApiResponse, 
  JobTaskCreateRequest,
  JobTaskStartRequest,
  JobTaskStopRequest,
  StartTimeLogRequest,
  StopTimeLogRequest,
  TimeLogResponseApiResponse,
  TimeLogResponseIReadOnlyListApiResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const tasksRepo = {
  async list(jobCardId: string): Promise<JobTaskResponseIReadOnlyListApiResponse> {
    try {
      return await client.tasks(jobCardId);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: JobTaskCreateRequest): Promise<JobTaskResponseApiResponse> {
    try {
      return await client.jobtasks(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async startTask(id: string, body?: JobTaskStartRequest): Promise<JobTaskResponseApiResponse> {
    try {
      return await client.start2(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async stopTask(id: string, body?: JobTaskStopRequest): Promise<JobTaskResponseApiResponse> {
    try {
      return await client.stop2(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async startTimelog(id: string, body?: StartTimeLogRequest): Promise<TimeLogResponseApiResponse> {
    try {
      return await client.start(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async stopTimelog(id: string, body?: StopTimeLogRequest): Promise<TimeLogResponseApiResponse> {
    try {
      return await client.stop(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async listTimelogs(taskId: string): Promise<TimeLogResponseIReadOnlyListApiResponse> {
    try {
      return await client.timelogs(taskId);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
