import { getBaseUrl, getFetch } from '../clientFactory';

export interface User {
  id: string;
  email: string;
  role: string;
  branchId: string;
  isActive: boolean;
  name?: string;
}

export interface CreateUserDTO {
  email: string;
  role: string;
  branchId: string;
  password?: string;
}

export interface UpdateUserDTO {
  email?: string;
  role?: string;
  branchId?: string;
  isActive?: boolean;
}

export class UsersRepo {
  private get http() {
    const baseUrl = getBaseUrl();
    const fetchFn = getFetch();

    return {
      get: async <T>(url: string, options?: any) => {
        const query = options?.params ? '?' + new URLSearchParams(options.params).toString() : '';
        const resp = await fetchFn(`${baseUrl}${url}${query}`);
        if (!resp.ok) throw new Error('API Error');
        return resp.json() as Promise<T>;
      },
      post: async <T>(url: string, body?: any) => {
        const resp = await fetchFn(`${baseUrl}${url}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error('API Error');
        return resp.json() as Promise<T>;
      },
      patch: async <T>(url: string, body?: any) => {
        const resp = await fetchFn(`${baseUrl}${url}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!resp.ok) throw new Error('API Error');
        return resp.json() as Promise<T>;
      }
    };
  }

  async list(params?: { page?: number; limit?: number }) {
    return this.http.get<User[]>('/users', { params });
  }

  async get(id: string) {
    return this.http.get<User>(`/users/${id}`);
  }

  async create(data: CreateUserDTO) {
    return this.http.post<User>('/users', data);
  }

  async update(id: string, data: UpdateUserDTO) {
    return this.http.patch<User>(`/users/${id}`, data);
  }

  async resetPassword(id: string, password?: string) {
    return this.http.post<void>(`/users/${id}/reset-password`, { password });
  }

  async toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive });
  }
}

export const usersRepo = new UsersRepo();
