import request from '@/api/request';
import type { OverviewStats } from '@/types/overview';
import type {
  AuditPayload,
  PoolStage,
  SupplementProjectForm,
  SupplementProjectItem,
  SupplementProjectQuery
} from '@/types/supplement-pool';

export const projectsApi = {
  getList: (params: SupplementProjectQuery) =>
    request.get<never, SupplementProjectItem[]>('/projects', { params }),

  getById: (id: string) => request.get<never, SupplementProjectItem>(`/projects/${id}`),

  create: (data: SupplementProjectForm & { poolStage?: PoolStage }) =>
    request.post<never, SupplementProjectItem>('/projects', data),

  update: (id: string, data: Partial<SupplementProjectForm>) =>
    request.put<never, SupplementProjectItem>(`/projects/${id}`, data),

  audit: (id: string, payload: AuditPayload) =>
    request.post<never, SupplementProjectItem>(`/projects/${id}/audit`, payload),

  transfer: (id: string, poolStage: PoolStage) =>
    request.post<never, SupplementProjectItem>(`/projects/${id}/transfer`, { poolStage })
};

export const overviewApi = {
  getStats: () => request.get<never, OverviewStats>('/overview/stats')
};

/** @deprecated 使用 projectsApi */
export const supplementPoolApi = {
  getList: (params: Omit<SupplementProjectQuery, 'poolStage'>) =>
    projectsApi.getList({ ...params, poolStage: 'supplement' }),
  getById: projectsApi.getById,
  create: (data: SupplementProjectForm) => projectsApi.create({ ...data, poolStage: 'supplement' }),
  update: projectsApi.update,
  audit: projectsApi.audit
};

export type { SupplementProjectItem };
