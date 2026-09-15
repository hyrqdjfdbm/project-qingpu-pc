import { mockDelay } from '@/mock/delay';
import { getCurrentUser } from '@/mock/current-user';
import { qingpuSupplementStore } from '@/mock/qingpu-supplement-store';
import type {
  QingpuAuditChannel,
  QingpuSupplementAuditPayload,
  QingpuSupplementForm,
  QingpuSupplementQuery
} from '@/types/qingpu-supplement';

export const qingpuSupplementApi = {
  list: (params?: QingpuSupplementQuery) => mockDelay(qingpuSupplementStore.list(params)),

  listAuditTodos: (params?: Omit<QingpuSupplementQuery, 'status'>) =>
    mockDelay(qingpuSupplementStore.listAuditTodos(params)),

  getById: (id: string) => {
    const item = qingpuSupplementStore.getById(id);
    if (!item) return Promise.reject(new Error('记录不存在'));
    return mockDelay(item);
  },

  isProjectNameTaken: (name: string, excludeId?: string) =>
    mockDelay(qingpuSupplementStore.isProjectNameTaken(name, excludeId)),

  create: (data: QingpuSupplementForm) => {
    try {
      const user = getCurrentUser();
      return mockDelay(
        qingpuSupplementStore.create(data, {
          applicant: user.name,
          applicantId: user.id,
          applicantUnit: user.unit
        })
      );
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  update: (id: string, data: QingpuSupplementForm) => {
    try {
      const item = qingpuSupplementStore.update(id, data);
      if (!item) return Promise.reject(new Error('当前状态不可修改'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  revoke: (id: string, reason?: string) => {
    try {
      const item = qingpuSupplementStore.revoke(id, reason);
      if (!item) return Promise.reject(new Error('当前状态不可撤销'));
      return mockDelay(item);
    } catch (e: any) {
      return Promise.reject(e);
    }
  },

  audit: (id: string, payload: QingpuSupplementAuditPayload) => {
    const user = getCurrentUser();
    const item = qingpuSupplementStore.audit(id, payload, user.name);
    if (!item) return Promise.reject(new Error('当前状态不可审核'));
    return mockDelay(item);
  },

  /** 便于审核页按通道过滤 */
  listAuditTodosByChannel: (channel?: QingpuAuditChannel, params?: QingpuSupplementQuery) =>
    mockDelay(qingpuSupplementStore.listAuditTodos({ ...params, auditChannel: channel }))
};
