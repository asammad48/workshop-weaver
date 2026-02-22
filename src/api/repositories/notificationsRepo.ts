import {
  Client,
  NotificationResponsePageResponse,
  BooleanApiResponse
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const notificationsRepo = {
  async list(params: {
    unreadOnly?: boolean,
    type?: string,
    pageNumber?: number,
    pageSize?: number
  }): Promise<NotificationResponsePageResponse> {
    try {
      const res = await client.notifications(
        params.unreadOnly,
        params.type,
        params.pageNumber,
        params.pageSize
      );
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to fetch notifications');
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async markRead(id: string): Promise<boolean> {
    try {
      const res = await client.read(id);
      if (res.success) {
        return !!res.data;
      }
      throw new Error(res.message || 'Failed to mark notification as read');
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
