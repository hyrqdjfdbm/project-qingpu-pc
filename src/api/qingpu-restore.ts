import { mockDelay } from '@/mock/delay';
import { getCurrentUser } from '@/mock/current-user';
import { qingpuRestoreStore } from '@/mock/qingpu-restore-store';
import type { QingpuRestoreAuditPayload, QingpuRestoreForm, QingpuRestoreQuery } from '@/types/qingpu-restore';

export const qingpuRestoreApi = {
  listPool: (params?: QingpuRestoreQuery) => mockDelay(qingpuRestoreStore.listPool(params)),

  listAuditTodos: (params?: QingpuRestoreQuery) => mockDelay(qingpuRestoreStore.listAuditTodos(params)),

  getPoolItem: (withdrawId: string) => {
    const item = qingpuRestoreStore.getPoolItem(withdrawId);
    if (!item) return Promise.reject(new Error('记录不存在'));
    return mockDelay(item);
  },

  create: (data: QingpuRestoreForm) => {
    try {
      const user = getCurrentUser();
      return mockDelay(
        qingpuRestoreStore.create(data, {
          applicant: user.name,
          applicantId: user.id,
          applicantUnit: user.unit
        })
      );
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  audit: (id: string, payload: QingpuRestoreAuditPayload) => {
    try {
      const user = getCurrentUser();
      const item = qingpuRestoreStore.audit(id, payload, user.name);
      if (!item) return Promise.reject(new Error('当前状态不可审核'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  revoke: (id: string, reason?: string) => {
    try {
      const item = qingpuRestoreStore.revoke(id, reason);
      if (!item) return Promise.reject(new Error('当前状态不可撤销'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  }
};
