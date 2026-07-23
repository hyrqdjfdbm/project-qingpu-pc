import { mockDelay } from '@/mock/delay';
import { getProjectOverviewDashboard } from '@/mock/overview-dashboard';
import { projectStore } from '@/mock/project-store';
import type { OverviewStats, ProjectOverviewDashboard } from '@/types/overview';
import type {
  AuditPayload,
  PoolStage,
  SupplementProjectForm,
  SupplementProjectItem,
  SupplementProjectQuery
} from '@/types/supplement-pool';

export const projectsApi = {
  getList: (params: SupplementProjectQuery) =>
    mockDelay(projectStore.list(params)),

  getById: (id: string) => {
    const item = projectStore.getById(id);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  create: (data: SupplementProjectForm & { poolStage?: PoolStage }) =>
    mockDelay(projectStore.create(data, data.poolStage || 'supplement')),

  update: (id: string, data: Partial<SupplementProjectForm>) => {
    const item = projectStore.update(id, data);
    if (!item) return Promise.reject(new Error('项目不存在或已入库不可修改'));
    return mockDelay(item);
  },

  audit: (id: string, payload: AuditPayload) => {
    const item = projectStore.audit(id, payload);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  transfer: (id: string, poolStage: PoolStage) => {
    const item = projectStore.transferPool(id, poolStage);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  }
};

export const overviewApi = {
  getStats: () => mockDelay(projectStore.getOverview() as OverviewStats),
  getDashboard: (): Promise<ProjectOverviewDashboard> =>
    mockDelay(getProjectOverviewDashboard())
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
