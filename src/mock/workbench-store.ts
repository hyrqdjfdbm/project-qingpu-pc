import type {
  WorkbenchActionCode,
  WorkbenchSourceModule,
  WorkbenchStatus,
  WorkbenchTask,
  WorkbenchUrgeMeta
} from '@/types/workbench';
import { WORKBENCH_ACTION_LABEL, WORKBENCH_SOURCE_MODULE_LABEL } from '@/types/workbench';
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

const specialist = ROLE_PRESETS.projectSpecialist.id;
const supervisor = ROLE_PRESETS.supervisor.id;
const district = ROLE_PRESETS.districtSpecialist.id;
const cityLeader = ROLE_PRESETS.cityLeader.id;
const deptHead = ROLE_PRESETS.deptHead.id;

let idSeq = 200;

type SeedInput = {
  assigneeId: string;
  bizStatus: string;
  actionCode: WorkbenchActionCode;
  title: string;
  projectName: string;
  projectCode: string;
  nodeName?: string;
  relatedMatter?: string;
  sourceModule: WorkbenchSourceModule;
  sourceBizId: string;
  status: Exclude<WorkbenchStatus, 'done'>;
  tags?: string[];
  receivedOffsetH: number;
  dueOffsetH?: number;
  summary: string;
  urgeMeta?: WorkbenchUrgeMeta;
};

const DUE_DATE_MODULES: WorkbenchSourceModule[] = [
  'leader-assign',
  'problem-coord',
  'progress-fund',
  'progress-schedule'
];

function makeTask(seed: SeedInput): WorkbenchTask {
  const receivedAt = formatDateTime(offsetMs(seed.receivedOffsetH * 3600 * 1000));
  const keepDue = DUE_DATE_MODULES.includes(seed.sourceModule);
  const dueAt =
    !keepDue || seed.dueOffsetH == null
      ? undefined
      : formatDateTime(offsetMs(seed.dueOffsetH * 3600 * 1000));
  const sourceLabel = WORKBENCH_SOURCE_MODULE_LABEL[seed.sourceModule];
  return {
    id: `wb-v12-${++idSeq}`,
    assigneeId: seed.assigneeId,
    bizStatus: seed.bizStatus,
    actionCode: seed.actionCode,
    actionLabel: WORKBENCH_ACTION_LABEL[seed.actionCode],
    title: seed.title,
    projectName: seed.projectName,
    projectCode: seed.projectCode,
    nodeName: seed.nodeName,
    relatedMatter: seed.relatedMatter,
    sourceModule: seed.sourceModule,
    sourceBizId: seed.sourceBizId,
    status: seed.status,
    tags: seed.tags ?? [sourceLabel, seed.bizStatus],
    urgeMeta: seed.urgeMeta,
    receivedAt,
    dueAt,
    isOverdue: false,
    summary: seed.summary,
    updatedAt: receivedAt
  };
}

/**
 * V1.2 种子：对齐「模块×角色×状态（动作）」主表
 * D1：分管侧统一「分管领导待初审」
 * D3：待确认→分管去审核；待完结→专员去确认
 * C1：催办提示 status=pending_read，计入待查阅/角标
 */
const records: WorkbenchTask[] = [
  // —— 1 项目节点（待填报不进工作台，仅审核退回 / 待审核） ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '审核退回',
    actionCode: 'report',
    title: '项目节点审核退回：节点完成佐证材料缺失',
    projectName: '淀山湖大道品质提升工程',
    projectCode: 'QP-JD-2026-008',
    nodeName: '四委会两局会议',
    sourceModule: 'node-audit',
    sourceBizId: 'na-008',
    status: 'pending_dispose',
    receivedOffsetH: -8,
    dueOffsetH: 24,
    summary: '片区专员审核退回，请修改后重新填报。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '待审核',
    actionCode: 'audit',
    title: '项目节点待审核：专员已提交填报',
    projectName: '青浦新城综合提升工程',
    projectCode: 'QP-JD-2026-012',
    nodeName: '施工许可证取得',
    sourceModule: 'node-audit',
    sourceBizId: 'na-012',
    status: 'pending_review',
    receivedOffsetH: -4,
    dueOffsetH: 18,
    summary: '请审核节点填报内容。'
  }),

  // —— 2 谋划库 ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '退回',
    actionCode: 'modify',
    title: '谋划库退回待改：补充用地与资金说明',
    projectName: '金泽镇乡村振兴配套设施项目',
    projectCode: 'QP-MH-2026-008',
    sourceModule: 'planning-pool',
    sourceBizId: 'pp-008',
    status: 'pending_dispose',
    receivedOffsetH: -16,
    dueOffsetH: 30,
    summary: '初审/终审退回，请修改后重新申报。'
  }),
  makeTask({
    assigneeId: supervisor,
    bizStatus: '分管领导待初审',
    actionCode: 'first_audit',
    title: '谋划库待初审',
    projectName: '金泽镇乡村振兴配套设施项目',
    projectCode: 'QP-MH-2026-010',
    sourceModule: 'planning-pool',
    sourceBizId: 'pp-010',
    status: 'pending_review',
    receivedOffsetH: -10,
    dueOffsetH: 28,
    summary: '专员已提交谋划申报，请完成初审。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '片区专员待审核',
    actionCode: 'final_audit',
    title: '谋划库待终审',
    projectName: '朱家角镇文旅配套设施项目',
    projectCode: 'QP-MH-2026-012',
    sourceModule: 'planning-pool',
    sourceBizId: 'pp-012',
    status: 'pending_review',
    receivedOffsetH: -9,
    dueOffsetH: 20,
    summary: '分管领导初审已通过，请终审。'
  }),

  // —— 3 退库 ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '退回',
    actionCode: 'modify',
    title: '退库申请退回待改：退库佐证材料不完整',
    projectName: '赵巷街道市政支路改造工程',
    projectCode: 'QP-TK-2026-003',
    sourceModule: 'delist',
    sourceBizId: 'dl-003',
    status: 'pending_dispose',
    receivedOffsetH: -14,
    dueOffsetH: 36,
    summary: '审核退回，请完善退库佐证后重新申报。'
  }),
  makeTask({
    assigneeId: supervisor,
    bizStatus: '分管领导待初审',
    actionCode: 'first_audit',
    title: '退库待初审',
    projectName: '赵巷街道市政支路改造工程',
    projectCode: 'QP-TK-2026-005',
    sourceModule: 'delist',
    sourceBizId: 'dl-005',
    status: 'pending_review',
    receivedOffsetH: -7,
    dueOffsetH: 22,
    summary: '专员已提交退库申请，请初审。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '片区专员待审核',
    actionCode: 'final_audit',
    title: '退库待终审',
    projectName: '盈浦街道老旧小区改造工程',
    projectCode: 'QP-TK-2026-007',
    sourceModule: 'delist',
    sourceBizId: 'dl-007',
    status: 'pending_review',
    receivedOffsetH: -6,
    dueOffsetH: 16,
    summary: '分管领导初审已通过，请终审。'
  }),

  // —— 4 增补库 ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '退回',
    actionCode: 'modify',
    title: '增补库退回待改：业主与土地信息不全',
    projectName: '华新镇产业园区配套道路工程',
    projectCode: 'QP-ZB-2026-018',
    sourceModule: 'supplement-library',
    sourceBizId: 'sl-018',
    status: 'pending_dispose',
    receivedOffsetH: -30,
    dueOffsetH: -1,
    summary: '初审/终审退回，请补全信息后重新提交。'
  }),
  makeTask({
    assigneeId: supervisor,
    bizStatus: '分管领导待初审',
    actionCode: 'first_audit',
    title: '增补库待初审',
    projectName: '华新镇产业园区配套道路工程',
    projectCode: 'QP-ZB-2026-022',
    sourceModule: 'supplement-library',
    sourceBizId: 'sl-022',
    status: 'pending_review',
    receivedOffsetH: -11,
    dueOffsetH: 26,
    summary: '专员已提交增补申报，请初审。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '片区专员待审核',
    actionCode: 'final_audit',
    title: '增补库待终审',
    projectName: '香花桥街道市政道路贯通工程',
    projectCode: 'QP-ZB-2026-025',
    sourceModule: 'supplement-library',
    sourceBizId: 'sl-025',
    status: 'pending_review',
    receivedOffsetH: -5,
    dueOffsetH: 14,
    summary: '分管领导初审已通过，请终审。'
  }),

  // —— 5 领导交办 ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '待处理',
    actionCode: 'dispose',
    title: '领导交办待处置：请加快推进拿地事项办结',
    projectName: '中央商务区综合提升工程',
    projectCode: 'QP-JB-2026-021',
    sourceModule: 'leader-assign',
    sourceBizId: 'la-021',
    status: 'pending_dispose',
    receivedOffsetH: -12,
    dueOffsetH: 20,
    summary: '交办已下达，请尽快处置并反馈。'
  }),
  makeTask({
    assigneeId: specialist,
    bizStatus: '处理中',
    actionCode: 'dispose',
    title: '领导交办处理中：请加快推进公共服务设施提升事项办结',
    projectName: '徐泾镇公共服务设施提升项目',
    projectCode: 'QP-JB-2026-016',
    sourceModule: 'leader-assign',
    sourceBizId: 'la-016',
    status: 'pending_dispose',
    receivedOffsetH: -40,
    dueOffsetH: 8,
    summary: '事项处理中，请尽快提交处置结果。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '待审核',
    actionCode: 'audit',
    title: '领导交办待审核：请加快推进拿地事项办结',
    projectName: '中央商务区综合提升工程',
    projectCode: 'QP-JB-2026-021',
    sourceModule: 'leader-assign',
    sourceBizId: 'la-021-r',
    status: 'pending_review',
    receivedOffsetH: -3,
    dueOffsetH: 12,
    summary: '专员已提交处置反馈，请审核。'
  }),
  makeTask({
    assigneeId: cityLeader,
    bizStatus: '已完结待查阅',
    actionCode: 'read',
    title: '领导交办待查阅：请加快推进综合管线入地事项办结',
    projectName: '赵巷街道综合管线入地工程',
    projectCode: 'QP-JB-2026-019',
    sourceModule: 'leader-assign',
    sourceBizId: 'la-019',
    status: 'pending_read',
    receivedOffsetH: -6,
    dueOffsetH: 72,
    summary: '您发起的交办已完结，请查阅。'
  }),

  // —— 6 难题协调 ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '待处理',
    actionCode: 'dispose',
    title: '难题协调待处置：请加快推进商户临时通行保障事项办结',
    projectName: '淀山湖大道环境品质提升项目',
    projectCode: 'QP-NT-2026-006',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-006',
    status: 'pending_dispose',
    receivedOffsetH: -8,
    dueOffsetH: 40,
    summary: '终审已通过，请落实处置并填报结果。'
  }),
  makeTask({
    assigneeId: specialist,
    bizStatus: '处理中',
    actionCode: 'dispose',
    title: '难题协调处理中：请加快推进环境整治提升事项办结',
    projectName: '练塘镇环境整治提升项目',
    projectCode: 'QP-NT-2026-011',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-011-d',
    status: 'pending_dispose',
    receivedOffsetH: -25,
    dueOffsetH: 10,
    summary: '处置进行中，请尽快提交。'
  }),
  makeTask({
    assigneeId: specialist,
    bizStatus: '待完结',
    actionCode: 'confirm',
    title: '难题协调待确认：请加快推进雨污水管网改造事项办结',
    projectName: '夏阳街道雨污水管网改造工程',
    projectCode: 'QP-NT-2026-002',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-002',
    status: 'pending_confirm',
    receivedOffsetH: -5,
    dueOffsetH: 48,
    summary: '分管审核已通过，请专员确认完结。'
  }),
  makeTask({
    assigneeId: specialist,
    bizStatus: '退回',
    actionCode: 'modify',
    title: '难题协调退回待改：协调方案可行性论证不足',
    projectName: '白鹤镇综合管廊配套工程',
    projectCode: 'QP-NT-2026-007',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-007-back',
    status: 'pending_dispose',
    receivedOffsetH: -15,
    dueOffsetH: 20,
    summary: '审核退回，请修改后重新提交。'
  }),
  makeTask({
    assigneeId: supervisor,
    bizStatus: '待审核',
    actionCode: 'audit',
    title: '难题协调待初审：请加快推进环境整治提升事项办结',
    projectName: '练塘镇环境整治提升项目',
    projectCode: 'QP-NT-2026-011',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-011',
    status: 'pending_review',
    receivedOffsetH: -9,
    dueOffsetH: 30,
    summary: '专员已提交难题申请，请初审。'
  }),
  makeTask({
    assigneeId: supervisor,
    bizStatus: '待确认',
    actionCode: 'audit',
    title: '难题协调待确认：请加快推进综合管廊配套事项办结',
    projectName: '白鹤镇综合管廊配套工程',
    projectCode: 'QP-NT-2026-007',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-007',
    status: 'pending_review',
    receivedOffsetH: -4,
    dueOffsetH: 18,
    summary: '专员已提交处置结果，分管请审核（业务状态：待确认）。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '审核中',
    actionCode: 'audit',
    title: '难题协调审核中：请加快推进环境整治提升事项办结',
    projectName: '练塘镇环境整治提升项目',
    projectCode: 'QP-NT-2026-011',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-011-f',
    status: 'pending_review',
    receivedOffsetH: -6,
    dueOffsetH: 24,
    summary: '分管初审已通过，请片区终审。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '已完结待查阅',
    actionCode: 'read',
    title: '难题协调待查阅：请加快推进雨污水泵站改造事项办结',
    projectName: '香花桥街道雨污水泵站改造工程',
    projectCode: 'QP-NT-2026-004',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-004',
    status: 'pending_read',
    receivedOffsetH: -2,
    dueOffsetH: 96,
    summary: '专员已确认事项完结，请片区专员查阅。'
  }),
  makeTask({
    assigneeId: deptHead,
    bizStatus: '处理中',
    actionCode: 'superior_audit',
    title: '上级协调事项待审核：请加快推进商务区配套提升事项办结',
    projectName: '西虹桥商务区配套提升工程',
    projectCode: 'QP-NT-2026-020',
    sourceModule: 'problem-coord',
    sourceBizId: 'pc-020-sup',
    status: 'pending_review',
    tags: ['难题协调', '上级协调', '处理中'],
    receivedOffsetH: -10,
    dueOffsetH: 16,
    summary: '上级协调事项处理中，请部门一把手审核。'
  }),

  // —— 7 预警 ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '未销号',
    actionCode: 'alert_close',
    title: '预警未销号：形象进度连续两月滞后',
    projectName: '徐泾镇公共服务设施提升项目',
    projectCode: 'QP-YJ-2026-015',
    sourceModule: 'alert-management',
    sourceBizId: 'al-015',
    status: 'pending_dispose',
    receivedOffsetH: -18,
    dueOffsetH: 6,
    summary: '红/黄灯预警尚未销号，请销号或处置。'
  }),
  makeTask({
    assigneeId: specialist,
    bizStatus: '已销号未处置',
    actionCode: 'dispose',
    title: '预警已销号未处置：请补充处置措施',
    projectName: '重固镇水系连通工程',
    projectCode: 'QP-YJ-2026-009',
    sourceModule: 'alert-management',
    sourceBizId: 'al-009',
    status: 'pending_dispose',
    receivedOffsetH: -10,
    dueOffsetH: 30,
    summary: '已销号但仍需完成处置填报。'
  }),

  // —— 8/9 上级资金 / 形象进度填报 ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '本月未填报',
    actionCode: 'report',
    title: '项目上级资金信息填报：本月未填报',
    projectName: '重固镇水系连通工程',
    projectCode: 'QP-ZJ-2026-009',
    sourceModule: 'progress-fund',
    sourceBizId: 'pf-2026-08',
    status: 'pending_dispose',
    tags: ['项目上级资金信息填报', '本月未填报', '项目详情'],
    receivedOffsetH: -48,
    dueOffsetH: 72,
    summary: '本月上级资金信息尚未填报，请尽快填报（可从【项目详情】进入）。'
  }),
  makeTask({
    assigneeId: specialist,
    bizStatus: '本周未填报形象进度',
    actionCode: 'report',
    title: '项目形象进度信息填报：本周未填报形象进度',
    projectName: '重固镇水系连通工程',
    projectCode: 'QP-JDXX-2026-009',
    sourceModule: 'progress-schedule',
    sourceBizId: 'ps-2026-w32',
    status: 'pending_dispose',
    receivedOffsetH: -16,
    dueOffsetH: 36,
    summary: '本周形象进度尚未填报（2026-08-11至2026-08-15），请尽快填报。'
  }),
  makeTask({
    assigneeId: specialist,
    bizStatus: '本月未填报形象进度资金',
    actionCode: 'report',
    title: '项目形象进度信息填报：本月未填报形象进度资金',
    projectName: '重固镇水系连通工程',
    projectCode: 'QP-JDXX-2026-009',
    sourceModule: 'progress-schedule',
    sourceBizId: 'ps-2026-08-fund',
    status: 'pending_dispose',
    receivedOffsetH: -40,
    dueOffsetH: 48,
    summary: '本月形象进度资金尚未填报，请尽快填报。'
  }),

  // —— 10/11 催办提示（C1：pending_read 计入待查阅） ——
  makeTask({
    assigneeId: specialist,
    bizStatus: '催办提示',
    actionCode: 'urge_view',
    title: '协调催办提示：您有 2 条催办待关注',
    projectName: '淀山湖大道环境品质提升项目',
    projectCode: 'QP-NT-2026-006',
    sourceModule: 'urge-coord',
    sourceBizId: 'urge-c-001',
    status: 'pending_read',
    tags: ['协调催办', '催办提示'],
    urgeMeta: {
      urgeCount: 2,
      urgerName: '片区专员甲',
      urgedAt: formatDateTime(offsetMs(-3 * 3600 * 1000)),
      relatedItems: [
        {
          matter: '请加快推进商户临时通行保障事项办结',
          projectName: '淀山湖大道环境品质提升项目',
          projectCode: 'QP-NT-2026-006'
        },
        {
          matter: '请加快推进雨污水管网改造事项办结',
          projectName: '夏阳街道雨污水管网改造工程',
          projectCode: 'QP-NT-2026-002'
        }
      ]
    },
    receivedOffsetH: -3,
    dueOffsetH: 12,
    summary: '一般性催办提示：相关协调事项被催办，请尽快推进处置。'
  }),
  makeTask({
    assigneeId: supervisor,
    bizStatus: '催办提示',
    actionCode: 'urge_view',
    title: '协调催办提示：您有 1 条待审核催办',
    projectName: '练塘镇环境整治提升项目',
    projectCode: 'QP-NT-2026-011',
    sourceModule: 'urge-coord',
    sourceBizId: 'urge-c-002',
    status: 'pending_read',
    tags: ['协调催办', '催办提示'],
    urgeMeta: {
      urgeCount: 1,
      urgerName: '林雨桐',
      urgedAt: formatDateTime(offsetMs(-2 * 3600 * 1000)),
      relatedItems: [
        {
          matter: '请加快推进环境整治提升事项办结',
          projectName: '练塘镇环境整治提升项目',
          projectCode: 'QP-NT-2026-011'
        }
      ]
    },
    receivedOffsetH: -2,
    dueOffsetH: 24,
    summary: '一般性催办提示：有协调事项催您尽快完成审核。'
  }),
  makeTask({
    assigneeId: district,
    bizStatus: '催办提示',
    actionCode: 'urge_view',
    title: '交办催办提示：您有 1 条待审核催办',
    projectName: '中央商务区综合提升工程',
    projectCode: 'QP-JB-2026-021',
    sourceModule: 'urge-assign',
    sourceBizId: 'urge-a-001',
    status: 'pending_read',
    tags: ['交办催办', '催办提示'],
    urgeMeta: {
      urgeCount: 1,
      urgerName: '周启明',
      urgedAt: formatDateTime(offsetMs(-1 * 3600 * 1000)),
      relatedItems: [
        {
          matter: '请加快推进拿地事项办结',
          projectName: '中央商务区综合提升工程',
          projectCode: 'QP-JB-2026-021'
        }
      ]
    },
    receivedOffsetH: -1,
    dueOffsetH: 20,
    summary: '一般性催办提示：交办事项催您尽快完成审核。'
  }),
  makeTask({
    assigneeId: cityLeader,
    bizStatus: '催办提示',
    actionCode: 'urge_view',
    title: '交办催办提示：您发起的交办有超期关注',
    projectName: '赵巷街道综合管线入地工程',
    projectCode: 'QP-JB-2026-019',
    sourceModule: 'urge-assign',
    sourceBizId: 'urge-a-002',
    status: 'pending_read',
    tags: ['交办催办', '催办提示'],
    urgeMeta: {
      urgeCount: 1,
      urgerName: '系统',
      urgedAt: formatDateTime(offsetMs(-5 * 3600 * 1000)),
      relatedItems: [
        {
          matter: '请加快推进综合管线入地事项办结',
          projectName: '赵巷街道综合管线入地工程',
          projectCode: 'QP-JB-2026-019'
        }
      ]
    },
    receivedOffsetH: -5,
    dueOffsetH: 48,
    summary: '一般性催办提示：相关交办进展需您关注查阅。'
  }),
  makeTask({
    assigneeId: deptHead,
    bizStatus: '催办提示',
    actionCode: 'urge_view',
    title: '协调催办提示：上级协调事项催办',
    projectName: '西虹桥商务区配套提升工程',
    projectCode: 'QP-NT-2026-020',
    sourceModule: 'urge-coord',
    sourceBizId: 'urge-c-003',
    status: 'pending_read',
    tags: ['协调催办', '催办提示'],
    urgeMeta: {
      urgeCount: 1,
      urgerName: '片区专员甲',
      urgedAt: formatDateTime(offsetMs(-4 * 3600 * 1000)),
      relatedItems: [
        {
          matter: '请加快推进商务区配套提升事项办结',
          projectName: '西虹桥商务区配套提升工程',
          projectCode: 'QP-NT-2026-020'
        }
      ]
    },
    receivedOffsetH: -4,
    dueOffsetH: 16,
    summary: '一般性催办提示：上级协调事项请尽快审核。'
  })
];

function cloneTask(task: WorkbenchTask): WorkbenchTask {
  return {
    ...task,
    tags: [...task.tags],
    urgeMeta: task.urgeMeta
      ? {
          ...task.urgeMeta,
          relatedItems: task.urgeMeta.relatedItems?.map((item) => ({ ...item }))
        }
      : undefined
  };
}

function attachComputed(task: WorkbenchTask): WorkbenchTask {
  return { ...task, isOverdue: isOverdue(task.dueAt) };
}

function sortPending(a: WorkbenchTask, b: WorkbenchTask) {
  if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
  const ad = a.dueAt ? parseDateTime(a.dueAt).getTime() : Infinity;
  const bd = b.dueAt ? parseDateTime(b.dueAt).getTime() : Infinity;
  return ad - bd;
}

/** 每个来源事项 × 业务状态仅保留一条（演示去重） */
function dedupeByMatterStatus(list: WorkbenchTask[]) {
  const seen = new Set<string>();
  return list.filter((t) => {
    const key = `${t.sourceModule}|${t.bizStatus}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const workbenchStore = {
  listPendingByAssignee(assigneeId: string) {
    return dedupeByMatterStatus(
      records
        .filter((t) => t.assigneeId === assigneeId && t.status !== 'done')
        .map((t) => attachComputed(cloneTask(t)))
        .sort(sortPending)
    );
  },

  /** 管理员：全部未完成待办（事项×状态去重） */
  listAllPending() {
    return dedupeByMatterStatus(
      records
        .filter((t) => t.status !== 'done')
        .map((t) => attachComputed(cloneTask(t)))
        .sort(sortPending)
    );
  },

  getPendingCount(assigneeId: string) {
    // C1：含催办提示（pending_read）；与列表同口径去重
    return workbenchStore.listPendingByAssignee(assigneeId).length;
  },

  getAllPendingCount() {
    return workbenchStore.listAllPending().length;
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
    const nowStr = formatDateTime(new Date());
    const updated: WorkbenchTask = {
      ...task,
      status: 'done',
      updatedAt: nowStr,
      actionLabel: '已完成'
    };
    records[idx] = updated;
    return attachComputed(cloneTask(updated));
  }
};
