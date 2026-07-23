import { keyProjectStore } from '@/mock/key-project-store';
import { mockDelay } from '@/mock/delay';
import type {
  ImageProgressTargetPayload,
  KeyProjectItem,
  KeyProjectQuery,
  MonthlyCompletionPayload
} from '@/types/key-project-overview';

export const keyProjectApi = {
  getList: (params: KeyProjectQuery = {}) => mockDelay(keyProjectStore.list(params)),

  getById: (id: string) => {
    const item = keyProjectStore.getById(id);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  saveTarget: (id: string, payload: ImageProgressTargetPayload) => {
    const item = keyProjectStore.saveTarget(id, payload);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  saveMonthlyCompletion: (id: string, payload: MonthlyCompletionPayload) => {
    try {
      const item = keyProjectStore.saveMonthlyCompletion(id, payload);
      if (!item) return Promise.reject(new Error('项目不存在'));
      return mockDelay(item);
    } catch (err) {
      return Promise.reject(err instanceof Error ? err : new Error('保存失败'));
    }
  }
};

export type { KeyProjectItem };
