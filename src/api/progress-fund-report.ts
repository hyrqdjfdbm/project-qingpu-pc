import { mockDelay } from '@/mock/delay';
import { progressFundReportStore } from '@/mock/progress-fund-report-store';
import type { SupplementProjectItem } from '@/types/supplement-pool';
import type {
  AuditPayload,
  ImageMonthlyPayload,
  ImageWeeklyPayload,
  ImageYearPayload,
  PendingAuditScope,
  ProgressFundQuery,
  SuperiorWeeklyPayload,
  SuperiorYearPayload
} from '@/types/progress-fund-report';

function wrap<T>(item: T | null) {
  if (!item) return Promise.reject(new Error('项目不存在'));
  return mockDelay(item);
}

export const progressFundReportApi = {
  list: (params?: ProgressFundQuery) => mockDelay(progressFundReportStore.list(params)),
  getById: (id: string) => wrap(progressFundReportStore.getById(id)),
  listOptions: () => mockDelay(progressFundReportStore.listOptions()),
  submitImageYear: (payload: ImageYearPayload) => wrap(progressFundReportStore.submitImageYear(payload)),
  submitImageMonthly: (payload: ImageMonthlyPayload) =>
    wrap(progressFundReportStore.submitImageMonthly(payload)),
  submitImageWeekly: (payload: ImageWeeklyPayload) =>
    wrap(progressFundReportStore.submitImageWeekly(payload)),
  submitSuperiorYear: (payload: SuperiorYearPayload) =>
    wrap(progressFundReportStore.submitSuperiorYear(payload)),
  submitSuperiorWeekly: (payload: SuperiorWeeklyPayload) =>
    wrap(progressFundReportStore.submitSuperiorWeekly(payload)),
  audit: (payload: AuditPayload) => wrap(progressFundReportStore.audit(payload)),
  ensureFromPool: (pool: SupplementProjectItem) =>
    mockDelay(progressFundReportStore.ensureFromPool(pool)),
  listPending: (scope?: PendingAuditScope) => mockDelay(progressFundReportStore.listPending(scope)),
  auditStats: (scope?: PendingAuditScope) => mockDelay(progressFundReportStore.auditStats(scope))
};
