/** 工作台来源业务 */
export type WorkbenchSourceModule =
  | 'node-audit'
  | 'planning-pool'
  | 'delist'
  | 'supplement-library'
  | 'leader-assign'
  | 'problem-coord'
  | 'alert-management'
  | 'monitor-response'
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
  | 'acknowledge'
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
  acknowledge: '去阅知',
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
  /** 预警类：动作后的类型标签，如「红灯-超期未农转用批复」 */
  subtypeTag?: string;
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
  'alert-management': '预警信息',
  'monitor-response': '预警信息',
  'urge-coord': '协调催办',
  'urge-assign': '交办催办'
};

/** 来源筛选：同名来源合并为一项（红黄灯 / 监测响应均展示为「预警信息」） */
export const WORKBENCH_SOURCE_MODULE_OPTIONS: Array<{
  value: WorkbenchSourceModule | 'all';
  label: string;
}> = (() => {
  const seen = new Set<string>();
  const unique = Object.entries(WORKBENCH_SOURCE_MODULE_LABEL).filter(([, label]) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
  return [
    { value: 'all', label: '全部来源' },
    ...unique.map(([k, v]) => ({
      value: k as WorkbenchSourceModule,
      label: v
    }))
  ];
})();

export function matchesWorkbenchSourceFilter(
  sourceModule: WorkbenchSourceModule,
  filter: WorkbenchSourceModule | 'all'
) {
  if (filter === 'all') return true;
  return WORKBENCH_SOURCE_MODULE_LABEL[sourceModule] === WORKBENCH_SOURCE_MODULE_LABEL[filter];
}
