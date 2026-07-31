import type {
  WorkbenchBizNode,
  WorkbenchProgressKind,
  WorkbenchSourceModule,
  WorkbenchStatus,
  WorkbenchTask
} from '@/types/workbench';
import { WORKBENCH_BIZ_NODE_LABEL } from '@/types/workbench';
import { ROLE_PRESETS } from '@/mock/current-user';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateTime(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

function offsetMs(ms: number) {
  return new Date(Date.now() + ms);
}

function parseDateTime(s: string) {
  return new Date(s.replace(' ', 'T'));
}

function isOverdue(dueAt?: string) {
  if (!dueAt) return false;
  return parseDateTime(dueAt).getTime() < Date.now();
}

function actionLabelByStatus(status: WorkbenchStatus) {
  switch (status) {
    case 'pending_dispose':
      return '去处置';
    case 'pending_review':
      return '去审核';
    case 'pending_confirm':
      return '去确认';
    case 'pending_read':
      return '去查阅';
    default:
      return '已完成';
  }
}

const specialist = ROLE_PRESETS.projectSpecialist.id;
const supervisor = ROLE_PRESETS.supervisor.id;
const district = ROLE_PRESETS.districtSpecialist.id;
/** 交办发起领导（决策点 H：查阅指派发起人本人） */
const leader = ROLE_PRESETS.cityLeader.id;

let idSeq = 100;

type SeedInput = {
  bizNode: WorkbenchBizNode;
  assigneeId: string;
  title: string;
  projectName: string;
  projectCode: string;
  sourceModule: WorkbenchSourceModule;
  sourceBizId: string;
  status: Exclude<WorkbenchStatus, 'done'>;
  tags: string[];
  receivedOffsetH: number;
  dueOffsetH?: number;
  summary: string;
  progressKind?: WorkbenchProgressKind;
  initiatorId?: string;
  finalAuditorId?: string;
};

function makeTask(seed: SeedInput): WorkbenchTask {
  const receivedAt = formatDateTime(offsetMs(seed.receivedOffsetH * 3600 * 1000));
  const dueAt =
    seed.dueOffsetH == null
      ? undefined
      : formatDateTime(offsetMs(seed.dueOffsetH * 3600 * 1000));
  return {
    id: `wb-${seed.bizNode}-${++idSeq}`,
    assigneeId: seed.assigneeId,
    bizNode: seed.bizNode,
    bizNodeLabel: WORKBENCH_BIZ_NODE_LABEL[seed.bizNode],
    title: seed.title,
    projectName: seed.projectName,
    projectCode: seed.projectCode,
    sourceModule: seed.sourceModule,
    sourceBizId: seed.sourceBizId,
    progressKind: seed.progressKind,
    initiatorId: seed.initiatorId,
    finalAuditorId: seed.finalAuditorId,
    status: seed.status,
    tags: seed.tags,
    receivedAt,
    dueAt,
    isOverdue: false,
    summary: seed.summary,
    actionLabel: actionLabelByStatus(seed.status),
    updatedAt: receivedAt
  };
}

/**
 * 种子数据对齐 PRD V1.1 + 决策 E/F/G/H/I：
 * - 5-3 领导查阅（发起人本人）
 * - 6-7 片区查阅（终审片区专员）
 * - 8-1a 资金月报 / 8-1b 进度周报（可并存）
 */
const records: WorkbenchTask[] = [
  // —— 项目专员 ——
  makeTask({
    bizNode: '1-1',
    assigneeId: specialist,
    title: '项目节点填报：四委会两局会议节点待完善',
    projectName: '青浦新城综合提升工程',
    projectCode: 'QP-JD-2026-011',
    sourceModule: 'node-audit',
    sourceBizId: 'na-011',
    status: 'pending_dispose',
    tags: ['项目节点审核', '填报'],
    receivedOffsetH: -30,
    dueOffsetH: -4,
    summary: '节点「四委会两局会议」即将到期，请尽快完成填报。'
  }),
  makeTask({
    bizNode: '2-1',
    assigneeId: specialist,
    title: '谋划库申报退回待改：补充用地与资金说明',
    projectName: '金泽镇乡村振兴配套设施项目',
    projectCode: 'QP-MH-2026-008',
    sourceModule: 'planning-pool',
    sourceBizId: 'pp-008',
    status: 'pending_dispose',
    tags: ['谋划库', '申报'],
    receivedOffsetH: -20,
    dueOffsetH: 24,
    summary: '初审退回，请按意见补充用地性质与资金来源说明后重新提交。'
  }),
  makeTask({
    bizNode: '3-1',
    assigneeId: specialist,
    title: '退库申请退回待改：完善退库原因佐证',
    projectName: '赵巷街道市政支路改造工程',
    projectCode: 'QP-TK-2026-003',
    sourceModule: 'delist',
    sourceBizId: 'dl-003',
    status: 'pending_dispose',
    tags: ['退库', '申报'],
    receivedOffsetH: -18,
    dueOffsetH: 36,
    summary: '终审退回至专员，请补充退库佐证材料后再次申报。'
  }),
  makeTask({
    bizNode: '4-1',
    assigneeId: specialist,
    title: '增补库申报退回待改：业主与土地信息不全',
    projectName: '华新镇产业园区配套道路工程',
    projectCode: 'QP-ZB-2026-018',
    sourceModule: 'supplement-library',
    sourceBizId: 'sl-018',
    status: 'pending_dispose',
    tags: ['增补库', '申报'],
    receivedOffsetH: -40,
    dueOffsetH: -2,
    summary: '初审退回：请补全业主信息、土地信息后重新提交。'
  }),
  makeTask({
    bizNode: '5-1',
    assigneeId: specialist,
    title: '领导交办待处置：加快征收清场节点推进',
    projectName: '中央商务区综合提升工程',
    projectCode: 'QP-JB-2026-021',
    sourceModule: 'leader-assign',
    sourceBizId: 'la-021',
    status: 'pending_dispose',
    tags: ['领导交办', '处置'],
    receivedOffsetH: -12,
    dueOffsetH: 20,
    initiatorId: leader,
    summary: '区领导交办：协调规资加快征收手续，明确清场节点并反馈进展。'
  }),
  makeTask({
    bizNode: '6-4',
    assigneeId: specialist,
    title: '难题协调待处置：商户临时通行保障落实',
    projectName: '淀山湖大道环境品质提升项目',
    projectCode: 'QP-NT-2026-006',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-006',
    status: 'pending_dispose',
    tags: ['难题协调', '处置'],
    receivedOffsetH: -8,
    dueOffsetH: 48,
    finalAuditorId: district,
    summary: '终审已通过，请落实临时通行方案并填报处置结果。'
  }),
  makeTask({
    bizNode: '6-6',
    assigneeId: specialist,
    title: '难题协调待确认：处置结果确认销号',
    projectName: '夏阳街道雨污水管网改造工程',
    projectCode: 'QP-NT-2026-002',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-002',
    status: 'pending_confirm',
    tags: ['难题协调', '确认'],
    receivedOffsetH: -6,
    dueOffsetH: 72,
    finalAuditorId: district,
    summary: '分管领导已审核通过处置结果，请确认并完成销号（确认后将生成片区专员查阅）。'
  }),
  makeTask({
    bizNode: '7-1',
    assigneeId: specialist,
    title: '预警待处置：形象进度连续两月滞后',
    projectName: '徐泾镇公共服务设施提升项目',
    projectCode: 'QP-YJ-2026-015',
    sourceModule: 'alert-management',
    sourceBizId: 'al-015',
    status: 'pending_dispose',
    tags: ['预警管理', '处置'],
    receivedOffsetH: -15,
    dueOffsetH: 12,
    summary: '系统预警：形象进度连续两月低于计划，请说明原因并提交处置措施。'
  }),
  // 8-1a 资金月报（每月1号）+ 8-1b 进度周报（每周五晚上）— 同项目可并存（F）
  makeTask({
    bizNode: '8-1a',
    assigneeId: specialist,
    title: '资金月报待填报：2026年7月资金完成情况',
    projectName: '重固镇水系连通工程',
    projectCode: 'QP-JDXX-2026-009',
    sourceModule: 'progress-report',
    sourceBizId: 'pr-fund-2026-07',
    progressKind: 'fund',
    status: 'pending_dispose',
    tags: ['项目进度信息', '资金月报'],
    receivedOffsetH: -72,
    dueOffsetH: 48,
    summary: '系统于每月1号生成：请填报本月资金到位与完成情况。'
  }),
  makeTask({
    bizNode: '8-1b',
    assigneeId: specialist,
    title: '进度周报待填报：第31周形象进度',
    projectName: '重固镇水系连通工程',
    projectCode: 'QP-JDXX-2026-009',
    sourceModule: 'progress-report',
    sourceBizId: 'pr-sch-2026-w31',
    progressKind: 'schedule',
    status: 'pending_dispose',
    tags: ['项目进度信息', '进度周报'],
    receivedOffsetH: -20,
    dueOffsetH: 28,
    summary: '系统于每周五晚上生成：请填报本周形象进度与关键节点进展。'
  }),
  makeTask({
    bizNode: '8-1b',
    assigneeId: specialist,
    title: '进度周报待填报：第30周形象进度（上期未填）',
    projectName: '重固镇水系连通工程',
    projectCode: 'QP-JDXX-2026-009',
    sourceModule: 'progress-report',
    sourceBizId: 'pr-sch-2026-w30',
    progressKind: 'schedule',
    status: 'pending_dispose',
    tags: ['项目进度信息', '进度周报', '补报'],
    receivedOffsetH: -188,
    dueOffsetH: -40,
    summary: '上期周报未填，与本期并存，请尽快补报。'
  }),

  // —— 分管领导 ——
  makeTask({
    bizNode: '2-2',
    assigneeId: supervisor,
    title: '谋划库初审：乡村振兴配套设施项目',
    projectName: '金泽镇乡村振兴配套设施项目',
    projectCode: 'QP-MH-2026-010',
    sourceModule: 'planning-pool',
    sourceBizId: 'pp-010',
    status: 'pending_review',
    tags: ['谋划库', '初审'],
    receivedOffsetH: -10,
    dueOffsetH: 30,
    summary: '项目专员已提交谋划申报，请完成初审（通过后流转片区专员终审）。'
  }),
  makeTask({
    bizNode: '3-2',
    assigneeId: supervisor,
    title: '退库初审：市政支路改造工程退库申请',
    projectName: '赵巷街道市政支路改造工程',
    projectCode: 'QP-TK-2026-005',
    sourceModule: 'delist',
    sourceBizId: 'dl-005',
    status: 'pending_review',
    tags: ['退库', '初审'],
    receivedOffsetH: -9,
    dueOffsetH: 28,
    summary: '专员已提交退库申请，请初审退库理由与佐证材料。'
  }),
  makeTask({
    bizNode: '4-2',
    assigneeId: supervisor,
    title: '增补初审：产业园区配套道路工程',
    projectName: '华新镇产业园区配套道路工程',
    projectCode: 'QP-ZB-2026-022',
    sourceModule: 'supplement-library',
    sourceBizId: 'sl-022',
    status: 'pending_review',
    tags: ['增补库', '初审'],
    receivedOffsetH: -14,
    dueOffsetH: 18,
    summary: '专员已提交增补申报，请初审业主、建筑、资金、土地信息。'
  }),
  makeTask({
    bizNode: '6-2',
    assigneeId: supervisor,
    title: '难题协调初审：绿化迁移窗口协调申请',
    projectName: '练塘镇环境整治提升项目',
    projectCode: 'QP-NT-2026-011',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-011',
    status: 'pending_review',
    tags: ['难题协调', '初审'],
    receivedOffsetH: -7,
    dueOffsetH: 40,
    summary: '专员已提交难题申请，请初审后流转片区专员终审。'
  }),
  makeTask({
    bizNode: '6-5',
    assigneeId: supervisor,
    title: '难题协调审核：处置结果复核',
    projectName: '白鹤镇综合管廊配套工程',
    projectCode: 'QP-NT-2026-007',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-007',
    status: 'pending_review',
    tags: ['难题协调', '审核'],
    receivedOffsetH: -5,
    dueOffsetH: 22,
    finalAuditorId: district,
    summary: '专员已提交处置结果，请审核；通过后将生成专员确认待办。'
  }),

  // —— 片区专员 ——
  makeTask({
    bizNode: '1-2',
    assigneeId: district,
    title: '项目节点审核：专员填报待审',
    projectName: '青浦新城综合提升工程',
    projectCode: 'QP-JD-2026-011',
    sourceModule: 'node-audit',
    sourceBizId: 'na-011-r',
    status: 'pending_review',
    tags: ['项目节点审核', '审核'],
    receivedOffsetH: -4,
    dueOffsetH: 16,
    summary: '专员已完成节点填报，请审核通过或退回修改。'
  }),
  makeTask({
    bizNode: '2-3',
    assigneeId: district,
    title: '谋划库终审：初审已通过待终审',
    projectName: '朱家角镇文旅配套设施项目',
    projectCode: 'QP-MH-2026-012',
    sourceModule: 'planning-pool',
    sourceBizId: 'pp-012',
    status: 'pending_review',
    tags: ['谋划库', '终审'],
    receivedOffsetH: -11,
    dueOffsetH: 26,
    summary: '分管领导初审已通过，请终审（退回默认至专员重新申报）。'
  }),
  makeTask({
    bizNode: '3-3',
    assigneeId: district,
    title: '退库终审：初审已通过待终审',
    projectName: '盈浦街道老旧小区改造工程',
    projectCode: 'QP-TK-2026-007',
    sourceModule: 'delist',
    sourceBizId: 'dl-007',
    status: 'pending_review',
    tags: ['退库', '终审'],
    receivedOffsetH: -8,
    dueOffsetH: 20,
    summary: '分管领导初审已通过，请终审退库申请。'
  }),
  makeTask({
    bizNode: '4-3',
    assigneeId: district,
    title: '增补终审：初审已通过待终审',
    projectName: '香花桥街道市政道路贯通工程',
    projectCode: 'QP-ZB-2026-025',
    sourceModule: 'supplement-library',
    sourceBizId: 'sl-025',
    status: 'pending_review',
    tags: ['增补库', '终审'],
    receivedOffsetH: -16,
    dueOffsetH: 10,
    summary: '分管领导初审已通过，请终审；通过后项目入库。'
  }),
  makeTask({
    bizNode: '5-2',
    assigneeId: district,
    title: '领导交办审核：专员处置结果待审',
    projectName: '中央商务区综合提升工程',
    projectCode: 'QP-JB-2026-021',
    sourceModule: 'leader-assign',
    sourceBizId: 'la-021-r',
    status: 'pending_review',
    tags: ['领导交办', '审核'],
    receivedOffsetH: -2,
    dueOffsetH: 14,
    initiatorId: leader,
    summary: '专员已提交处置反馈，请审核；通过后将生成交办发起领导的查阅待办。'
  }),
  makeTask({
    bizNode: '6-3',
    assigneeId: district,
    title: '难题协调终审：初审已通过待终审',
    projectName: '练塘镇环境整治提升项目',
    projectCode: 'QP-NT-2026-011',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-011-f',
    status: 'pending_review',
    tags: ['难题协调', '终审'],
    receivedOffsetH: -6,
    dueOffsetH: 32,
    finalAuditorId: district,
    summary: '分管领导初审已通过，请终审；通过后进入专员处置。'
  }),
  makeTask({
    bizNode: '6-7',
    assigneeId: district,
    title: '难题协调待查阅：销号结果阅知',
    projectName: '香花桥街道雨污水泵站改造工程',
    projectCode: 'QP-NT-2026-004',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-004',
    status: 'pending_read',
    tags: ['难题协调', '查阅'],
    receivedOffsetH: -3,
    dueOffsetH: 96,
    finalAuditorId: district,
    summary: '专员已确认销号，请终审片区专员查阅并标记已阅（不可退回）。'
  }),

  // —— 领导（交办发起人）查阅 ——
  makeTask({
    bizNode: '5-3',
    assigneeId: leader,
    title: '领导交办待查阅：征收清场节点推进结果',
    projectName: '赵巷街道综合管线入地工程',
    projectCode: 'QP-JB-2026-019',
    sourceModule: 'leader-assign',
    sourceBizId: 'la-019',
    status: 'pending_read',
    tags: ['领导交办', '查阅'],
    receivedOffsetH: -5,
    dueOffsetH: 120,
    initiatorId: leader,
    summary: '片区专员已审核通过专员处置结果，请发起领导查阅并标记已阅（不可退回）。'
  })
];

function cloneTask(task: WorkbenchTask): WorkbenchTask {
  return { ...task, tags: [...task.tags] };
}

function attachComputed(task: WorkbenchTask): WorkbenchTask {
  return {
    ...task,
    isOverdue: isOverdue(task.dueAt)
  };
}

const NEXT_ON_APPROVE: Partial<
  Record<
    WorkbenchBizNode,
    {
      bizNode: WorkbenchBizNode;
      /** 固定角色；查阅类用动态解析 */
      assigneeId?: string;
      status: Exclude<WorkbenchStatus, 'done'>;
      titleSuffix: string;
      resolveAssignee?: (from: WorkbenchTask) => string;
    }
  >
> = {
  '1-1': {
    bizNode: '1-2',
    assigneeId: district,
    status: 'pending_review',
    titleSuffix: '专员填报待审'
  },
  '2-1': {
    bizNode: '2-2',
    assigneeId: supervisor,
    status: 'pending_review',
    titleSuffix: '专员申报待初审'
  },
  '2-2': {
    bizNode: '2-3',
    assigneeId: district,
    status: 'pending_review',
    titleSuffix: '初审已通过待终审'
  },
  '3-1': {
    bizNode: '3-2',
    assigneeId: supervisor,
    status: 'pending_review',
    titleSuffix: '退库申请待初审'
  },
  '3-2': {
    bizNode: '3-3',
    assigneeId: district,
    status: 'pending_review',
    titleSuffix: '初审已通过待终审'
  },
  '4-1': {
    bizNode: '4-2',
    assigneeId: supervisor,
    status: 'pending_review',
    titleSuffix: '增补申报待初审'
  },
  '4-2': {
    bizNode: '4-3',
    assigneeId: district,
    status: 'pending_review',
    titleSuffix: '初审已通过待终审'
  },
  '5-1': {
    bizNode: '5-2',
    assigneeId: district,
    status: 'pending_review',
    titleSuffix: '专员处置结果待审'
  },
  '5-2': {
    bizNode: '5-3',
    status: 'pending_read',
    titleSuffix: '审核通过待领导查阅',
    resolveAssignee: (from) => from.initiatorId || leader
  },
  '6-1': {
    bizNode: '6-2',
    assigneeId: supervisor,
    status: 'pending_review',
    titleSuffix: '难题申请待初审'
  },
  '6-2': {
    bizNode: '6-3',
    assigneeId: district,
    status: 'pending_review',
    titleSuffix: '初审已通过待终审'
  },
  '6-3': {
    bizNode: '6-4',
    assigneeId: specialist,
    status: 'pending_dispose',
    titleSuffix: '终审通过待处置'
  },
  '6-4': {
    bizNode: '6-5',
    assigneeId: supervisor,
    status: 'pending_review',
    titleSuffix: '处置结果待审核'
  },
  '6-5': {
    bizNode: '6-6',
    assigneeId: specialist,
    status: 'pending_confirm',
    titleSuffix: '审核通过待确认'
  },
  '6-6': {
    bizNode: '6-7',
    status: 'pending_read',
    titleSuffix: '确认完成待片区查阅',
    resolveAssignee: (from) => from.finalAuditorId || district
  }
};

const REJECT_TO_SPECIALIST: WorkbenchBizNode[] = [
  '1-2',
  '2-2',
  '2-3',
  '3-2',
  '3-3',
  '4-2',
  '4-3',
  '5-2',
  '6-2',
  '6-3',
  '6-5'
];

function sourceLabelTag(source: WorkbenchSourceModule) {
  const map: Record<WorkbenchSourceModule, string> = {
    'node-audit': '项目节点审核',
    'planning-pool': '谋划库',
    delist: '退库',
    'supplement-library': '增补库',
    'leader-assign': '领导交办',
    'problem-coord': '难题协调',
    'alert-management': '预警管理',
    'progress-report': '项目进度信息'
  };
  return map[source];
}

export const workbenchStore = {
  listPendingByAssignee(assigneeId: string) {
    return records
      .filter((t) => t.assigneeId === assigneeId && t.status !== 'done')
      .map((t) => attachComputed(cloneTask(t)))
      .sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        const ad = a.dueAt ? parseDateTime(a.dueAt).getTime() : Infinity;
        const bd = b.dueAt ? parseDateTime(b.dueAt).getTime() : Infinity;
        return ad - bd;
      });
  },

  getPendingCount(assigneeId: string) {
    return records.filter((t) => t.assigneeId === assigneeId && t.status !== 'done').length;
  },

  processTask(
    id: string,
    opts: {
      status: WorkbenchStatus;
      expectedUpdatedAt?: string;
      reviewResult?: 'approve' | 'reject';
      opinion?: string;
    }
  ): WorkbenchTask {
    const idx = records.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('待办不存在');

    const task = records[idx];
    if (opts.expectedUpdatedAt && task.updatedAt !== opts.expectedUpdatedAt) {
      throw new Error('任务状态已变更，请刷新');
    }

    // 决策点 G：查阅不可退回
    if (task.status === 'pending_read' && opts.reviewResult === 'reject') {
      throw new Error('查阅仅支持标记已阅，不可退回');
    }

    const nowStr = formatDateTime(new Date());
    const updatedTask: WorkbenchTask = {
      ...task,
      status: 'done',
      updatedAt: nowStr,
      actionLabel: '已完成'
    };
    records[idx] = updatedTask;

    if (task.status === 'pending_review' && opts.reviewResult === 'reject') {
      if (REJECT_TO_SPECIALIST.includes(task.bizNode)) {
        const rejectNodeMap: Partial<Record<WorkbenchBizNode, WorkbenchBizNode>> = {
          '1-2': '1-1',
          '2-2': '2-1',
          '2-3': '2-1',
          '3-2': '3-1',
          '3-3': '3-1',
          '4-2': '4-1',
          '4-3': '4-1',
          '5-2': '5-1',
          '6-2': '6-1',
          '6-3': '6-1',
          '6-5': '6-4'
        };
        const nextNode = rejectNodeMap[task.bizNode];
        if (nextNode) {
          records.push(
            makeTask({
              bizNode: nextNode,
              assigneeId: specialist,
              title: `${sourceLabelTag(task.sourceModule)}退回待改：${task.projectName}`,
              projectName: task.projectName || '',
              projectCode: task.projectCode || '',
              sourceModule: task.sourceModule,
              sourceBizId: `${task.sourceBizId}-reject`,
              status: 'pending_dispose',
              tags: [sourceLabelTag(task.sourceModule), WORKBENCH_BIZ_NODE_LABEL[nextNode]],
              receivedOffsetH: 0,
              dueOffsetH: 48,
              summary: opts.opinion
                ? `审核退回：${opts.opinion}`
                : '审核已退回，请按意见修改后重新提交。',
              initiatorId: task.initiatorId,
              finalAuditorId: task.finalAuditorId
            })
          );
        }
      }
    }

    const shouldFlowNext =
      task.status === 'pending_dispose' ||
      task.status === 'pending_confirm' ||
      (task.status === 'pending_review' && opts.reviewResult !== 'reject');

    if (shouldFlowNext) {
      const next = NEXT_ON_APPROVE[task.bizNode];
      if (next) {
        const assigneeId =
          next.resolveAssignee?.(task) || next.assigneeId || specialist;
        const carriedFinalAuditor =
          task.bizNode === '6-3' ? task.assigneeId : task.finalAuditorId;
        records.push(
          makeTask({
            bizNode: next.bizNode,
            assigneeId,
            title: `${sourceLabelTag(task.sourceModule)}${WORKBENCH_BIZ_NODE_LABEL[next.bizNode]}：${next.titleSuffix}`,
            projectName: task.projectName || '',
            projectCode: task.projectCode || '',
            sourceModule: task.sourceModule,
            sourceBizId: `${task.sourceBizId}-next`,
            status: next.status,
            tags: [sourceLabelTag(task.sourceModule), WORKBENCH_BIZ_NODE_LABEL[next.bizNode]],
            receivedOffsetH: 0,
            dueOffsetH: 48,
            summary: `由上一环节「${task.bizNodeLabel}」流转生成。`,
            initiatorId: task.initiatorId,
            finalAuditorId: carriedFinalAuditor,
            progressKind: task.progressKind
          })
        );
      }
    }

    return attachComputed(cloneTask(updatedTask));
  }
};
