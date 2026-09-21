import type { QingpuAuditChannel } from '@/types/qingpu-supplement';
import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_STATISTICAL_BELONGING_OPTIONS
} from '@/types/qingpu-withdraw';

export type QingpuRestoreStatus = 'pendingReview' | 'returned' | 'restored' | 'revoked';

export interface QingpuRestoreForm {
  withdrawId: string;
  restoreReason: string;
}

export interface QingpuRestoreItem {
  id: string;
  withdrawId: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  projectAbbr?: string;
  totalInvestment?: number;
  statisticalBelonging: string;
  responsibleUnits: string[];
  withdrawReason: string;
  restoreReason: string;
  status: QingpuRestoreStatus;
  auditChannel: QingpuAuditChannel;
  applicant: string;
  applicantId: string;
  applicantUnit: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  auditOpinion?: string;
  auditedAt?: string;
  auditedBy?: string;
  revokeReason?: string;
}

export interface QingpuWithdrawnProject {
  withdrawId: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  projectAbbr?: string;
  totalInvestment?: number;
  statisticalBelonging: string;
  responsibleUnits: string[];
  withdrawReason: string;
  withdrawnAt: string;
  withdrawApplicant: string;
  withdrawApplicantUnit: string;
  auditChannel: QingpuAuditChannel;
  restore: QingpuRestoreItem | null;
}

export interface QingpuRestoreQuery {
  keyword?: string;
  statisticalBelonging?: string;
  responsibleUnit?: string;
  restoreStatus?: QingpuRestoreStatus | 'none';
  auditChannel?: QingpuAuditChannel;
}

export interface QingpuRestoreAuditPayload {
  approved: boolean;
  opinion: string;
}

export const QINGPU_RESTORE_STATUS_LABEL: Record<QingpuRestoreStatus, string> = {
  pendingReview: '待审核',
  returned: '退回',
  restored: '已恢复',
  revoked: '已撤销'
};

export const QINGPU_RESTORE_STATUS_OPTIONS = (
  Object.keys(QINGPU_RESTORE_STATUS_LABEL) as QingpuRestoreStatus[]
).map((value) => ({ value, label: QINGPU_RESTORE_STATUS_LABEL[value] }));

export const QINGPU_POOL_RESTORE_FILTER_OPTIONS = [
  { value: 'none', label: '未申请' },
  { value: 'pendingReview', label: '待审核' },
  { value: 'returned', label: '退回' }
];

export function getQingpuRestoreStatusColor(status: QingpuRestoreStatus) {
  const map: Record<QingpuRestoreStatus, string> = {
    pendingReview: 'processing',
    returned: 'error',
    restored: 'success',
    revoked: 'default'
  };
  return map[status];
}

export { QP_RESPONSIBLE_UNIT_OPTIONS, QP_STATISTICAL_BELONGING_OPTIONS };
