import type {
  ReserveDeclarePayload,
  ReserveFinalAuditPayload,
  ReserveFirstAuditPayload,
  ReserveFlowStatus,
  ReserveModule,
  ReserveProgressPayload,
  ReserveProjectItem,
  ReserveQuery
} from '@/types/reserve-pool';
import {
  getReserveProjectName,
  getReserveResponsibleUnit
} from '@/types/reserve-pool';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateTime(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function offsetTime(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDateTime(d);
}

let idSeq = 100;
let progressIdSeq = 1000;

const records: ReserveProjectItem[] = [
  {
    id: 'rv1',
    module: 'partySchool',
    status: 'delisted',
    applicant: '周佳宁',
    applicantUnit: '区发改委',
    submittedAt: offsetTime(-20),
    createdAt: offsetTime(-22),
    updatedAt: offsetTime(-12),
    attachments: [],
    auditRecords: [
      {
        stage: 'first',
        result: 'pass',
        opinion: '谋划方向清晰，同意提交终审',
        auditor: '赵磊',
        auditedAt: offsetTime(-16)
      },
      {
        stage: 'final',
        result: 'pass',
        opinion: '准予纳入党校集中谋划清单',
        auditor: '陈静',
        auditedAt: offsetTime(-12)
      }
    ],
    progressReports: [
      {
        id: 'pr1',
        currentProgress: '立项材料已编制完成，专项债需求已报送',
        nextPlan: '推进可研评审，争取三季度完成立项批复',
        reportedAt: offsetTime(-3),
        reportedBy: '周佳宁'
      },
      {
        id: 'pr0',
        currentProgress: '前期工作推进中，已启动内部梳理',
        nextPlan: '明确节点计划并组织专班推进',
        reportedAt: offsetTime(-10),
        reportedBy: '周佳宁'
      }
    ],
    partySchool: {
      leadUnit: '区发改委',
      responsibleUnit: '区建管委',
      domain: 'other',
      projectName: '党校教学实训基地提升工程',
      location: '夏阳街道党校路 128 号',
      landStatus: '存量建设用地，手续齐全',
      fundMix: '专项债为主，区级财政配套',
      operationMode: '事业单位自营',
      constructionScale: '新建实训楼及配套教学设施，改造既有校舍智能化系统',
      startYear: 2026,
      endYear: 2028,
      totalInvestment: 1.85,
      planInvest2027: 0.9,
      plannedStartDate: '2026-03-01',
      investType: 'gov',
      remark: '服务干部教育高质量发展'
    }
  },
  {
    id: 'rv2',
    module: 'partySchool',
    status: 'pendingReview',
    applicant: '刘洋',
    applicantUnit: '区科委',
    submittedAt: offsetTime(-2),
    createdAt: offsetTime(-3),
    updatedAt: offsetTime(-2),
    attachments: [],
    auditRecords: [],
    progressReports: [
      {
        id: 'pr2',
        currentProgress: '已完成校园骨干网现状勘察',
        nextPlan: '完善申报材料并等待初审',
        reportedAt: offsetTime(-1),
        reportedBy: '刘洋'
      }
    ],
    partySchool: {
      leadUnit: '区科委',
      responsibleUnit: '区科委',
      domain: 'industry',
      projectName: '党校智慧校园网络升级项目',
      location: '夏阳街道党校路 128 号',
      landStatus: '利用既有校舍，不新增用地',
      fundMix: '上级专项 + 单位自筹',
      operationMode: '委托运维',
      constructionScale: '升级校园骨干网与算力节点，建设智慧教室',
      startYear: 2026,
      endYear: 2027,
      totalInvestment: 0.62,
      planInvest2027: 0.3,
      plannedStartDate: '2026-05-01',
      investType: 'soeSocial'
    }
  },
  {
    id: 'rv3',
    module: 'department',
    status: 'reviewing',
    applicant: '吴芳',
    applicantUnit: '区建管委',
    submittedAt: offsetTime(-8),
    createdAt: offsetTime(-10),
    updatedAt: offsetTime(-5),
    attachments: [],
    auditRecords: [
      {
        stage: 'first',
        result: 'pass',
        opinion: '部门谋划重点明确，同意终审',
        auditor: '何志强',
        auditedAt: offsetTime(-5)
      }
    ],
    progressReports: [
      {
        id: 'pr3',
        currentProgress: '雨污分流方案已通过部门初审',
        nextPlan: '完善申报材料并报送终审',
        reportedAt: offsetTime(-2),
        reportedBy: '吴芳'
      }
    ],
    department: {
      responsibleUnit: '区建管委',
      projectCategory: 'safety',
      projectName: '青浦新城市政管网补短板工程',
      projectContent: '实施地下管网改造及雨污分流，消除内涝隐患',
      plannedStartDate: '2026-06-01',
      totalInvestment: 4.2,
      planInvest2027: 1.5
    }
  },
  {
    id: 'rv4',
    module: 'township',
    status: 'returned',
    applicant: '孙丽娜',
    applicantUnit: '区农业农村委',
    submittedAt: offsetTime(-6),
    createdAt: offsetTime(-7),
    updatedAt: offsetTime(-4),
    attachments: [],
    auditRecords: [
      {
        stage: 'first',
        result: 'reject',
        opinion: '用地情况论证不充分，请补充后重报',
        auditor: '马文博',
        auditedAt: offsetTime(-4)
      }
    ],
    progressReports: [
      {
        id: 'pr4',
        currentProgress: '选址论证补充中',
        nextPlan: '按初审意见完善用地说明后重新提交',
        reportedAt: offsetTime(-1),
        reportedBy: '孙丽娜'
      }
    ],
    township: {
      responsibleUnit: '区农业农村委',
      projectName: '徐泾北社区公共服务综合体',
      constructionContent: '建设社区综合服务用房及配套停车场',
      totalInvestment: 2.1,
      planInvest2027: 0.8,
      plannedStartDate: '2026-06-01',
      fundMix: '专项债为主',
      operationMode: '镇级运营',
      landStatus: '拟选址集体建设用地，手续推进中',
      remark: ''
    }
  },
  {
    id: 'rv5',
    module: 'arena',
    status: 'delisted',
    applicant: '林雨桐',
    applicantUnit: '区建管委',
    submittedAt: offsetTime(-15),
    createdAt: offsetTime(-16),
    updatedAt: offsetTime(-9),
    attachments: [],
    auditRecords: [
      {
        stage: 'first',
        result: 'pass',
        opinion: '晾晒材料齐全',
        auditor: '徐天宇',
        auditedAt: offsetTime(-12)
      },
      {
        stage: 'final',
        result: 'pass',
        opinion: '准予上架擂台榜单',
        auditor: '陈静',
        auditedAt: offsetTime(-9)
      }
    ],
    progressReports: [
      {
        id: 'pr5',
        currentProgress: '方案深化完成约 70%',
        nextPlan: '加快征迁协调，力争年内开工',
        reportedAt: offsetTime(-4),
        reportedBy: '林雨桐'
      }
    ],
    arena: {
      responsibleUnit: '区建管委',
      projectName: '淀山湖大道品质提升储备项目',
      constructionContent: '道路品质提升及沿线绿化迁移改造',
      totalInvestment: 3.8,
      planInvest2026: 1.2,
      plannedStartDate: '2026-08-01',
      hasStarted: false
    }
  },
  {
    id: 'rv6',
    module: 'element',
    status: 'pendingReview',
    applicant: '郭晓彤',
    applicantUnit: '区发改委',
    submittedAt: offsetTime(-1),
    createdAt: offsetTime(-1),
    updatedAt: offsetTime(-1),
    attachments: [],
    auditRecords: [],
    progressReports: [
      {
        id: 'pr6',
        currentProgress: '首批专项债申报材料编制约 60%',
        nextPlan: '本月底完成材料联审并正式报送',
        reportedAt: offsetTime(-1),
        reportedBy: '郭晓彤'
      }
    ],
    element: {
      responsibleUnit: '区发改委',
      projectName: '青浦新城中央商务区综合提升工程要素申报',
      constructionContent: '商务区综合提升及市政配套',
      totalInvestment: 12.6,
      policyCategory: 'specialBond',
      isSixNet: true,
      sixNetTypes: ['underground', 'power', 'comm'],
      elementFund: 2.8
    }
  },
  {
    id: 'rv7',
    module: 'department',
    status: 'draft',
    applicant: '朱敏慧',
    applicantUnit: '区经信委',
    createdAt: offsetTime(-1),
    updatedAt: offsetTime(-1),
    attachments: [],
    auditRecords: [],
    progressReports: [],
    department: {
      responsibleUnit: '区经信委',
      projectCategory: 'ai',
      projectName: '先进制造业园区算力配套工程',
      projectContent: '建设园区边缘算力节点及配套机房',
      plannedStartDate: '2026-08-01',
      totalInvestment: 1.2,
      planInvest2027: 0.6
    }
  },
  {
    id: 'rv8',
    module: 'arena',
    status: 'reviewing',
    applicant: '高晨阳',
    applicantUnit: '区商务委',
    submittedAt: offsetTime(-4),
    createdAt: offsetTime(-5),
    updatedAt: offsetTime(-2),
    attachments: [],
    auditRecords: [
      {
        stage: 'first',
        result: 'pass',
        opinion: '已开工项目进度清晰，同意终审',
        auditor: '罗雅婷',
        auditedAt: offsetTime(-2)
      }
    ],
    progressReports: [
      {
        id: 'pr8',
        currentProgress: '已开工，主体施工推进中',
        nextPlan: '按节点完成节点验收',
        reportedAt: offsetTime(-1),
        reportedBy: '高晨阳'
      }
    ],
    arena: {
      responsibleUnit: '区商务委',
      projectName: '赵巷商贸枢纽配套提升项目',
      constructionContent: '商贸配套设施改造及物流通道优化',
      totalInvestment: 2.4,
      planInvest2026: 0.9,
      plannedStartDate: '2026-02-01',
      hasStarted: true,
      actualStartDate: '2026-03-15'
    }
  }
];

function matchQuery(item: ReserveProjectItem, params: ReserveQuery) {
  if (item.module !== params.module) return false;
  if (params.projectName) {
    if (!getReserveProjectName(item).includes(params.projectName)) return false;
  }
  if (params.responsibleUnit) {
    if (getReserveResponsibleUnit(item) !== params.responsibleUnit) return false;
  }
  if (params.status && item.status !== params.status) return false;
  if (params.domain && item.partySchool?.domain !== params.domain) return false;
  if (params.leadUnit && item.partySchool?.leadUnit !== params.leadUnit) return false;
  if (params.projectCategory && item.department?.projectCategory !== params.projectCategory) {
    return false;
  }
  if (params.policyCategory && item.element?.policyCategory !== params.policyCategory) return false;
  if (params.isSixNet !== undefined && item.element?.isSixNet !== params.isSixNet) return false;
  if (params.hasStarted !== undefined && item.arena?.hasStarted !== params.hasStarted) return false;
  return true;
}

function cloneItem(item: ReserveProjectItem): ReserveProjectItem {
  return JSON.parse(JSON.stringify(item));
}

export const reservePoolStore = {
  list(params: ReserveQuery) {
    return records
      .filter((r) => matchQuery(r, params))
      .map(cloneItem)
      .sort((a, b) => (b.submittedAt || b.updatedAt).localeCompare(a.submittedAt || a.updatedAt));
  },

  getById(id: string) {
    const item = records.find((r) => r.id === id);
    return item ? cloneItem(item) : null;
  },

  create(payload: ReserveDeclarePayload, applicant = '当前专员', unit = '申报单位') {
    const now = formatDateTime();
    const status: ReserveFlowStatus = payload.asDraft ? 'draft' : 'pendingReview';
    const item: ReserveProjectItem = {
      id: `rv${++idSeq}`,
      module: payload.module,
      status,
      applicant,
      applicantUnit: unit,
      submittedAt: payload.asDraft ? undefined : now,
      createdAt: now,
      updatedAt: now,
      attachments: [...(payload.attachments || [])],
      auditRecords: [],
      progressReports: [],
      partySchool: payload.partySchool ? { ...payload.partySchool } : undefined,
      department: payload.department ? { ...payload.department } : undefined,
      township: payload.township ? { ...payload.township } : undefined,
      arena: payload.arena ? { ...payload.arena } : undefined,
      element: payload.element
        ? { ...payload.element, sixNetTypes: [...payload.element.sixNetTypes] }
        : undefined
    };
    records.unshift(item);
    return cloneItem(item);
  },

  update(id: string, payload: ReserveDeclarePayload) {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    if (!['pendingReview', 'returned'].includes(item.status)) return null;
    const now = formatDateTime();
    item.attachments = [...(payload.attachments || [])];
    item.partySchool = payload.partySchool ? { ...payload.partySchool } : undefined;
    item.department = payload.department ? { ...payload.department } : undefined;
    item.township = payload.township ? { ...payload.township } : undefined;
    item.arena = payload.arena ? { ...payload.arena } : undefined;
    item.element = payload.element
      ? { ...payload.element, sixNetTypes: [...payload.element.sixNetTypes] }
      : undefined;
    if (payload.asDraft) {
      item.status = 'draft';
      item.submittedAt = undefined;
    } else {
      item.status = 'pendingReview';
      item.submittedAt = now;
      item.revokeReason = undefined;
      item.revokedAt = undefined;
      item.revokedBy = undefined;
    }
    item.updatedAt = now;
    return cloneItem(item);
  },

  revoke(id: string, reason?: string, revokedBy = '项目专员') {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    // 仅待审核可撤销，无需原因
    if (item.status !== 'pendingReview') return null;
    const now = formatDateTime();
    item.status = 'revoked';
    item.revokeReason = reason?.trim() || undefined;
    item.revokedAt = now;
    item.revokedBy = revokedBy;
    item.updatedAt = now;
    return cloneItem(item);
  },

  updateProgress(id: string, payload: ReserveProgressPayload, reportedBy = '项目专员') {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    if (!item.progressReports) item.progressReports = [];
    const now = formatDateTime();
    item.progressReports.unshift({
      id: `pr${++progressIdSeq}`,
      currentProgress: payload.currentProgress.trim(),
      nextPlan: payload.nextPlan.trim(),
      reportedAt: now,
      reportedBy
    });
    item.updatedAt = now;
    return cloneItem(item);
  },

  firstAudit(id: string, payload: ReserveFirstAuditPayload, auditor = '分管领导') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'pendingReview') return null;
    const now = formatDateTime();
    item.auditRecords.push({
      stage: 'first',
      result: payload.approved ? 'pass' : 'reject',
      opinion: payload.opinion,
      auditor,
      auditedAt: now
    });
    item.status = payload.approved ? 'reviewing' : 'returned';
    item.updatedAt = now;
    return cloneItem(item);
  },

  finalAudit(id: string, payload: ReserveFinalAuditPayload, auditor = '片区专员') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'reviewing') return null;
    const now = formatDateTime();
    item.auditRecords.push({
      stage: 'final',
      result: payload.approved ? 'pass' : 'reject',
      opinion: payload.opinion,
      auditor,
      auditedAt: now
    });
    item.status = payload.approved ? 'delisted' : 'returned';
    item.updatedAt = now;
    return cloneItem(item);
  },

  listAuditTodos(status: 'pendingReview' | 'reviewing') {
    return records
      .filter((r) => r.status === status)
      .map(cloneItem)
      .sort((a, b) => (b.submittedAt || b.updatedAt).localeCompare(a.submittedAt || a.updatedAt));
  },

  countByModule(module: ReserveModule) {
    return records.filter((r) => r.module === module).length;
  }
};
