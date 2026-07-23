/** 路线规划活动类型 */
export type RouteActivityKind = 'saturday' | 'cityLeader' | 'projectOffice';

/** 市领导层级 */
export type LeaderLevel = 'standing' | 'mayor' | 'secretary';

export const LEADER_LEVEL_LABEL: Record<LeaderLevel, string> = {
  standing: '常务',
  mayor: '市长',
  secretary: '书记'
};

export const ROUTE_ACTIVITY_KIND_LABEL: Record<RouteActivityKind, string> = {
  saturday: '周六进行时',
  cityLeader: '市领导督帮',
  projectOffice: '项目办督帮'
};

/** 事项处置流程节点 */
export interface RouteIssueProcessStep {
  id: string;
  /** 节点标题 */
  title: string;
  /** 办理人 */
  operator: string;
  /** 办理单位 */
  unit: string;
  /** 办理时间 */
  time: string;
  /** 办理意见 / 说明 */
  remark: string;
  /** 是否当前节点 */
  current?: boolean;
}

export type RouteIssueStatus = 'pending' | 'processing' | 'done';

export const ROUTE_ISSUE_STATUS_LABEL: Record<RouteIssueStatus, string> = {
  pending: '待处置',
  processing: '处置中',
  done: '已办结'
};

/** 项目关联难题事项 */
export interface RouteProjectProblem {
  id: string;
  /** 责任单位 */
  responsibleUnit: string;
  /** 协调内容 */
  coordinateContent: string;
  /** 指派单位 */
  assignUnit: string;
  /** 事项状态 */
  status: RouteIssueStatus;
  /** 登记人 */
  reporter: string;
  /** 登记时间 */
  reportedAt: string;
  /** 处置流程 */
  processSteps: RouteIssueProcessStep[];
}

/** 项目关联交办事项 */
export interface RouteProjectTask {
  id: string;
  /** 交办领导 */
  assignLeader: string;
  /** 交办内容 */
  assignContent: string;
  /** 责任主体 */
  responsibleEntity: string;
  /** 事项状态 */
  status: RouteIssueStatus;
  /** 登记人 */
  reporter: string;
  /** 登记时间 */
  reportedAt: string;
  /** 处置流程 */
  processSteps: RouteIssueProcessStep[];
}

/** 可关联项目（含难题、交办） */
export interface RouteRelateProject {
  id: string;
  projectName: string;
  projectCode: string;
  problems: RouteProjectProblem[];
  tasks: RouteProjectTask[];
}

/** 活动中勾选的关联项目明细 */
export interface ActivityProjectLink {
  projectId: string;
  projectName: string;
  /** 本次勾选的难题 id */
  selectedProblemIds: string[];
  /** 本次勾选的交办事项 id */
  selectedTaskIds: string[];
  /** 该项目走访情况 */
  situation: string;
  /** 项目办督帮：该项目现场图片 */
  siteImages?: RouteActivityFile[];
}

export interface RouteActivityFile {
  name: string;
  size: number;
  url?: string;
}

export interface RouteActivityRecord {
  id: string;
  kind: RouteActivityKind;
  /** 活动名称（周六进行时为活动主题名称） */
  activityName: string;
  /** 方案附件 */
  schemeFiles: RouteActivityFile[];
  /** 走访时间 */
  visitTime: string;
  /** 关联项目（可多个） */
  projects: ActivityProjectLink[];
  /** 市领导督帮：领导层级 */
  leaderLevel?: LeaderLevel;
  createdAt: string;
  updatedAt: string;
}

export interface RouteActivityFormPayload {
  kind: RouteActivityKind;
  activityName: string;
  schemeFiles: RouteActivityFile[];
  visitTime: string;
  projects: ActivityProjectLink[];
  leaderLevel?: LeaderLevel;
}

export interface RouteActivityQuery {
  kind: RouteActivityKind;
  keyword?: string;
}
