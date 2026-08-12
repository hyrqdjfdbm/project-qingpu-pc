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

/**
 * 每日在岗人数记录
 * - cumulativeCount：累计到岗人数
 * - todayCount：当日到岗人数
 */
export interface DailyStaffRecord {
  date: string;
  cumulativeCount: number;
  todayCount: number;
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
  /** 每日在岗历史（未复工期间持续填报） */
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

/** 未复工时均可填报在岗人数（与是否停工无关） */
export function canReportDailyStaff(item: WorkSuspendItem) {
  if (item.status === 'pendingStop' || item.status === 'completed') return false;
  if (item.isResumed === true) return false;
  return item.status === 'pendingDaily' || item.status === 'pendingResume';
}
