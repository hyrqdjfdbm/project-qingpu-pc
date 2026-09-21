import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_TERRITORY_OPTIONS,
  type QingpuAuditChannel
} from '@/types/qingpu-supplement';

export type QingpuWithdrawStatus = 'pendingReview' | 'withdrawn' | 'returned' | 'revoked';

export interface QingpuWithdrawForm {
  projectId: string;
  projectName: string;
  projectCode: string;
  projectAbbr?: string;
  totalInvestment: number | undefined;
  statisticalBelonging: string;
  responsibleUnits: string[];
  reason: string;
  hasReplacement: boolean;
  replacementProjectId?: string;
  replacementProjectName?: string;
  replacementProjectCode?: string;
}

export interface QingpuWithdrawItem extends QingpuWithdrawForm {
  id: string;
  status: QingpuWithdrawStatus;
  auditChannel: QingpuAuditChannel;
  applicant: string;
  applicantId: string;
  applicantUnit: string;
  supervisorId: string;
  supervisorName: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  auditOpinion?: string;
  auditedAt?: string;
  auditedBy?: string;
  revokeReason?: string;
  /** 已从退库项目库恢复至实施库（申请单仍记为已退库） */
  restoredAt?: string;
}

export interface QingpuWithdrawQuery {
  keyword?: string;
  statisticalBelonging?: string;
  responsibleUnit?: string;
  status?: QingpuWithdrawStatus;
  applicantId?: string;
  supervisorId?: string;
  auditChannel?: QingpuAuditChannel;
}

export interface QingpuWithdrawAuditPayload {
  approved: boolean;
  opinion: string;
}

export const QINGPU_WITHDRAW_STATUS_LABEL: Record<QingpuWithdrawStatus, string> = {
  pendingReview: '待审核',
  withdrawn: '已退库',
  returned: '退回',
  revoked: '已撤销'
};

export const QINGPU_WITHDRAW_STATUS_OPTIONS = (
  Object.keys(QINGPU_WITHDRAW_STATUS_LABEL) as QingpuWithdrawStatus[]
).map((value) => ({ value, label: QINGPU_WITHDRAW_STATUS_LABEL[value] }));

export function getQingpuWithdrawStatusColor(status: QingpuWithdrawStatus) {
  const map: Record<QingpuWithdrawStatus, string> = {
    pendingReview: 'processing',
    withdrawn: 'success',
    returned: 'error',
    revoked: 'default'
  };
  return map[status];
}

/** 纳统归属：与街镇/属地口径一致 */
export const QP_STATISTICAL_BELONGING_OPTIONS = QP_TERRITORY_OPTIONS;
export { QP_RESPONSIBLE_UNIT_OPTIONS };

export function createEmptyQingpuWithdrawForm(): QingpuWithdrawForm {
  return {
    projectId: '',
    projectName: '',
    projectCode: '',
    projectAbbr: undefined,
    totalInvestment: undefined,
    statisticalBelonging: '',
    responsibleUnits: [],
    reason: '',
    hasReplacement: false,
    replacementProjectId: undefined,
    replacementProjectName: undefined,
    replacementProjectCode: undefined
  };
}
