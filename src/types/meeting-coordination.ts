/** 会议协调 — 勾选的交办事项（含进展） */
export interface MeetingTaskItem {
  taskId: string;
  assignLeader: string;
  assignContent: string;
  responsibleEntity: string;
  /** 目前进展 */
  progress: string;
  /** 预计完成时间 */
  expectedCompleteTime?: string;
  /** 实际完成时间 */
  actualCompleteTime?: string;
}

/** 会议中关联的项目及勾选交办 */
export interface MeetingProjectLink {
  projectId: string;
  projectName: string;
  tasks: MeetingTaskItem[];
}

export interface MeetingSchemeFile {
  name: string;
  size: number;
  url?: string;
}

export interface MeetingCoordinationRecord {
  id: string;
  /** 会议内容 */
  meetingContent: string;
  /** 会议时间 */
  meetingTime: string;
  /** 方案 */
  schemeFiles: MeetingSchemeFile[];
  /** 协调层级（自由填写） */
  coordinationLevel: string;
  /** 关联项目（含勾选的交办事项） */
  projects: MeetingProjectLink[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingCoordinationFormPayload {
  meetingContent: string;
  meetingTime: string;
  schemeFiles: MeetingSchemeFile[];
  coordinationLevel: string;
  projects: MeetingProjectLink[];
}

export interface MeetingCoordinationQuery {
  keyword?: string;
}
