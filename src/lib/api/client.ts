/**
 * Client-side API object for frontend components.
 * Each module maps create/update/delete to /api/<module> endpoints.
 * Usage:
 *   import { api } from '$lib/api/client'
 *   const res = await api.subjects.create({ name: 'Matematika' })
 */

type ApiEnvelope<T = any> = {
  error: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    dataPerPage: number;
  };
  fieldErrors?: Record<string, string>;
};

async function request<T = any>(
  path: string,
  options?: RequestInit
): Promise<ApiEnvelope<T>> {
  try {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options
    });
    return await res.json();
  } catch (err) {
    const e = err as Error;
    return { error: true, statusCode: 500, message: e.message, data: null };
  }
}

function createCrudModule(path: string) {
  return {
    async list(params?: Record<string, string>): Promise<ApiEnvelope<any[]>> {
      const url = params ? `${path}?${new URLSearchParams(params)}` : path;
      return request(url);
    },
    async get(id: string): Promise<ApiEnvelope<any>> {
      return request(`${path}?id=${id}`);
    },
    async create(data: Record<string, any>): Promise<ApiEnvelope<any>> {
      return request(path, { method: 'POST', body: JSON.stringify(data) });
    },
    async update(idOrData: string | Record<string, any>, ...args: any[]): Promise<ApiEnvelope<any>> {
      if (typeof idOrData === 'string') {
        // update(id, data) or update(id, status, reason)
        const body: Record<string, any> = { id: idOrData };
        if (args.length >= 1) {
          if (typeof args[0] === 'object') {
            Object.assign(body, args[0]);
          } else if (typeof args[0] === 'string') {
            // attendance-style: update(id, status, rejectionReason?)
            body.status = args[0];
            if (args[1]) body.rejectionReason = args[1];
          }
        }
        return request(path, { method: 'PUT', body: JSON.stringify(body) });
      }
      // update(data) — full object with id
      return request(path, { method: 'PUT', body: JSON.stringify(idOrData) });
    },
    async delete(id: string): Promise<ApiEnvelope<any>> {
      return request(`${path}?id=${id}`, { method: 'DELETE' });
    }
  };
}

export const api = {
  subjects: createCrudModule('/api/subjects'),
  educationLevels: createCrudModule('/api/education-levels'),
  classes: createCrudModule('/api/classes'),
  packages: createCrudModule('/api/packages'),
  users: createCrudModule('/api/users'),
  enrollments: createCrudModule('/api/enrollments'),
  jobs: createCrudModule('/api/jobs'),
  attendances: createCrudModule('/api/attendances'),
  invoices: createCrudModule('/api/invoices'),
  payroll: createCrudModule('/api/payroll'),
  candidates: createCrudModule('/api/candidates'),
  applications: createCrudModule('/api/applications'),
  magicLinks: createCrudModule('/api/magic-links'),
  notifications: createCrudModule('/api/notifications'),
};
