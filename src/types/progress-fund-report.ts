import { getWeekInfo } from '@/types/image-progress-completion';

export type AuditStatus = 'none' | 'pending' | 'approved' | 'rejected';

export const AUDIT_STATUS_LABEL: Record<AuditStatus, string> = {
  none: '未填报',
  pending: '待审核',
  approved: '已通过',
  rejected: '已退回'
};

export const AUDIT_STATUS_COLOR: Record<AuditStatus, string> = {
  none: 'default',
  pending: 'processing',
  approved: 'success',
  rejected: 'error'
};

export type SuperiorPolicyKey = 'twoHeavy' | 'twoNew' | 'specialBond';

export const SUPERIOR_POLICY_LABEL: Record<SuperiorPolicyKey, string> = {
  twoHeavy: '两重',
  twoNew: '两新',
  specialBond: '专项债'
};

export const SUPERIOR_POLICY_KEYS: SuperiorPolicyKey[] = ['twoHeavy', 'twoNew', 'specialBond'];

export interface AuditMeta {
  status: AuditStatus;
  submittedBy?: string;
  submittedAt?: string;
  auditor?: string;
  auditedAt?: string;
  auditComment?: string;
}

export interface ImageYearTarget extends AuditMeta {
  year: number;
  fundTarget: number;
  imageProgressTarget: string;
  monthlyTargets: Array<{
    month: number;
    fundTarget?: number;
    imageProgressTarget?: string;
  }>;
}

export interface ImageMonthlyFund extends AuditMeta {
  id: string;
  year: number;
  month: number;
  completedAmount: number;
  cumulativeAmount: number;
  remark?: string;
}

export interface ImageWeeklyProgress extends AuditMeta {
  id: string;
  year: number;
  week: number;
  weekStart: string;
  weekEnd: string;
  content: string;
  progressPercent?: number;
}

export interface SuperiorYearTarget extends AuditMeta {
  year: number;
  annualTarget: number;
  monthlyTargets: Array<{ month: number; target?: number }>;
}

export interface SuperiorWeeklyFund extends AuditMeta {
  id: string;
  year: number;
  week: number;
  weekStart: string;
  weekEnd: string;
  completedAmount: number;
  cumulativeAmount: number;
  remark?: string;
}

export interface SuperiorPolicyPack {
  yearTarget?: SuperiorYearTarget;
  weeklyReports: SuperiorWeeklyFund[];
}

export interface ProgressFundProject {
  id: string;
  projectName: string;
  projectCode: string;
  responsibleUnit: string;
  constructionUnit: string;
  totalInvestment: number;
  currentStage: string;
  imageYearTarget?: ImageYearTarget;
  imageMonthlyFunds: ImageMonthlyFund[];
  imageWeeklyReports: ImageWeeklyProgress[];
  superior: Record<SuperiorPolicyKey, SuperiorPolicyPack>;
  updatedAt: string;
}

export interface ProgressFundQuery {
  keyword?: string;
  year?: number;
}

export interface ImageYearPayload {
  projectId: string;
  year: number;
  fundTarget: number;
  imageProgressTarget: string;
  monthlyTargets: ImageYearTarget['monthlyTargets'];
}

export interface ImageMonthlyPayload {
  projectId: string;
  year: number;
  month: number;
  completedAmount: number;
  cumulativeAmount: number;
  remark?: string;
}

export interface ImageWeeklyPayload {
  projectId: string;
  year: number;
  week: number;
  weekStart: string;
  weekEnd: string;
  content: string;
  progressPercent?: number;
}

export interface SuperiorYearPayload {
  projectId: string;
  policy: SuperiorPolicyKey;
  year: number;
  annualTarget: number;
  monthlyTargets: SuperiorYearTarget['monthlyTargets'];
}

export interface SuperiorWeeklyPayload {
  projectId: string;
  policy: SuperiorPolicyKey;
  year: number;
  week: number;
  weekStart: string;
  weekEnd: string;
  completedAmount: number;
  cumulativeAmount: number;
  remark?: string;
}

export type AuditKind =
  | 'imageYear'
  | 'imageMonthly'
  | 'imageWeekly'
  | 'superiorYear'
  | 'superiorWeekly';

export const AUDIT_KIND_LABEL: Record<AuditKind, string> = {
  imageYear: '形象进度年度目标',
  imageMonthly: '月度资金完成',
  imageWeekly: '周形象进度',
  superiorYear: '上级资金年度目标',
  superiorWeekly: '上级资金周完成'
};

export type PendingAuditScope = 'image' | 'superior';

export interface PendingAuditItem {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  responsibleUnit: string;
  kind: AuditKind;
  kindLabel: string;
  policy?: SuperiorPolicyKey;
  policyLabel?: string;
  year?: number;
  month?: number;
  week?: number;
  periodLabel: string;
  summary: string;
  submittedBy?: string;
  submittedAt?: string;
}

export interface ProgressFundAuditStats {
  pendingProjects: number;
  pendingRecords: number;
  todayAudited: number;
}

export interface AuditPayload {
  projectId: string;
  kind: AuditKind;
  passed: boolean;
  comment?: string;
  year?: number;
  month?: number;
  week?: number;
  policy?: SuperiorPolicyKey;
}

export { getWeekInfo };

export function emptyMonthlyFundTargets() {
  return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, fundTarget: undefined as number | undefined, imageProgressTarget: '' }));
}

export function emptySuperiorMonths() {
  return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, target: undefined as number | undefined }));
}

export function latestWeekly<T extends { year: number; week: number }>(list: T[], year: number) {
  return list.filter((r) => r.year === year).sort((a, b) => b.week - a.week)[0];
}

export function monthFund(list: ImageMonthlyFund[], year: number, month: number) {
  return list.find((r) => r.year === year && r.month === month);
}

export function cumulativeMonthLabel(year: number, month: number) {
  return month <= 1 ? `${year}年1月` : `${year}年1-${month}月`;
}

export function calcRate(completed?: number, target?: number) {
  if (completed == null || target == null || target === 0) return undefined;
  return Math.round((completed / target) * 1000) / 10;
}
