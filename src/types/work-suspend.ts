/** 节假日类型 */
export type HolidayType = 'mayDay' | 'nationalDay' | 'springFestival';

export const HOLIDAY_TYPE_LABEL: Record<HolidayType, string> = {
  mayDay: '五一',
  nationalDay: '国庆',
  springFestival: '春节'
};

export const HOLIDAY_TYPE_OPTIONS = Object.entries(HOLIDAY_TYPE_LABEL).map(([value, label]) => ({
  value,
  label
}));

/** 填报流程状态 */
export type WorkSuspendStatus =
  | 'pendingStop'
  | 'pendingDaily'
  | 'pendingResume'
  | 'completed';

export const WORK_SUSPEND_STATUS_LABEL: Record<WorkSuspendStatus, string> = {
  pendingStop: '待填报停工',
  pendingDaily: '待填报在岗人数',
  pendingResume: '待填报复工',
  completed: '已完成'
};

export function getWorkSuspendStatusColor(status: WorkSuspendStatus) {
  const map: Record<WorkSuspendStatus, string> = {
    pendingStop: 'default',
    pendingDaily: 'processing',
    pendingResume: 'warning',
    completed: 'success'
  };
  return map[status];
}

/** 停工期间每日在岗人数 */
export interface DailyStaffRecord {
  date: string;
  count: number;
}

export interface WorkSuspendItem {
  id: string;
  year: number;
  holiday: HolidayType;
  projectName: string;
  projectCode: string;
  responsibleUnit: string;
  location: string;
  /** 是否停工 */
  isSuspended?: boolean;
  suspendStartDate?: string;
  suspendEndDate?: string;
  stopReportedAt?: string;
  stopReportedBy?: string;
  /** 停工期间每日在岗 */
  dailyStaff: DailyStaffRecord[];
  dailyReportedAt?: string;
  dailyReportedBy?: string;
  /** 是否复工 */
  isResumed?: boolean;
  resumeDate?: string;
  resumeReportedAt?: string;
  resumeReportedBy?: string;
  status: WorkSuspendStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkSuspendQuery {
  year?: number;
  holiday?: HolidayType;
  projectName?: string;
  responsibleUnit?: string;
  /** 是否停工；未填报的不匹配 true/false */
  isSuspended?: boolean;
  /** 是否复工；未填报的不匹配 true/false */
  isResumed?: boolean;
}

export interface StopReportPayload {
  isSuspended: boolean;
  suspendStartDate?: string;
  suspendEndDate?: string;
}

export interface DailyStaffPayload {
  dailyStaff: DailyStaffRecord[];
}

export interface ResumeReportPayload {
  isResumed: boolean;
  resumeDate?: string;
}
