/** 储备库模块 */
export type ReserveModule =
  | 'partySchool'
  | 'department'
  | 'township'
  | 'arena'
  | 'element';

export const RESERVE_MODULE_LABEL: Record<ReserveModule, string> = {
  partySchool: '党校集中谋划项目',
  department: '部门谋划项目',
  township: '乡镇（街道）谋划项目',
  arena: '比拼擂台赛项目',
  element: '要素争取项目'
};

/** 全局流程状态 */
export type ReserveFlowStatus =
  | 'draft'
  | 'pendingReview'
  | 'reviewing'
  | 'delisted'
  | 'returned'
  | 'revoked';

/** 列表/筛选展示的流程状态（不含草稿） */
export const RESERVE_FLOW_STATUS_LABEL: Record<ReserveFlowStatus, string> = {
  draft: '草稿',
  pendingReview: '待审核',
  reviewing: '审核中',
  delisted: '已入库',
  returned: '退回',
  revoked: '已撤销'
};

/** 业务筛选用状态 */
export const RESERVE_FLOW_FILTER_OPTIONS = (
  ['pendingReview', 'reviewing', 'delisted', 'returned', 'revoked'] as ReserveFlowStatus[]
).map((value) => ({ value, label: RESERVE_FLOW_STATUS_LABEL[value] }));

export function getReserveStatusColor(status: ReserveFlowStatus) {
  const map: Record<ReserveFlowStatus, string> = {
    draft: 'default',
    pendingReview: 'processing',
    reviewing: 'warning',
    delisted: 'success',
    returned: 'error',
    revoked: 'default'
  };
  return map[status];
}

/** 可撤销的状态（仅待审核） */
export function canRevokeReserve(status: ReserveFlowStatus) {
  return status === 'pendingReview';
}

/** 撤销时是否必须填写原因（当前仅待审核可撤，无需原因） */
export function revokeReasonRequired(status: ReserveFlowStatus) {
  return false;
}

/** 领域（与实施库项目类型一致） */
export type ReserveDomain = 'real_estate' | 'industry' | 'other';

export const RESERVE_DOMAIN_LABEL: Record<ReserveDomain, string> = {
  real_estate: '房地产',
  industry: '工业',
  other: '其他'
};

export const RESERVE_DOMAIN_OPTIONS = Object.entries(RESERVE_DOMAIN_LABEL).map(
  ([value, label]) => ({ value, label })
);

/** 项目投资类型（党校） */
export type InvestType =
  | 'gov'
  | 'private'
  | 'soe'
  | 'soeSocial'
  | 'soePrivate'
  | 'other';

export const INVEST_TYPE_LABEL: Record<InvestType, string> = {
  gov: '政府投资',
  private: '民间投资',
  soe: '国企投资',
  soeSocial: '国企+社会资本',
  soePrivate: '国企投资+民营投资',
  other: '其他'
};

export const INVEST_TYPE_OPTIONS = Object.entries(INVEST_TYPE_LABEL).map(([value, label]) => ({
  value,
  label
}));

/** 部门谋划项目类别 */
export type DeptProjectCategory =
  | 'industry'
  | 'safety'
  | 'lowAltitude'
  | 'commonWealth'
  | 'commonWealthLead'
  | 'traffic'
  | 'techPlatform'
  | 'energy'
  | 'training'
  | 'areaDev'
  | 'ai'
  | 'water'
  | 'railway'
  | 'xingzhi'
  | 'silver'
  | 'other';

export const DEPT_CATEGORY_LABEL: Record<DeptProjectCategory, string> = {
  industry: '产业类',
  safety: '大安全体系类',
  lowAltitude: '低空经济类',
  commonWealth: '共富产业类',
  commonWealthLead: '共富牵引类',
  traffic: '交通提升类',
  techPlatform: '科创平台类',
  energy: '能源保障类',
  training: '培训教育类',
  areaDev: '片区开发类',
  ai: '人工智能类',
  water: '水系提升类',
  railway: '铁路延伸类',
  xingzhi: '行知教育体系类',
  silver: '银发经济类',
  other: '其他'
};

export const DEPT_CATEGORY_OPTIONS = Object.entries(DEPT_CATEGORY_LABEL).map(([value, label]) => ({
  value,
  label
}));

/** 政策类别（要素） */
export type PolicyCategory =
  | 'centralBudget'
  | 'twoHeavy'
  | 'twoNew'
  | 'specialBond'
  | 'financeTool'
  | 'other';

export const POLICY_CATEGORY_LABEL: Record<PolicyCategory, string> = {
  centralBudget: '中央预算内投资',
  twoHeavy: '两重',
  twoNew: '两新',
  specialBond: '专项债',
  financeTool: '金融工具',
  other: '其他'
};

export const POLICY_CATEGORY_OPTIONS = Object.entries(POLICY_CATEGORY_LABEL).map(
  ([value, label]) => ({ value, label })
);

/** 六网类型 */
export type SixNetType =
  | 'water'
  | 'power'
  | 'compute'
  | 'comm'
  | 'underground'
  | 'logistics';

export const SIX_NET_LABEL: Record<SixNetType, string> = {
  water: '水网',
  power: '新型电网',
  compute: '算力网',
  comm: '新一代通信网',
  underground: '城市地下管网',
  logistics: '物流网'
};

export const SIX_NET_OPTIONS = Object.entries(SIX_NET_LABEL).map(([value, label]) => ({
  value,
  label
}));

export interface ReserveAttachment {
  name: string;
  size: number;
  url?: string;
}

export interface ReserveAuditRecord {
  stage: 'first' | 'final';
  result: 'pass' | 'reject';
  opinion: string;
  auditor: string;
  auditedAt: string;
}

export interface ReserveProgressRecord {
  id: string;
  currentProgress: string;
  nextPlan: string;
  reportedAt: string;
  reportedBy: string;
}

/** 党校集中谋划 */
export interface PartySchoolFields {
  leadUnit: string;
  responsibleUnit: string;
  domain: ReserveDomain;
  projectName: string;
  location: string;
  landStatus: string;
  fundMix: string;
  operationMode: string;
  constructionScale: string;
  startYear: number;
  endYear: number;
  totalInvestment: number;
  planInvest2027: number;
  plannedStartDate: string;
  investType: InvestType;
  investTypeOther?: string;
  remark?: string;
}

/** 部门谋划 */
export interface DepartmentFields {
  responsibleUnit: string;
  projectCategory: DeptProjectCategory;
  projectCategoryOther?: string;
  projectName: string;
  projectContent: string;
  plannedStartDate: string;
  totalInvestment: number;
  planInvest2027: number;
  remark?: string;
}

/** 乡镇（街道）谋划 */
export interface TownshipFields {
  responsibleUnit: string;
  projectName: string;
  constructionContent: string;
  totalInvestment: number;
  planInvest2027: number;
  plannedStartDate: string;
  fundMix: string;
  operationMode: string;
  landStatus: string;
  remark?: string;
}

/** 比拼擂台赛 */
export interface ArenaFields {
  responsibleUnit: string;
  projectName: string;
  constructionContent: string;
  totalInvestment: number;
  planInvest2026: number;
  plannedStartDate: string;
  hasStarted: boolean;
  actualStartDate?: string;
  remark?: string;
}

/** 要素争取 */
export interface ElementFields {
  responsibleUnit: string;
  projectName: string;
  constructionContent: string;
  totalInvestment: number;
  policyCategory: PolicyCategory;
  policyCategoryOther?: string;
  isSixNet: boolean;
  sixNetTypes: SixNetType[];
  elementFund: number;
  remark?: string;
}

export interface ReserveProjectItem {
  id: string;
  module: ReserveModule;
  status: ReserveFlowStatus;
  applicant: string;
  applicantUnit: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  attachments: ReserveAttachment[];
  auditRecords: ReserveAuditRecord[];
  progressReports: ReserveProgressRecord[];
  /** 撤销原因（非待审核撤销时必填） */
  revokeReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  partySchool?: PartySchoolFields;
  department?: DepartmentFields;
  township?: TownshipFields;
  arena?: ArenaFields;
  element?: ElementFields;
}

export function getReserveProjectName(item: ReserveProjectItem) {
  return (
    item.partySchool?.projectName ||
    item.department?.projectName ||
    item.township?.projectName ||
    item.arena?.projectName ||
    item.element?.projectName ||
    '—'
  );
}

export function getReserveResponsibleUnit(item: ReserveProjectItem) {
  return (
    item.partySchool?.responsibleUnit ||
    item.department?.responsibleUnit ||
    item.township?.responsibleUnit ||
    item.arena?.responsibleUnit ||
    item.element?.responsibleUnit ||
    item.applicantUnit
  );
}

export function getReserveTotalInvestment(item: ReserveProjectItem) {
  return (
    item.partySchool?.totalInvestment ??
    item.department?.totalInvestment ??
    item.township?.totalInvestment ??
    item.arena?.totalInvestment ??
    item.element?.totalInvestment ??
    0
  );
}

export function getLatestProgress(item: ReserveProjectItem): ReserveProgressRecord | undefined {
  return item.progressReports?.[0];
}

export interface ReserveQuery {
  module: ReserveModule;
  projectName?: string;
  responsibleUnit?: string;
  status?: ReserveFlowStatus;
  domain?: ReserveDomain;
  projectCategory?: DeptProjectCategory;
  policyCategory?: PolicyCategory;
  isSixNet?: boolean;
  hasStarted?: boolean;
  leadUnit?: string;
}

export interface ReserveDeclarePayload {
  module: ReserveModule;
  asDraft?: boolean;
  attachments?: ReserveAttachment[];
  partySchool?: PartySchoolFields;
  department?: DepartmentFields;
  township?: TownshipFields;
  arena?: ArenaFields;
  element?: ElementFields;
}

export interface ReserveFirstAuditPayload {
  approved: boolean;
  opinion: string;
}

export interface ReserveFinalAuditPayload {
  approved: boolean;
  opinion: string;
}

export interface ReserveProgressPayload {
  currentProgress: string;
  nextPlan: string;
}

export interface ReserveRevokePayload {
  reason?: string;
}

/** 牵头单位 / 责任单位（与实施库一致） */
export { RESPONSIBLE_UNIT_OPTIONS as RESERVE_UNIT_OPTIONS } from '@/types/supplement-pool';
