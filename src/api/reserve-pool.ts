import { mockDelay } from '@/mock/delay';
import { reservePoolStore } from '@/mock/reserve-pool-store';
import type {
  ReserveDeclarePayload,
  ReserveFinalAuditPayload,
  ReserveFirstAuditPayload,
  ReserveProgressPayload,
  ReserveQuery,
  ReserveRevokePayload
} from '@/types/reserve-pool';

export const reservePoolApi = {
  list: (params: ReserveQuery) => mockDelay(reservePoolStore.list(params)),

  getById: (id: string) => {
    const item = reservePoolStore.getById(id);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  create: (payload: ReserveDeclarePayload) => mockDelay(reservePoolStore.create(payload)),

  update: (id: string, payload: ReserveDeclarePayload) => {
    const item = reservePoolStore.update(id, payload);
    if (!item) return Promise.reject(new Error('当前状态不可编辑'));
    return mockDelay(item);
  },

  revoke: (id: string, payload: ReserveRevokePayload = {}) => {
    const item = reservePoolStore.revoke(id, payload.reason);
    if (!item) {
      return Promise.reject(new Error('当前状态不可撤销，或非待审核时未填写撤销原因'));
    }
    return mockDelay(item);
  },

  updateProgress: (id: string, payload: ReserveProgressPayload) => {
    const item = reservePoolStore.updateProgress(id, payload);
    if (!item) return Promise.reject(new Error('项目不存在'));
    return mockDelay(item);
  },

  firstAudit: (id: string, payload: ReserveFirstAuditPayload) => {
    const item = reservePoolStore.firstAudit(id, payload);
    if (!item) return Promise.reject(new Error('当前状态不可初审'));
    return mockDelay(item);
  },

  finalAudit: (id: string, payload: ReserveFinalAuditPayload) => {
    const item = reservePoolStore.finalAudit(id, payload);
    if (!item) return Promise.reject(new Error('当前状态不可终审'));
    return mockDelay(item);
  },

  listAuditTodos: (status: 'pendingReview' | 'reviewing') =>
    mockDelay(reservePoolStore.listAuditTodos(status))
};
