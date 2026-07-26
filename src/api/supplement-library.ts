import { mockDelay } from '@/mock/delay';
import { getCurrentUser } from '@/mock/current-user';
import { supplementLibraryStore } from '@/mock/supplement-library-store';
import type {
  SupplementLibraryAuditPayload,
  SupplementLibraryForm,
  SupplementLibraryQuery,
  SupplementLibraryStatus
} from '@/types/supplement-library';

export const supplementLibraryApi = {
  list: (params?: SupplementLibraryQuery) => mockDelay(supplementLibraryStore.list(params)),

  listAuditTodos: (
    status: Extract<SupplementLibraryStatus, 'pendingReview' | 'reviewing'>,
    params?: Omit<SupplementLibraryQuery, 'status'>
  ) => mockDelay(supplementLibraryStore.listAuditTodos(status, params)),

  getById: (id: string) => {
    const item = supplementLibraryStore.getById(id);
    if (!item) return Promise.reject(new Error('记录不存在'));
    return mockDelay(item);
  },

  create: (data: SupplementLibraryForm) => {
    try {
      const user = getCurrentUser();
      return mockDelay(
        supplementLibraryStore.create(data, {
          applicant: user.name,
          applicantId: user.id,
          applicantUnit: user.unit,
          supervisorId: 'u-supervisor-zhao',
          supervisorName: '赵文博'
        })
      );
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  update: (id: string, data: SupplementLibraryForm) => {
    try {
      const item = supplementLibraryStore.update(id, data);
      if (!item) return Promise.reject(new Error('当前状态不可修改'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  revoke: (id: string, reason?: string) => {
    try {
      const item = supplementLibraryStore.revoke(id, reason);
      if (!item) return Promise.reject(new Error('当前状态不可撤销'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  firstAudit: (id: string, payload: SupplementLibraryAuditPayload) => {
    const user = getCurrentUser();
    const item = supplementLibraryStore.firstAudit(id, payload, user.name);
    if (!item) return Promise.reject(new Error('当前状态不可初审'));
    return mockDelay(item);
  },

  finalAudit: (id: string, payload: SupplementLibraryAuditPayload) => {
    const user = getCurrentUser();
    const item = supplementLibraryStore.finalAudit(id, payload, user.name);
    if (!item) return Promise.reject(new Error('当前状态不可终审'));
    return mockDelay(item);
  }
};
