/** 工作台来源业务（V1.2：11 类） */
export type WorkbenchSourceModule =
  | 'node-audit'
  | 'planning-pool'
  | 'delist'
  | 'supplement-library'
  | 'leader-assign'
  | 'problem-coord'
  | 'alert-management'
  | 'progress-fund'
  | 'progress-schedule'
  | 'urge-coord'
  | 'urge-assign';

export type WorkbenchStatus =
  | 'pending_dispose'
  | 'pending_review'
  | 'pending_confirm'
  | 'pending_read'
  | 'done';

/** 卡片主动作（截图【】内） */
export type WorkbenchActionCode =
  | 'report'
  | 'modify'
  | 'first_audit'
  | 'final_audit'
  | 'dispose'
  | 'audit'
  | 'confirm'
  | 'read'
  | 'urge_view'
  | 'alert_close'
  | 'superior_audit';

export const WORKBENCH_ACTION_LABEL: Record<WorkbenchActionCode, string> = {
  report: '去填报',
  modify: '去修改',
  first_audit: '去初审',
  final_audit: '去终审',
  dispose: '去处置',
  audit: '去审核',
  confirm: '去确认',
  read: '去查阅',
  urge_view: '查看处置',
  alert_close: '去销号/处置',
  superior_audit: '去审核'
};

export interface WorkbenchUrgeRelatedItem {
  /** 关联事项内容 */
  matter: string;
  projectName: string;
  projectCode?: string;
}

export interface WorkbenchUrgeMeta {
  urgeCount: number;
  urgerName?: string;
  urgedAt?: string;
  /** 催办关联：事项与项目成组，多条分开展示 */
  relatedItems?: WorkbenchUrgeRelatedItem[];
}

export interface WorkbenchTask {
  id: string;
  assigneeId: string;
  /** 业务状态原文，如「分管领导待初审」「待完结」 */
  bizStatus: string;
  actionCode: WorkbenchActionCode;
  actionLabel: string;

  title: string;
  projectName?: string;
  projectCode?: string;
  /** 项目节点审核：处置的具体节点名称 */
  nodeName?: string;
  /** 催办等：关联事项内容 */
  relatedMatter?: string;
  sourceModule: WorkbenchSourceModule;
  sourceBizId: string;

  status: WorkbenchStatus;
  tags: string[];
  /** 催办类 */
  urgeMeta?: WorkbenchUrgeMeta;

  receivedAt: string;
  dueAt?: string;
  isOverdue: boolean;
  summary?: string;
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
  'progress-fund': '项目上级资金信息填报',
  'progress-schedule': '项目形象进度信息填报',
  'urge-coord': '协调催办',
  'urge-assign': '交办催办'
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
