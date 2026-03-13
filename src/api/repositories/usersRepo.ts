import { 
  Client, 
  CreateUserDto, 
  ResetPasswordDto, 
  UpdateRoleDto,
  UserDtoApiResponse,
  UserDtoPageResponseApiResponse,
  StringApiResponse,
  UpdateUserDto
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';
import { updateLookupCache } from '../lookups/lookupsCache';

const client = createClient(Client);

export const usersRepo = {
  async list(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string): Promise<UserDtoPageResponseApiResponse> {
    try {
      return await client.usersGET(pageNumber, pageSize, search, sortBy, sortDirection);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async get(id: string): Promise<UserDtoApiResponse> {
    try {
      return await client.usersGET2(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async create(body: CreateUserDto): Promise<UserDtoApiResponse> {
    try {
      const res = await client.usersPOST(body);
      if (res.success && res.data) {
        updateLookupCache('users', res.data);
      }
      return res;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async update(id: string, body: UpdateUserDto): Promise<UserDtoApiResponse> {
    try {
      const res = await client.usersPUT(id, body);
      if (res.success && res.data) {
        updateLookupCache('users', res.data);
      }
      return res;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async disable(id: string): Promise<StringApiResponse> {
    try {
      return await client.disable(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async enable(id: string): Promise<StringApiResponse> {
    try {
      return await client.enable(id);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async setPassword(id: string, body: ResetPasswordDto): Promise<StringApiResponse> {
    try {
      return await client.setPassword(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async updateRole(id: string, body: UpdateRoleDto): Promise<StringApiResponse> {
    try {
      return await client.roles(id, body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
