import type { WorkbenchTask, WorkbenchSourceModule, WorkbenchStatus } from '@/types/workbench';
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
  // 将 `YYYY-MM-DD HH:mm:ss` 转为可解析格式
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

const assigneeSpecialist = ROLE_PRESETS.projectSpecialist.id;
const assigneeDistrict = ROLE_PRESETS.districtSpecialist.id;
const assigneeCity = ROLE_PRESETS.cityLeader.id;
const assigneeAdmin = ROLE_PRESETS.admin.id;

const now = new Date();

const records: WorkbenchTask[] = [
  {
    id: 'wb-1',
    assigneeId: assigneeSpecialist,
    title: '增补初审待处置：确认申报材料完整性',
    projectName: '青浦新城综合提升工程',
    projectCode: 'QP-ZB-2026-018',
    sourceModule: 'supplement-library',
    sourceBizId: 'sl-1001',
    status: 'pending_dispose',
    tags: ['增补库'],
    receivedAt: formatDateTime(offsetMs(-36 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(-6 * 60 * 60 * 1000)), // overdue
    isOverdue: false,
    summary: '请核对：业主信息/建筑信息/资金信息/土地信息是否已填写完整。',
    actionLabel: actionLabelByStatus('pending_dispose'),
    updatedAt: formatDateTime(offsetMs(-30 * 60 * 60 * 1000))
  },
  {
    id: 'wb-2',
    assigneeId: assigneeSpecialist,
    title: '停复工待审核：复工情况确认',
    projectName: '淀山湖大道环境品质提升项目',
    projectCode: 'QP-SS-2026-004',
    sourceModule: 'work-suspend',
    sourceBizId: 'ws-2026-020',
    status: 'pending_review',
    tags: ['停复工'],
    receivedAt: formatDateTime(offsetMs(-10 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(12 * 60 * 60 * 1000)),
    isOverdue: false,
    summary: '请审核复工填报的起止日期与每日在岗人数统计。',
    actionLabel: actionLabelByStatus('pending_review'),
    updatedAt: formatDateTime(offsetMs(-8 * 60 * 60 * 1000))
  },
  {
    id: 'wb-3',
    assigneeId: assigneeSpecialist,
    title: '路线规划待确认：周六活动方案回执',
    projectName: '周六进行时 - 项目办督帮',
    projectCode: 'RP-2026-0602',
    sourceModule: 'route-planning',
    sourceBizId: 'act-2026-0602',
    status: 'pending_confirm',
    tags: ['路线规划'],
    receivedAt: formatDateTime(offsetMs(-5 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(36 * 60 * 60 * 1000)),
    isOverdue: false,
    summary: '请确认方案执行情况及预计达成节点是否一致。',
    actionLabel: actionLabelByStatus('pending_confirm'),
    updatedAt: formatDateTime(offsetMs(-3 * 60 * 60 * 1000))
  },
  {
    id: 'wb-4',
    assigneeId: assigneeSpecialist,
    title: '会议协调待查阅：会议方案文件',
    projectName: '中央商务区征收推进专题协调会',
    projectCode: 'MC-2026-0318',
    sourceModule: 'meeting-coordination',
    sourceBizId: 'mc1',
    status: 'pending_read',
    tags: ['会议协调'],
    receivedAt: formatDateTime(offsetMs(-2 * 60 * 60 * 1000)),
    dueAt: undefined,
    isOverdue: false,
    summary: '点击进入查看会议方案附件，确认已阅读。',
    actionLabel: actionLabelByStatus('pending_read'),
    updatedAt: formatDateTime(offsetMs(-2 * 60 * 60 * 1000))
  },

  // Other users (for demo)
  {
    id: 'wb-5',
    assigneeId: assigneeDistrict,
    title: '储备库终审待审核：项目入库材料复核',
    projectName: '要素争取项目',
    projectCode: 'QP-EL-2026-002',
    sourceModule: 'reserve-pool',
    sourceBizId: 'rp-final-2026-002',
    status: 'pending_review',
    tags: ['储备库审核'],
    receivedAt: formatDateTime(offsetMs(-20 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(18 * 60 * 60 * 1000)),
    isOverdue: false,
    summary: '复核申报要素、资金与土地信息，必要时退回补充。',
    actionLabel: actionLabelByStatus('pending_review'),
    updatedAt: formatDateTime(offsetMs(-18 * 60 * 60 * 1000))
  },
  {
    id: 'wb-6',
    assigneeId: assigneeDistrict,
    title: '考核评分待处置：确认年度汇总文件',
    projectName: '年度和季度评分',
    projectCode: 'AS-2026-YEAR',
    sourceModule: 'assessment-score',
    sourceBizId: 'as-annual-2026',
    status: 'pending_dispose',
    tags: ['考核评分'],
    receivedAt: formatDateTime(offsetMs(-70 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(-2 * 60 * 60 * 1000)), // overdue
    isOverdue: false,
    summary: '确认年度考核评分文档已正确生成并可下载存档。',
    actionLabel: actionLabelByStatus('pending_dispose'),
    updatedAt: formatDateTime(offsetMs(-60 * 60 * 60 * 1000))
  },
  {
    id: 'wb-7',
    assigneeId: assigneeCity,
    title: '预警管理待确认：待办事项回执',
    projectName: '重点风险事项汇总',
    projectCode: 'AL-2026-019',
    sourceModule: 'alert-management',
    sourceBizId: 'al-019',
    status: 'pending_confirm',
    tags: ['预警管理'],
    receivedAt: formatDateTime(offsetMs(-12 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(8 * 60 * 60 * 1000)),
    isOverdue: false,
    summary: '确认风险整改节点与汇报材料是否到位。',
    actionLabel: actionLabelByStatus('pending_confirm'),
    updatedAt: formatDateTime(offsetMs(-10 * 60 * 60 * 1000))
  },
  {
    id: 'wb-8',
    assigneeId: assigneeAdmin,
    title: '驾驶舱待查阅：关键任务统计报表',
    projectName: '攻坚任务',
    projectCode: 'CP-REPORT-01',
    sourceModule: 'cockpit',
    sourceBizId: 'cp-kpi-01',
    status: 'pending_read',
    tags: ['驾驶舱'],
    receivedAt: formatDateTime(offsetMs(-6 * 60 * 60 * 1000)),
    dueAt: undefined,
    isOverdue: false,
    summary: '查看驾驶舱关键任务状态，并标记已读。',
    actionLabel: actionLabelByStatus('pending_read'),
    updatedAt: formatDateTime(offsetMs(-6 * 60 * 60 * 1000))
  },
  {
    id: 'wb-9',
    assigneeId: assigneeSpecialist,
    title: '概算管理待审核：附件完整性检查',
    projectName: '概算单位随机抽取 - 项目预算',
    projectCode: 'BD-2026-007',
    sourceModule: 'budget-draw',
    sourceBizId: 'bd-7',
    status: 'pending_review',
    tags: ['概算管理'],
    receivedAt: formatDateTime(offsetMs(-28 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(6 * 60 * 60 * 1000)),
    isOverdue: false,
    summary: '检查抽取附件清单与上传文件是否齐全。',
    actionLabel: actionLabelByStatus('pending_review'),
    updatedAt: formatDateTime(offsetMs(-24 * 60 * 60 * 1000))
  },
  {
    id: 'wb-10',
    assigneeId: assigneeSpecialist,
    title: '项目管理待处置：补充说明与资料整理',
    projectName: '实施库台账调整',
    projectCode: 'PM-IMPL-2026-002',
    sourceModule: 'project-management',
    sourceBizId: 'pm-impl-002',
    status: 'pending_dispose',
    tags: ['项目管理'],
    receivedAt: formatDateTime(offsetMs(-3 * 60 * 60 * 1000)),
    dueAt: formatDateTime(offsetMs(48 * 60 * 60 * 1000)),
    isOverdue: false,
    summary: '对未完成项做说明并整理附件归档。',
    actionLabel: actionLabelByStatus('pending_dispose'),
    updatedAt: formatDateTime(offsetMs(-3 * 60 * 60 * 1000))
  }
];

function cloneTask(task: WorkbenchTask): WorkbenchTask {
  return { ...task };
}

function attachComputed(task: WorkbenchTask): WorkbenchTask {
  const overdue = isOverdue(task.dueAt);
  return {
    ...task,
    isOverdue: overdue
  };
}

export const workbenchStore = {
  listPendingByAssignee(assigneeId: string) {
    return records
      .filter((t) => t.assigneeId === assigneeId && t.status !== 'done')
      .map((t) => attachComputed(cloneTask(t)))
      .sort((a, b) => {
        // 逾期优先，其次截止时间越近越靠前
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        const ad = a.dueAt ? parseDateTime(a.dueAt).getTime() : Infinity;
        const bd = b.dueAt ? parseDateTime(b.dueAt).getTime() : Infinity;
        return ad - bd;
      });
  },

  getPendingCount(assigneeId: string) {
    return records.filter((t) => t.assigneeId === assigneeId && t.status !== 'done').length;
  },

  /** @throws Error */
  processTask(
    id: string,
    opts: { status: WorkbenchStatus; expectedUpdatedAt?: string }
  ): WorkbenchTask {
    const idx = records.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('待办不存在');

    const task = records[idx];
    if (opts.expectedUpdatedAt && task.updatedAt !== opts.expectedUpdatedAt) {
      throw new Error('任务状态已变更，请刷新');
    }

    // 简化 MVP：所有待办处理后均进入 done
    const updatedTask: WorkbenchTask = {
      ...task,
      status: 'done',
      updatedAt: formatDateTime(new Date())
    };
    records[idx] = updatedTask;

    return attachComputed(cloneTask(updatedTask));
  }
};

