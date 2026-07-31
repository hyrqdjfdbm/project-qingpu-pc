/** 工作台来源业务（对齐待办事项清单 8 项） */
export type WorkbenchSourceModule =
  | 'node-audit'
  | 'planning-pool'
  | 'delist'
  | 'supplement-library'
  | 'leader-assign'
  | 'problem-coord'
  | 'alert-management'
  | 'progress-report';

export type WorkbenchStatus =
  | 'pending_dispose'
  | 'pending_review'
  | 'pending_confirm'
  | 'pending_read'
  | 'done';

/** 进度信息子类型：资金月报 / 进度周报 */
export type WorkbenchProgressKind = 'fund' | 'schedule';

/** 流程节点编码，对应清单序号 */
export type WorkbenchBizNode =
  | '1-1'
  | '1-2'
  | '2-1'
  | '2-2'
  | '2-3'
  | '3-1'
  | '3-2'
  | '3-3'
  | '4-1'
  | '4-2'
  | '4-3'
  | '5-1'
  | '5-2'
  | '5-3'
  | '6-1'
  | '6-2'
  | '6-3'
  | '6-4'
  | '6-5'
  | '6-6'
  | '6-7'
  | '7-1'
  | '8-1a'
  | '8-1b';

export const WORKBENCH_BIZ_NODE_LABEL: Record<WorkbenchBizNode, string> = {
  '1-1': '填报',
  '1-2': '审核',
  '2-1': '申报',
  '2-2': '初审',
  '2-3': '终审',
  '3-1': '申报',
  '3-2': '初审',
  '3-3': '终审',
  '4-1': '申报',
  '4-2': '初审',
  '4-3': '终审',
  '5-1': '处置',
  '5-2': '审核',
  '5-3': '查阅',
  '6-1': '申请',
  '6-2': '初审',
  '6-3': '终审',
  '6-4': '处置',
  '6-5': '审核',
  '6-6': '确认',
  '6-7': '查阅',
  '7-1': '处置',
  '8-1a': '资金填报',
  '8-1b': '进度填报'
};

export interface WorkbenchTask {
  id: string;
  assigneeId: string;
  bizNode: WorkbenchBizNode;
  bizNodeLabel: string;

  title: string;
  projectName?: string;
  projectCode?: string;
  sourceModule: WorkbenchSourceModule;
  sourceBizId: string;

  /** 仅 progress-report：资金月报 / 进度周报 */
  progressKind?: WorkbenchProgressKind;
  /** 交办发起领导 ID（5-3 查阅指派用） */
  initiatorId?: string;
  /** 难题终审片区专员 ID（6-7 查阅指派用） */
  finalAuditorId?: string;

  status: WorkbenchStatus;
  tags: string[];

  receivedAt: string;
  dueAt?: string;
  isOverdue: boolean;
  summary?: string;
  actionLabel: string;
  updatedAt: string;
}

export type WorkbenchStatusFilter =
  | 'all'
  | 'pending_dispose'
  | 'pending_review'
  | 'pending_confirm'
  | 'pending_read';

export type WorkbenchOverdueFilter = 'all' | 'overdue' | 'notOverdue';

export const WORKBENCH_STATUS_LABEL: Record<Exclude<WorkbenchStatus, 'done'>, string> = {
  pending_dispose: '待处置',
  pending_review: '待审核',
  pending_confirm: '待确认',
  pending_read: '待查阅'
};

export const WORKBENCH_STATUS_OPTIONS: Array<{ value: WorkbenchStatusFilter; label: string }> = [
  { value: 'all', label: '全部状态' },
  { value: 'pending_dispose', label: '待处置' },
  { value: 'pending_review', label: '待审核' },
  { value: 'pending_confirm', label: '待确认' },
  { value: 'pending_read', label: '待查阅' }
];

export const WORKBENCH_OVERDUE_OPTIONS: Array<{
  value: WorkbenchOverdueFilter;
  label: string;
}> = [
  { value: 'all', label: '全部' },
  { value: 'overdue', label: '仅逾期' },
  { value: 'notOverdue', label: '仅未逾期' }
];

export const WORKBENCH_SOURCE_MODULE_LABEL: Record<WorkbenchSourceModule, string> = {
  'node-audit': '项目节点审核',
  'planning-pool': '谋划库',
  delist: '退库',
  'supplement-library': '增补库',
  'leader-assign': '领导交办',
  'problem-coord': '难题协调',
  'alert-management': '预警管理',
  'progress-report': '项目进度信息'
};

export const WORKBENCH_SOURCE_MODULE_OPTIONS: Array<{
  value: WorkbenchSourceModule | 'all';
  label: string;
}> = [
  { value: 'all', label: '全部来源' },
  ...Object.entries(WORKBENCH_SOURCE_MODULE_LABEL).map(([k, v]) => ({
    value: k as WorkbenchSourceModule,
    label: v
  }))
];
