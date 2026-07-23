import { mockDelay } from '@/mock/delay';
import { routePlanningStore } from '@/mock/route-planning-store';
import type {
  RouteActivityFormPayload,
  RouteActivityQuery,
  RouteActivityRecord
} from '@/types/route-planning';

export const routePlanningApi = {
  listRelateProjects: () => mockDelay(routePlanningStore.listRelateProjects()),

  getRelateProject: (id: string) => {
    const item = routePlanningStore.getRelateProject(id);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  list: (params: RouteActivityQuery) => mockDelay(routePlanningStore.list(params)),

  getById: (id: string) => {
    const item = routePlanningStore.getById(id);
    if (!item) return Promise.reject(new Error('活动记录不存在'));
    return mockDelay(item);
  },

  create: (payload: RouteActivityFormPayload) => mockDelay(routePlanningStore.create(payload)),

  update: (id: string, payload: RouteActivityFormPayload) => {
    const item = routePlanningStore.update(id, payload);
    if (!item) return Promise.reject(new Error('活动记录不存在'));
    return mockDelay(item);
  },

  remove: (id: string) => {
    const ok = routePlanningStore.remove(id);
    if (!ok) return Promise.reject(new Error('活动记录不存在'));
    return mockDelay(true);
  }
};

export type { RouteActivityRecord };
