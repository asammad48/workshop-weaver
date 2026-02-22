import { 
  Client,
  AttachmentResponseIReadOnlyListApiResponse,
  PresignRequest,
  PresignResponseApiResponse,
  AttachmentCreateRequest,
  AttachmentResponseApiResponse,
  FileParameter
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const attachmentsRepo = {
  async list(ownerType?: string, ownerId?: string): Promise<AttachmentResponseIReadOnlyListApiResponse> {
    try {
      return await client.attachments(ownerType, ownerId);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async presign(body: PresignRequest): Promise<PresignResponseApiResponse> {
    try {
      return await client.presign(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async saveMetadata(body: AttachmentCreateRequest): Promise<AttachmentResponseApiResponse> {
    try {
      return await client.metadata(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async upload(formData: FormData): Promise<AttachmentResponseApiResponse> {
    try {
      const ownerType = formData.get('ownerType') as string;
      const ownerId = formData.get('ownerId') as string;
      const note = formData.get('note') as string;
      const file = formData.get('file') as File;

      const fileParam: FileParameter = {
        data: file,
        fileName: file.name
      };
      return await client.upload(ownerType, ownerId, note, fileParam);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
