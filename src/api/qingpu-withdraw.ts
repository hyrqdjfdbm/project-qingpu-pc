import { mockDelay } from '@/mock/delay';
import { getCurrentUser } from '@/mock/current-user';
import { qingpuWithdrawStore } from '@/mock/qingpu-withdraw-store';
import type { QingpuWithdrawAuditPayload, QingpuWithdrawForm, QingpuWithdrawQuery } from '@/types/qingpu-withdraw';

export const qingpuWithdrawApi = {
  list: (params?: QingpuWithdrawQuery) => mockDelay(qingpuWithdrawStore.list(params)),

  listAuditTodos: (params?: Omit<QingpuWithdrawQuery, 'status'>) =>
    mockDelay(qingpuWithdrawStore.listAuditTodos(params)),

  getById: (id: string) => {
    const item = qingpuWithdrawStore.getById(id);
    if (!item) return Promise.reject(new Error('记录不存在'));
    return mockDelay(item);
  },

  create: (data: QingpuWithdrawForm) => {
    try {
      const user = getCurrentUser();
      return mockDelay(
        qingpuWithdrawStore.create(data, {
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

  update: (id: string, data: QingpuWithdrawForm) => {
    try {
      const item = qingpuWithdrawStore.update(id, data);
      if (!item) return Promise.reject(new Error('当前状态不可修改'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  revoke: (id: string, reason?: string) => {
    try {
      const item = qingpuWithdrawStore.revoke(id, reason);
      if (!item) return Promise.reject(new Error('当前状态不可撤销'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  audit: (id: string, payload: QingpuWithdrawAuditPayload) => {
    const user = getCurrentUser();
    const item = qingpuWithdrawStore.audit(id, payload, user.name);
    if (!item) return Promise.reject(new Error('当前状态不可审核'));
    return mockDelay(item);
  },

  restore: (id: string) => {
    try {
      const item = qingpuWithdrawStore.restore(id);
      if (!item) return Promise.reject(new Error('当前状态不可恢复'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  }
};
