import { mockDelay } from '@/mock/delay';
import { workSuspendStore } from '@/mock/work-suspend-store';
import type {
  DailyStaffPayload,
  ResumeReportPayload,
  StopReportPayload,
  WorkSuspendQuery
} from '@/types/work-suspend';

export const workSuspendApi = {
  list: (params?: WorkSuspendQuery) => mockDelay(workSuspendStore.list(params)),

  getById: (id: string) => {
    const item = workSuspendStore.getById(id);
    if (!item) return Promise.reject(new Error('记录不存在'));
    return mockDelay(item);
  },

  reportStop: (id: string, payload: StopReportPayload) => {
    const item = workSuspendStore.reportStop(id, payload);
    if (!item) return Promise.reject(new Error('当前状态不可填报停工'));
    return mockDelay(item);
  },

  reportDailyStaff: (id: string, payload: DailyStaffPayload) => {
    const item = workSuspendStore.reportDailyStaff(id, payload);
    if (!item) return Promise.reject(new Error('当前状态不可填报在岗人数'));
    return mockDelay(item);
  },

  reportResume: (id: string, payload: ResumeReportPayload) => {
    const item = workSuspendStore.reportResume(id, payload);
    if (!item) return Promise.reject(new Error('当前状态不可填报复工'));
    return mockDelay(item);
  }
};
