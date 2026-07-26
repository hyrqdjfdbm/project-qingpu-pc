import { projectStore } from '@/mock/project-store';
import type {
  SupplementLibraryAuditPayload,
  SupplementLibraryForm,
  SupplementLibraryItem,
  SupplementLibraryQuery,
  SupplementLibraryStatus
} from '@/types/supplement-library';
import type { ConstructionNature, ProjectAttribute, ProjectCategory } from '@/types/supplement-pool';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function nowText(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function offsetDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return nowText(d);
}

function generateProjectCode() {
  const ts = Date.now().toString().slice(-8);
  return `QP-ZB-${ts}`;
}

function mapAttribute(v: string): ProjectAttribute {
  if (v.includes('国有')) return 'government';
  if (v.includes('民间')) return 'social';
  return 'other';
}

function mapCategory(v: string): ProjectCategory {
  if (v.includes('技术改造') || v.includes('工业')) return 'industry';
  if (v.includes('房屋') || v.includes('民用')) return 'real_estate';
  return 'other';
}

function mapNature(v: string): ConstructionNature {
  if (v === '续建') return 'expand';
  return 'new';
}

let idSeq = 10;

const records: SupplementLibraryItem[] = [
  {
    id: 'sl1',
    projectName: '青浦新城综合管廊配套工程增补项目',
    hasRelatedSubProjects: true,
    subProjectCodes: ['132164445310118M01'],
    projectCode: '',
    unitName: '上海青浦市政建设发展有限公司',
    unitLicenseNo: '91310118MA1J2K3L4X',
    contactName: '陈思远',
    contactPhone: '13817654321',
    leaderName: '周明轩',
    leaderPhone: '13917654321',
    territory: '夏阳街道',
    responsibleUnits: ['区建管委'],
    projectAttribute: '国有控股项目',
    projectCategory: '基本建设',
    approvalType: '备案',
    projectType: '城镇有机更新领域',
    projectSources: ['区重大项目'],
    projectPackage: '城市基础设施项目',
    filingCategory: '内资',
    filingDate: '2026-03-12',
    codingAuthority: '青浦区发展和改革委',
    codingDate: '2026-03-18',
    isCommitment: false,
    isComplementCode: false,
    nationalIndustry: '建筑业',
    constructionSite: '夏阳街道',
    constructionAddress: '夏阳街道新城核心区某某路',
    constructionNature: '新建',
    constructionScale: '新建综合管廊约 2.1 公里及配套设施',
    abovegroundArea: 0,
    totalBuildingArea: 12.5,
    newBuildingArea: 12.5,
    needConstructionPermit: true,
    totalInvestment: 26800,
    ownFunds: 8000,
    equipmentCost: 3200,
    fundSource: 26800,
    totalLandArea: 18.6,
    newConstructionLand: 6.2,
    includeNewLand: true,
    isStandardLand: false,
    ownLandCertNo: '沪(2024)青浦不动产权第001234号',
    status: 'pendingReview',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    supervisorId: 'u-supervisor-zhao',
    supervisorName: '赵文博',
    submittedAt: offsetDays(-2),
    createdAt: offsetDays(-2),
    updatedAt: offsetDays(-2)
  },
  {
    id: 'sl2',
    projectName: '华新镇先进制造产线智能化改造增补',
    hasRelatedSubProjects: false,
    subProjectCodes: [],
    unitName: '上海某某智能装备有限公司',
    unitLicenseNo: '91310118MA1J9K8M7N',
    contactName: '孙丽娜',
    contactPhone: '13701668899',
    leaderName: '高晨阳',
    leaderPhone: '13601668899',
    territory: '华新镇',
    responsibleUnits: ['区经信委'],
    projectAttribute: '民间固定资产投资项目',
    projectCategory: '技术改造',
    approvalType: '核准',
    projectType: '先进制造业基地领域',
    projectSources: ['市重大项目', '区重大项目'],
    projectPackage: '工业项目',
    filingDate: '2026-02-20',
    codingAuthority: '青浦区发展和改革委',
    isCommitment: true,
    nationalIndustry: '制造业',
    constructionSite: '华新镇',
    constructionAddress: '华新镇工业园区创新路66号',
    constructionNature: '续建',
    constructionScale: '智能化产线改造，新增设备 120 台套',
    abovegroundArea: 8600,
    totalBuildingArea: 32,
    newBuildingArea: 8,
    needConstructionPermit: true,
    totalInvestment: 18500,
    ownFunds: 9200,
    equipmentCost: 7600,
    fundSource: 18500,
    totalLandArea: 45,
    newConstructionLand: 0,
    includeNewLand: false,
    isStandardLand: true,
    isZeroLand: true,
    ownLandCertNo: '沪(2023)青浦不动产权第008877号',
    status: 'reviewing',
    applicant: '郭晓彤',
    applicantId: 'u-specialist-guo',
    applicantUnit: '区经信委',
    supervisorId: 'u-supervisor-zhao',
    supervisorName: '赵文博',
    submittedAt: offsetDays(-8),
    createdAt: offsetDays(-8),
    updatedAt: offsetDays(-3),
    firstAuditOpinion: '材料齐全，同意进入终审',
    firstAuditedAt: offsetDays(-3),
    firstAuditedBy: '赵文博'
  }
];

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function matchQuery(item: SupplementLibraryItem, params: SupplementLibraryQuery) {
  if (params.status && item.status !== params.status) return false;
  if (params.territory && item.territory !== params.territory) return false;
  if (params.responsibleUnit && !item.responsibleUnits.includes(params.responsibleUnit)) return false;
  if (params.applicantId && item.applicantId !== params.applicantId) return false;
  if (params.supervisorId && item.supervisorId !== params.supervisorId) return false;
  if (params.keyword) {
    const kw = params.keyword.trim();
    const abbr = (item as SupplementLibraryForm & { projectAbbr?: string }).projectAbbr || '';
    if (
      !item.projectName.includes(kw) &&
      !(item.projectCode || '').includes(kw) &&
      !abbr.includes(kw)
    ) {
      return false;
    }
  }
  return true;
}

function toImplementation(item: SupplementLibraryItem) {
  const code = item.projectCode?.trim() || generateProjectCode();
  const yiYuan = Math.round(((item.totalInvestment || 0) / 10000) * 100) / 100;
  const created = projectStore.create(
    {
      projectName: item.projectName,
      projectLocation: item.territory,
      totalInvestment: yiYuan,
      responsibleUnits: item.responsibleUnits,
      unitName: item.unitName,
      projectAttribute: mapAttribute(item.projectAttribute),
      projectCategory: mapCategory(item.projectPackage || item.projectCategory),
      constructionSite: item.constructionSite,
      constructionAddress: item.constructionAddress,
      constructionNature: mapNature(item.constructionNature),
      constructionScale: item.constructionScale,
      constructionProgress: item.projectProgress,
      proposedStartDate: item.proposedStartDate,
      proposedEndDate: item.proposedEndDate,
      needConstructionPermit: item.needConstructionPermit,
      landCertificateNo: item.ownLandCertNo,
      declaredBy: item.applicant,
      poolStage: 'implementation'
    },
    'implementation'
  );
  // 终审通过直接入库
  projectStore.audit(created.id, { approved: true, remark: '增补库终审通过自动入库' });
  // 覆盖自动生成的 code（若申报时已填）
  const stored = projectStore.getById(created.id);
  if (stored && item.projectCode?.trim()) {
    stored.projectCode = code;
  } else if (stored) {
    stored.projectCode = code;
  }
  return { projectId: created.id, projectCode: code };
}

export const supplementLibraryStore = {
  list(params: SupplementLibraryQuery = {}) {
    return records
      .filter((r) => matchQuery(r, params))
      .map(clone)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  listAuditTodos(
    status: Extract<SupplementLibraryStatus, 'pendingReview' | 'reviewing'>,
    params: Omit<SupplementLibraryQuery, 'status'> = {}
  ) {
    return this.list({ ...params, status });
  },

  getById(id: string) {
    const item = records.find((r) => r.id === id);
    return item ? clone(item) : null;
  },

  /** 校验项目代码是否已被占用（增补库 + 实施库） */
  isProjectCodeTaken(code: string, excludeId?: string) {
    const c = code.trim();
    if (!c) return false;
    if (records.some((r) => r.projectCode === c && r.id !== excludeId && r.status !== 'revoked')) {
      return true;
    }
    return projectStore.list({}).some((p) => p.projectCode === c);
  },

  create(
    data: SupplementLibraryForm,
    meta?: {
      applicant?: string;
      applicantId?: string;
      applicantUnit?: string;
      supervisorId?: string;
      supervisorName?: string;
    }
  ) {
    if (data.projectCode?.trim() && this.isProjectCodeTaken(data.projectCode)) {
      throw new Error('项目代码已存在，请核对后重新填写');
    }
    const now = nowText();
    const item: SupplementLibraryItem = {
      ...clone(data),
      id: `sl${++idSeq}`,
      status: 'pendingReview',
      applicant: meta?.applicant || '项目专员',
      applicantId: meta?.applicantId || 'u-specialist-lin',
      applicantUnit: meta?.applicantUnit || '责任单位',
      supervisorId: meta?.supervisorId || 'u-supervisor-zhao',
      supervisorName: meta?.supervisorName || '赵文博',
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };
    records.unshift(item);
    return clone(item);
  },

  update(id: string, data: SupplementLibraryForm) {
    const idx = records.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const cur = records[idx];
    if (cur.status !== 'pendingReview' && cur.status !== 'returned') return null;
    if (data.projectCode?.trim() && this.isProjectCodeTaken(data.projectCode, id)) {
      throw new Error('项目代码已存在，请核对后重新填写');
    }
    const now = nowText();
    records[idx] = {
      ...cur,
      ...clone(data),
      status: 'pendingReview',
      submittedAt: now,
      updatedAt: now,
      firstAuditOpinion: undefined,
      firstAuditedAt: undefined,
      firstAuditedBy: undefined,
      finalAuditOpinion: undefined,
      finalAuditedAt: undefined,
      finalAuditedBy: undefined
    };
    return clone(records[idx]);
  },

  revoke(id: string, reason?: string) {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    if (
      item.status !== 'pendingReview' &&
      item.status !== 'reviewing' &&
      item.status !== 'returned'
    ) {
      return null;
    }
    if (item.status !== 'pendingReview' && !reason?.trim()) {
      throw new Error('非待审核状态撤销须填写撤销原因');
    }
    item.status = 'revoked';
    item.revokeReason = reason?.trim() || undefined;
    item.updatedAt = nowText();
    return clone(item);
  },

  firstAudit(id: string, payload: SupplementLibraryAuditPayload, auditor = '分管领导') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'pendingReview') return null;
    const now = nowText();
    item.firstAuditOpinion = payload.opinion.trim();
    item.firstAuditedAt = now;
    item.firstAuditedBy = auditor;
    item.status = payload.approved ? 'reviewing' : 'returned';
    item.updatedAt = now;
    return clone(item);
  },

  finalAudit(id: string, payload: SupplementLibraryAuditPayload, auditor = '片区专员') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'reviewing') return null;
    const now = nowText();
    item.finalAuditOpinion = payload.opinion.trim();
    item.finalAuditedAt = now;
    item.finalAuditedBy = auditor;
    item.updatedAt = now;
    if (!payload.approved) {
      item.status = 'returned';
      return clone(item);
    }
    const { projectId, projectCode } = toImplementation(item);
    item.projectCode = projectCode;
    item.implementationProjectId = projectId;
    item.status = 'entered';
    return clone(item);
  }
};
