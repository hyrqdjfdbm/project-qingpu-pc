export type WorkbenchSourceModule =
  | 'reserve-pool'
  | 'supplement-library'
  | 'project-management'
  | 'work-suspend'
  | 'route-planning'
  | 'meeting-coordination'
  | 'assessment-score'
  | 'alert-management'
  | 'cockpit'
  | 'budget-draw';

export type WorkbenchStatus =
  | 'pending_dispose'
  | 'pending_review'
  | 'pending_confirm'
  | 'pending_read'
  | 'done';

export interface WorkbenchTask {
  id: string;
  assigneeId: string;

  title: string;
  projectName?: string;
  projectCode?: string;
  sourceModule: WorkbenchSourceModule;
  sourceBizId: string;

  status: WorkbenchStatus;
  tags: string[];

  /** 任务接收时间：字符串格式 YYYY-MM-DD HH:mm:ss */
  receivedAt: string;
  /** 截止时间：字符串格式 YYYY-MM-DD HH:mm:ss（可为空） */
  dueAt?: string;

  /** 是否逾期（运行时计算） */
  isOverdue: boolean;
  summary?: string;
  /** 主操作按钮文案（去处置/去审核/去确认/去查阅） */
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

export const WORKBENCH_STATUS_LABEL: Record<
  Exclude<WorkbenchStatus, 'done'>,
  string
> = {
  pending_dispose: '待处置',
  pending_review: '待审核',
  pending_confirm: '待确认',
  pending_read: '待查阅'
};

export const WORKBENCH_STATUS_OPTIONS: Array<{ value: WorkbenchStatusFilter; label: string }> =
  [
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

export const WORKBENCH_SOURCE_MODULE_LABEL: Record<WorkbenchSourceModule, string> =
  {
    'reserve-pool': '储备库审核',
    'supplement-library': '增补库',
    'project-management': '项目管理',
    'work-suspend': '停复工',
    'route-planning': '路线规划',
    'meeting-coordination': '会议协调',
    'assessment-score': '考核评分',
    'alert-management': '预警管理',
    cockpit: '驾驶舱',
    'budget-draw': '概算管理'
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

