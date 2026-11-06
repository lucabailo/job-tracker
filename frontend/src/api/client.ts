import type { EmploymentType, JobApplication, JobApplicationInput, Stats, Status } from '../types';

/** Error thrown for non-2xx responses, carrying the field errors sent by the backend. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    throw new ApiError(problem.detail ?? `Request failed (${response.status})`, response.status, problem.errors);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export interface Filters {
  type?: EmploymentType;
  q?: string;
}

export const api = {
  list(filters: Filters = {}): Promise<JobApplication[]> {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.q?.trim()) params.set('q', filters.q.trim());
    const query = params.toString();
    return request(`/api/applications${query ? `?${query}` : ''}`);
  },
  create(input: JobApplicationInput): Promise<JobApplication> {
    return request('/api/applications', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: number, input: JobApplicationInput): Promise<JobApplication> {
    return request(`/api/applications/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  importMany(applications: JobApplicationInput[]): Promise<{ imported: number; skipped: number }> {
    return request('/api/applications/import', { method: 'POST', body: JSON.stringify({ applications }) });
  },
  changeStatus(id: number, status: Status): Promise<JobApplication> {
    return request(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  remove(id: number): Promise<void> {
    return request(`/api/applications/${id}`, { method: 'DELETE' });
  },
  stats(): Promise<Stats> {
    return request('/api/stats');
  },
};
