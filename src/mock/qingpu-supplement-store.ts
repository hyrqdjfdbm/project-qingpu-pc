import { projectStore } from '@/mock/project-store';
import type { ConstructionNature, ProjectAttribute, ProjectCategory } from '@/types/supplement-pool';
import {
  getQingpuAuditChannel,
  type QingpuSupplementAuditPayload,
  type QingpuSupplementForm,
  type QingpuSupplementItem,
  type QingpuSupplementQuery,
  type QingpuSupplementStatus
} from '@/types/qingpu-supplement';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function nowText(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function offsetDays(days: number, hours = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return nowText(d);
}

function generateProjectCode() {
  const ts = Date.now().toString().slice(-8);
  return `QP-ZB-${ts}`;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function mapAttribute(v: string): ProjectAttribute {
  if (v.includes('国有')) return 'government';
  if (v.includes('民间')) return 'social';
  return 'other';
}

function mapCategory(v: string): ProjectCategory {
  if (v.includes('工业') || v.includes('研发')) return 'industry';
  if (v.includes('房地产') || v.includes('房建')) return 'real_estate';
  return 'other';
}

function mapNature(v: string): ConstructionNature {
  if (v === '续建') return 'expand';
  return 'new';
}

let idSeq = 20;

function makeItem(
  partial: Partial<QingpuSupplementItem> &
    Pick<
      QingpuSupplementItem,
      | 'id'
      | 'projectName'
      | 'projectCategory'
      | 'territory'
      | 'responsibleUnits'
      | 'status'
      | 'applicant'
      | 'applicantId'
      | 'applicantUnit'
      | 'submittedAt'
    >
): QingpuSupplementItem {
  const formDefaults: QingpuSupplementForm = {
    projectName: partial.projectName,
    projectLevel: partial.projectLevel || '主项目',
    hasRelatedSubProjects: partial.hasRelatedSubProjects ?? false,
    subProjectCodes: partial.subProjectCodes || [],
    relatedParentProjectCode: partial.relatedParentProjectCode,
    unitName: partial.unitName || partial.applicantUnit,
    projectStatus: partial.projectStatus || '在建',
    territory: partial.territory,
    responsibleUnits: partial.responsibleUnits,
    agencyUnit: partial.agencyUnit || '',
    projectAttribute: partial.projectAttribute || '民间固定资产投资项目',
    projectCategory: partial.projectCategory,
    constructionSite: partial.constructionSite || partial.territory,
    constructionAddress: partial.constructionAddress || `${partial.territory}建设路88号`,
    constructionNature: partial.constructionNature || '新建',
    constructionScale: partial.constructionScale || '按批复规模实施',
    projectProgress: partial.projectProgress,
    proposedStartDate: partial.proposedStartDate,
    proposedEndDate: partial.proposedEndDate,
    needConstructionPermit: partial.needConstructionPermit || '是',
    totalInvestment: partial.totalInvestment ?? 12000,
    ownLandCertNo: partial.ownLandCertNo || '',
    imageScheme: partial.imageScheme,
    proposalDoc: partial.proposalDoc
  };
  return {
    ...formDefaults,
    id: partial.id,
    projectCode: partial.projectCode || `QP-ZB-${partial.id.replace('qs', '0')}`,
    status: partial.status,
    auditChannel: getQingpuAuditChannel(partial.projectCategory),
    applicant: partial.applicant,
    applicantId: partial.applicantId,
    applicantUnit: partial.applicantUnit,
    submittedAt: partial.submittedAt,
    createdAt: partial.createdAt || partial.submittedAt,
    updatedAt: partial.updatedAt || partial.submittedAt,
    auditOpinion: partial.auditOpinion,
    auditedAt: partial.auditedAt,
    auditedBy: partial.auditedBy,
    implementationProjectId: partial.implementationProjectId,
    revokeReason: partial.revokeReason
  };
}

const records: QingpuSupplementItem[] = [
  makeItem({
    id: 'qs1',
    projectName: '朱家角水乡客厅商业配套设施项目',
    projectCategory: '社会投资项目-商贸业',
    territory: '朱家角镇',
    responsibleUnits: ['区商务委', '朱家角镇'],
    unitName: '上海青浦文旅发展有限公司',
    totalInvestment: 18600,
    constructionScale: '新建商业配套约 2.4 万平方米',
    projectProgress: '方案深化中',
    proposedStartDate: offsetDays(40).slice(0, 10),
    proposedEndDate: offsetDays(400).slice(0, 10),
    ownLandCertNo: '沪(2025)青浦不动产权第002188号',
    agencyUnit: '青发集团',
    imageScheme: { completeDate: offsetDays(-20).slice(0, 10), content: '形象方案已通过街镇联审' },
    status: 'pendingReview',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-1, -3)
  }),
  makeItem({
    id: 'qs2',
    projectName: '徐泾镇产业社区标准厂房项目',
    projectCategory: '社会投资项目-工业',
    territory: '徐泾镇',
    responsibleUnits: ['区经委', '徐泾镇'],
    unitName: '上海徐泾产业发展有限公司',
    totalInvestment: 32400,
    constructionNature: '新建',
    constructionScale: '新建标准厂房 4.8 万平方米',
    agencyUnit: '新城公司',
    imageScheme: { completeDate: offsetDays(-12).slice(0, 10), content: '形象方案已形成，拟近期报审' },
    status: 'pendingReview',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-2)
  }),
  makeItem({
    id: 'qs3',
    projectName: '夏阳街道市政道路改造工程',
    projectCategory: '政府投资-政府工程',
    projectAttribute: '国有控股项目',
    territory: '区属',
    responsibleUnits: ['区建管委', '夏阳街道'],
    unitName: '青浦区建设和管理委员会',
    totalInvestment: 9800,
    constructionScale: '改造道路约 1.6 公里及配套管线',
    agencyUnit: '新城公司',
    proposalDoc: { completeDate: offsetDays(-30).slice(0, 10), content: '项建书已批复，正在开展工可' },
    status: 'pendingReview',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-3, 2)
  }),
  makeItem({
    id: 'qs4',
    projectName: '金泽镇污水管网延伸工程',
    projectCategory: '政府投资-其他工程',
    projectAttribute: '国有控股项目',
    territory: '金泽镇',
    responsibleUnits: ['区建管委', '金泽镇'],
    unitName: '青浦区水务局',
    totalInvestment: 6420,
    constructionScale: '新建污水管网 8.2 公里',
    agencyUnit: '新城公司',
    proposalDoc: { completeDate: offsetDays(-18).slice(0, 10), content: '项建书已完成区发改备案' },
    status: 'pendingReview',
    applicant: '郭晓彤',
    applicantId: 'u-specialist-guo',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-4)
  }),
  makeItem({
    id: 'qs5',
    projectName: '华新镇先进材料研发中试基地',
    projectCategory: '社会投资项目-研发',
    territory: '华新镇',
    responsibleUnits: ['区科委', '华新镇'],
    unitName: '上海华新科创园发展有限公司',
    totalInvestment: 21500,
    constructionScale: '新建中试厂房及研发楼 1.8 万平方米',
    agencyUnit: '工业园区',
    imageScheme: { completeDate: offsetDays(-40).slice(0, 10), content: '形象方案已通过园区联审' },
    status: 'entered',
    applicant: '孙丽娜',
    applicantId: 'u-specialist-sun',
    applicantUnit: '区科委',
    submittedAt: offsetDays(-28),
    auditedAt: offsetDays(-21),
    auditedBy: '沈若兰',
    auditOpinion: '材料齐全，同意纳入实施库',
    implementationProjectId: 'seed-qs5'
  }),
  makeItem({
    id: 'qs6',
    projectName: '赵巷镇安置房市政配套工程',
    projectCategory: '政府投资-政府工程',
    projectAttribute: '国有控股项目',
    territory: '赵巷镇',
    responsibleUnits: ['区建管委', '赵巷镇'],
    unitName: '青浦新城发展有限公司',
    agencyUnit: '新城公司',
    totalInvestment: 15600,
    proposalDoc: { completeDate: offsetDays(-50).slice(0, 10), content: '项建书已批复' },
    status: 'entered',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-35),
    auditedAt: offsetDays(-27),
    auditedBy: '郑昊然',
    auditOpinion: '同意入库',
    implementationProjectId: 'seed-qs6'
  }),
  makeItem({
    id: 'qs7',
    projectName: '练塘镇商贸物流园一期',
    projectCategory: '社会投资项目-商贸业',
    territory: '练塘镇',
    responsibleUnits: ['区商务委', '练塘镇'],
    unitName: '上海练塘商贸物流有限公司',
    totalInvestment: 27800,
    agencyUnit: '青发集团',
    imageScheme: { completeDate: offsetDays(-45).slice(0, 10), content: '形象方案已通过街镇审核' },
    status: 'entered',
    applicant: '周佳宁',
    applicantId: 'u-specialist-zhou',
    applicantUnit: '区商务委',
    submittedAt: offsetDays(-40),
    auditedAt: offsetDays(-32),
    auditedBy: '沈若兰',
    auditOpinion: '准予纳入实施库',
    implementationProjectId: 'seed-qs7'
  }),
  makeItem({
    id: 'qs8',
    projectName: '白鹤镇精密制造技改项目',
    projectCategory: '社会投资项目-工业',
    territory: '白鹤镇',
    responsibleUnits: ['区经委', '白鹤镇'],
    unitName: '上海白鹤精密制造有限公司',
    totalInvestment: 8900,
    constructionNature: '续建',
    agencyUnit: '工业园区',
    imageScheme: { completeDate: offsetDays(-8).slice(0, 10), content: '形象方案待补充总图' },
    status: 'returned',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-9),
    auditedAt: offsetDays(-5),
    auditedBy: '沈若兰',
    auditOpinion: '建设规模及用地手续材料不齐，请补充后重报'
  }),
  makeItem({
    id: 'qs9',
    projectName: '香花桥街道九年一贯制学校改扩建',
    projectCategory: '政府投资-政府工程',
    projectAttribute: '国有控股项目',
    territory: '区属',
    responsibleUnits: ['区教育局', '香花桥街道'],
    unitName: '青浦区教育局',
    totalInvestment: 41200,
    agencyUnit: '新城公司',
    proposalDoc: { completeDate: offsetDays(-15).slice(0, 10), content: '项建书征求意见稿' },
    status: 'returned',
    applicant: '高晨阳',
    applicantId: 'u-specialist-gao',
    applicantUnit: '区教育局',
    submittedAt: offsetDays(-12),
    auditedAt: offsetDays(-6),
    auditedBy: '郑昊然',
    auditOpinion: '项建书尚未取得正式批复，退回后补齐再报'
  }),
  makeItem({
    id: 'qs10',
    projectName: '重固镇冷链仓储设施项目',
    projectCategory: '社会投资项目-其他',
    territory: '重固镇',
    responsibleUnits: ['区商务委', '重固镇'],
    unitName: '上海重固冷链物流有限公司',
    totalInvestment: 13400,
    agencyUnit: '青发集团',
    imageScheme: { completeDate: offsetDays(-22).slice(0, 10), content: '形象方案初稿' },
    status: 'revoked',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-16),
    revokeReason: '业主调整建设时序，暂缓申报'
  }),
  makeItem({
    id: 'qs11',
    projectName: '盈浦街道口袋公园提升工程',
    projectCategory: '政府投资-其他工程',
    projectAttribute: '国有控股项目',
    territory: '区属',
    responsibleUnits: ['区绿容局', '盈浦街道'],
    unitName: '青浦区绿容局',
    totalInvestment: 2860,
    needConstructionPermit: '否',
    agencyUnit: '新城公司',
    proposalDoc: { completeDate: offsetDays(-10).slice(0, 10), content: '项建书已内部会签' },
    status: 'revoked',
    applicant: '罗雅婷',
    applicantId: 'u-specialist-luo',
    applicantUnit: '区绿容局',
    submittedAt: offsetDays(-11)
  }),
  makeItem({
    id: 'qs12',
    projectName: '工业园区智能装备标准厂房三期',
    projectCategory: '社会投资项目-工业',
    territory: '工业园区',
    responsibleUnits: ['区经委', '工业园区'],
    agencyUnit: '工业园区',
    unitName: '上海西虹桥智能产业园发展有限公司',
    totalInvestment: 46800,
    constructionScale: '新建标准厂房 6.2 万平方米',
    hasRelatedSubProjects: true,
    subProjectCodes: ['132164445310118M02'],
    imageScheme: { completeDate: offsetDays(-7).slice(0, 10), content: '形象方案已通过园区规划审查' },
    status: 'pendingReview',
    applicant: '马文博',
    applicantId: 'u-specialist-ma',
    applicantUnit: '工业园区',
    submittedAt: offsetDays(0, -5)
  })
];

function matchQuery(item: QingpuSupplementItem, params: QingpuSupplementQuery) {
  if (params.status && item.status !== params.status) return false;
  if (params.territory && item.territory !== params.territory) return false;
  if (params.responsibleUnit && !item.responsibleUnits.includes(params.responsibleUnit)) return false;
  if (params.applicantId && item.applicantId !== params.applicantId) return false;
  if (params.auditChannel && item.auditChannel !== params.auditChannel) return false;
  if (params.keyword) {
    const kw = params.keyword.trim();
    if (!item.projectName.includes(kw) && !item.projectCode.includes(kw)) {
      return false;
    }
  }
  return true;
}

function toImplementation(item: QingpuSupplementItem) {
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
      projectCategory: mapCategory(item.projectCategory),
      constructionSite: item.constructionSite,
      constructionAddress: item.constructionAddress,
      constructionNature: mapNature(item.constructionNature),
      constructionScale: item.constructionScale,
      constructionProgress: item.projectProgress,
      proposedStartDate: item.proposedStartDate,
      proposedEndDate: item.proposedEndDate,
      needConstructionPermit: item.needConstructionPermit === '是',
      landCertificateNo: item.ownLandCertNo,
      subProjects: item.subProjectCodes,
      schemeCompleteDate: item.imageScheme?.completeDate,
      proposalApprovalDate: item.proposalDoc?.completeDate,
      declaredBy: item.applicant,
      poolStage: 'implementation'
    },
    'implementation'
  );
  projectStore.audit(created.id, { approved: true, remark: '青浦增补库审核通过自动入库' });
  const stored = projectStore.getById(created.id);
  if (stored) stored.projectCode = code;
  return { projectId: created.id, projectCode: code };
}

export const qingpuSupplementStore = {
  list(params: QingpuSupplementQuery = {}) {
    return records
      .filter((r) => matchQuery(r, params))
      .map(clone)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  listAuditTodos(params: QingpuSupplementQuery = {}) {
    return this.list({ ...params, status: 'pendingReview' });
  },

  getById(id: string) {
    const item = records.find((r) => r.id === id);
    return item ? clone(item) : null;
  },

  isProjectNameTaken(name: string, excludeId?: string) {
    const n = name.trim();
    if (!n) return false;
    if (
      records.some(
        (r) => r.projectName.trim() === n && r.id !== excludeId && r.status !== 'revoked'
      )
    ) {
      return true;
    }
    return projectStore.list({}).some((p) => p.projectName.trim() === n);
  },

  create(
    data: QingpuSupplementForm,
    meta?: { applicant?: string; applicantId?: string; applicantUnit?: string }
  ) {
    if (this.isProjectNameTaken(data.projectName)) {
      throw new Error('项目名称已存在，请核对后重新填写');
    }
    const now = nowText();
    const item: QingpuSupplementItem = {
      ...clone(data),
      id: `qs${++idSeq}`,
      projectCode: generateProjectCode(),
      status: 'pendingReview',
      auditChannel: getQingpuAuditChannel(data.projectCategory),
      applicant: meta?.applicant || '项目专员',
      applicantId: meta?.applicantId || 'u-specialist-lin',
      applicantUnit: meta?.applicantUnit || '责任单位',
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };
    records.unshift(item);
    return clone(item);
  },

  update(id: string, data: QingpuSupplementForm) {
    const idx = records.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const cur = records[idx];
    if (cur.status !== 'pendingReview' && cur.status !== 'returned') return null;
    if (this.isProjectNameTaken(data.projectName, id)) {
      throw new Error('项目名称已存在，请核对后重新填写');
    }
    const now = nowText();
    records[idx] = {
      ...cur,
      ...clone(data),
      status: 'pendingReview',
      auditChannel: getQingpuAuditChannel(data.projectCategory),
      submittedAt: now,
      updatedAt: now,
      auditOpinion: undefined,
      auditedAt: undefined,
      auditedBy: undefined
    };
    return clone(records[idx]);
  },

  revoke(id: string, reason?: string) {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    if (item.status !== 'pendingReview' && item.status !== 'returned') return null;
    if (item.status !== 'pendingReview' && !reason?.trim()) {
      throw new Error('非待审核状态撤销须填写撤销原因');
    }
    item.status = 'revoked';
    item.revokeReason = reason?.trim() || undefined;
    item.updatedAt = nowText();
    return clone(item);
  },

  audit(id: string, payload: QingpuSupplementAuditPayload, auditor = '审核专员') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'pendingReview') return null;
    const now = nowText();
    item.auditOpinion = payload.opinion.trim();
    item.auditedAt = now;
    item.auditedBy = auditor;
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
