import { mockDelay } from '@/mock/delay';
import { imageProgressCompletionStore } from '@/mock/image-progress-completion-store';
import type {
  ImageProgressQuery,
  MonthlyFundPayload,
  MonthlyImagePayload,
  WeeklyImagePayload,
  YearTargetPayload
} from '@/types/image-progress-completion';

export const imageProgressCompletionApi = {
  list: (params?: ImageProgressQuery) =>
    mockDelay(imageProgressCompletionStore.list(params)),

  getById: (id: string, year?: number) => {
    const item = imageProgressCompletionStore.getById(id, year);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  listOptions: () => mockDelay(imageProgressCompletionStore.listOptions()),

  saveYearTarget: (payload: YearTargetPayload) => {
    const item = imageProgressCompletionStore.saveYearTarget(payload);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  saveMonthlyFund: (payload: MonthlyFundPayload) => {
    const item = imageProgressCompletionStore.saveMonthlyFund(payload);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  saveMonthlyImage: (payload: MonthlyImagePayload) => {
    const item = imageProgressCompletionStore.saveMonthlyImage(payload);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  saveWeeklyImage: (payload: WeeklyImagePayload) => {
    const item = imageProgressCompletionStore.saveWeeklyImage(payload);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  }
};
