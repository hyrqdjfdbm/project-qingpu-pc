import { projectStore } from '@/mock/project-store';
import type { QingpuAuditChannel } from '@/types/qingpu-supplement';
import type {
  QingpuWithdrawAuditPayload,
  QingpuWithdrawForm,
  QingpuWithdrawItem,
  QingpuWithdrawQuery,
  QingpuWithdrawStatus
} from '@/types/qingpu-withdraw';

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

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function channelFromAttribute(attr?: string): QingpuAuditChannel {
  return attr === 'social' ? 'jingwei' : 'fagai';
}

let idSeq = 20;

function makeItem(
  partial: Partial<QingpuWithdrawItem> &
    Pick<
      QingpuWithdrawItem,
      | 'id'
      | 'projectId'
      | 'projectName'
      | 'projectCode'
      | 'statisticalBelonging'
      | 'responsibleUnits'
      | 'reason'
      | 'status'
      | 'applicant'
      | 'applicantId'
      | 'applicantUnit'
      | 'submittedAt'
      | 'auditChannel'
    >
): QingpuWithdrawItem {
  return {
    projectAbbr: partial.projectAbbr,
    totalInvestment: partial.totalInvestment ?? 0,
    hasReplacement: partial.hasReplacement ?? false,
    replacementProjectId: partial.replacementProjectId,
    replacementProjectName: partial.replacementProjectName,
    replacementProjectCode: partial.replacementProjectCode,
    ...partial,
    supervisorId: partial.supervisorId || 'u-supervisor-zhao',
    supervisorName: partial.supervisorName || '赵文博',
    createdAt: partial.createdAt || partial.submittedAt,
    updatedAt: partial.updatedAt || partial.submittedAt
  };
}

const records: QingpuWithdrawItem[] = [
  makeItem({
    id: 'qw1',
    projectId: '6',
    projectName: '上海山崎电路板有限公司二期项目',
    projectCode: '132164445310118M01',
    projectAbbr: '山崎电路板二期',
    totalInvestment: 5.92,
    statisticalBelonging: '华新镇',
    responsibleUnits: ['区经信委'],
    reason: '业主调整建设时序，本期不再实施',
    status: 'pendingReview',
    auditChannel: 'jingwei',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-1, -2)
  }),
  makeItem({
    id: 'qw2',
    projectId: 'p-qw2',
    projectName: '华新镇智能装备车间扩建项目',
    projectCode: '132164445310118I21',
    projectAbbr: '智能装备车间',
    totalInvestment: 2.16,
    statisticalBelonging: '华新镇',
    responsibleUnits: ['区经信委', '华新镇'],
    reason: '用地手续尚未落实，申请暂时退库',
    hasReplacement: true,
    replacementProjectId: '8',
    replacementProjectName: '青浦区污水处理厂提标改造工程',
    replacementProjectCode: '132164445310118G01',
    status: 'pendingReview',
    auditChannel: 'jingwei',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-2)
  }),
  makeItem({
    id: 'qw3',
    projectId: 'p-qw3',
    projectName: '夏阳街道市政道路改造工程',
    projectCode: '132164445310118G08',
    projectAbbr: '夏阳道路改造',
    totalInvestment: 0.98,
    statisticalBelonging: '区属',
    responsibleUnits: ['区建管委', '夏阳街道'],
    reason: '与相邻道路工程合并实施，申请退库',
    status: 'pendingReview',
    auditChannel: 'fagai',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-3, 1)
  }),
  makeItem({
    id: 'qw4',
    projectId: 'p-qw4',
    projectName: '金泽镇污水管网延伸工程',
    projectCode: '132164445310118G09',
    statisticalBelonging: '金泽镇',
    responsibleUnits: ['区建管委', '金泽镇'],
    reason: '年度投资计划调减',
    status: 'pendingReview',
    auditChannel: 'fagai',
    applicant: '郭晓彤',
    applicantId: 'u-specialist-guo',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-6),
    updatedAt: offsetDays(-2)
  }),
  makeItem({
    id: 'qw5',
    projectId: 'p-qw5',
    projectName: '徐泾镇产业社区标准厂房项目',
    projectCode: '132164445310118I18',
    projectAbbr: '徐泾标准厂房',
    totalInvestment: 3.24,
    statisticalBelonging: '徐泾镇',
    responsibleUnits: ['区经委', '徐泾镇'],
    reason: '招商主体变更，原项目不再推进',
    status: 'pendingReview',
    auditChannel: 'jingwei',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-8),
    updatedAt: offsetDays(-3)
  }),
  makeItem({
    id: 'qw6',
    projectId: 'p-qw6',
    projectName: '朱家角水乡客厅商业配套设施项目',
    projectCode: '132164445310118S11',
    statisticalBelonging: '朱家角镇',
    responsibleUnits: ['区商务委', '朱家角镇'],
    reason: '业态方案重大调整',
    status: 'withdrawn',
    auditChannel: 'jingwei',
    applicant: '孙丽娜',
    applicantId: 'u-specialist-sun',
    applicantUnit: '区商务委',
    submittedAt: offsetDays(-28),
    auditedAt: offsetDays(-21),
    auditedBy: '沈若兰',
    auditOpinion: '同意退库'
  }),
  makeItem({
    id: 'qw7',
    projectId: '7',
    projectName: '赫格纳斯青浦新建厂房项目',
    projectCode: '132164445310118M02',
    totalInvestment: 3.41,
    statisticalBelonging: '工业园区',
    responsibleUnits: ['区经信委', '工业园区'],
    reason: '业主调整建设时序，申请退库；后续可恢复入库',
    status: 'withdrawn',
    auditChannel: 'jingwei',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-35),
    auditedAt: offsetDays(-27),
    auditedBy: '沈若兰',
    auditOpinion: '准予退库'
  }),
  makeItem({
    id: 'qw8',
    projectId: 'p-qw8',
    projectName: '练塘镇商贸物流园一期',
    projectCode: '132164445310118S13',
    totalInvestment: 2.78,
    statisticalBelonging: '练塘镇',
    responsibleUnits: ['区商务委', '练塘镇'],
    reason: '土地供应节奏延后',
    status: 'withdrawn',
    auditChannel: 'jingwei',
    applicant: '周佳宁',
    applicantId: 'u-specialist-zhou',
    applicantUnit: '区商务委',
    submittedAt: offsetDays(-40),
    auditedAt: offsetDays(-32),
    auditedBy: '沈若兰',
    auditOpinion: '同意退库'
  }),
  makeItem({
    id: 'qw9',
    projectId: 'p-qw9',
    projectName: '白鹤镇精密制造技改项目',
    projectCode: '132164445310118I19',
    totalInvestment: 0.89,
    statisticalBelonging: '白鹤镇',
    responsibleUnits: ['区经委', '白鹤镇'],
    reason: '设备清单尚未确定',
    status: 'returned',
    auditChannel: 'jingwei',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-9),
    auditedAt: offsetDays(-5),
    auditedBy: '沈若兰',
    auditOpinion: '退库依据不足，请补充业主书面说明后重报'
  }),
  makeItem({
    id: 'qw10',
    projectId: 'p-qw10',
    projectName: '香花桥街道九年一贯制学校改扩建',
    projectCode: '132164445310118G14',
    totalInvestment: 4.12,
    statisticalBelonging: '区属',
    responsibleUnits: ['区教育局', '香花桥街道'],
    reason: '学位需求测算下调',
    status: 'returned',
    auditChannel: 'fagai',
    applicant: '高晨阳',
    applicantId: 'u-specialist-gao',
    applicantUnit: '区教育局',
    submittedAt: offsetDays(-12),
    auditedAt: offsetDays(-6),
    auditedBy: '郑昊然',
    auditOpinion: '教育专项仍需实施，退回申请'
  }),
  makeItem({
    id: 'qw11',
    projectId: 'p-qw11',
    projectName: '重固镇冷链仓储设施项目',
    projectCode: '132164445310118S15',
    totalInvestment: 1.34,
    statisticalBelonging: '重固镇',
    responsibleUnits: ['区商务委', '重固镇'],
    reason: '业主主动撤回建设计划',
    status: 'revoked',
    auditChannel: 'jingwei',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-16),
    revokeReason: '业主恢复推进，撤销退库申请'
  }),
  makeItem({
    id: 'qw12',
    projectId: 'p-qw12',
    projectName: '盈浦街道口袋公园提升工程',
    projectCode: '132164445310118G16',
    totalInvestment: 0.29,
    statisticalBelonging: '区属',
    responsibleUnits: ['区绿容局', '盈浦街道'],
    reason: '并入街道综合整治包',
    status: 'revoked',
    auditChannel: 'fagai',
    applicant: '罗雅婷',
    applicantId: 'u-specialist-luo',
    applicantUnit: '区绿容局',
    submittedAt: offsetDays(-11)
  })
];

records
  .filter((r) => r.status === 'withdrawn')
  .forEach((r) => projectStore.exitImplementation(r.projectId));

function matchQuery(item: QingpuWithdrawItem, params: QingpuWithdrawQuery) {
  if (params.status && item.status !== params.status) return false;
  if (params.statisticalBelonging && item.statisticalBelonging !== params.statisticalBelonging) {
    return false;
  }
  if (params.responsibleUnit && !item.responsibleUnits.includes(params.responsibleUnit)) {
    return false;
  }
  if (params.applicantId && item.applicantId !== params.applicantId) return false;
  if (params.supervisorId && item.supervisorId !== params.supervisorId) return false;
  if (params.auditChannel && item.auditChannel !== params.auditChannel) return false;
  if (params.keyword) {
    const kw = params.keyword.trim();
    if (
      !item.projectName.includes(kw) &&
      !item.projectCode.includes(kw) &&
      !(item.projectAbbr || '').includes(kw)
    ) {
      return false;
    }
  }
  return true;
}

export const qingpuWithdrawStore = {
  list(params: QingpuWithdrawQuery = {}) {
    return records
      .filter((r) => matchQuery(r, params))
      .map(clone)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  listAuditTodos(params: QingpuWithdrawQuery = {}) {
    return this.list(params).filter((r) => r.status === 'pendingReview');
  },

  getById(id: string) {
    const item = records.find((r) => r.id === id);
    return item ? clone(item) : null;
  },

  isProjectBusy(projectId: string, excludeId?: string) {
    return records.some(
      (r) =>
        r.projectId === projectId &&
        r.id !== excludeId &&
        (r.status === 'pendingReview')
    );
  },

  create(
    data: QingpuWithdrawForm,
    meta?: {
      applicant?: string;
      applicantId?: string;
      applicantUnit?: string;
      supervisorId?: string;
      supervisorName?: string;
    }
  ) {
    if (this.isProjectBusy(data.projectId)) {
      throw new Error('该项目已有在途退库申请，请勿重复申报');
    }
    const project = projectStore.getById(data.projectId);
    const now = nowText();
    const item: QingpuWithdrawItem = {
      ...clone(data),
      id: `qw${++idSeq}`,
      status: 'pendingReview',
      auditChannel: channelFromAttribute(project?.projectAttribute),
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

  update(id: string, data: QingpuWithdrawForm) {
    const idx = records.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const cur = records[idx];
    if (cur.status !== 'pendingReview' && cur.status !== 'returned') return null;
    if (this.isProjectBusy(data.projectId, id)) {
      throw new Error('该项目已有在途退库申请，请勿重复申报');
    }
    const project = projectStore.getById(data.projectId);
    const now = nowText();
    records[idx] = {
      ...cur,
      ...clone(data),
      status: 'pendingReview',
      auditChannel: channelFromAttribute(project?.projectAttribute) || cur.auditChannel,
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
    if (item.status !== 'pendingReview' && item.status !== 'returned') {
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

  audit(id: string, payload: QingpuWithdrawAuditPayload, auditor = '审核专员') {
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
    projectStore.exitImplementation(item.projectId);
    item.status = 'withdrawn';
    return clone(item);
  },

  restore(id: string) {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'withdrawn' || item.restoredAt) return null;
    projectStore.restoreImplementation(item.projectId);
    item.restoredAt = nowText();
    item.updatedAt = nowText();
    return clone(item);
  }
};
