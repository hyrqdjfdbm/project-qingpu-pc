/** 月度形象进度记录（含目标与实际完成） */
export interface MonthlyImageProgress {
  month: number;
  targetAmount?: number;
  actualAmount?: number;
  remark?: string;
  /** 代建单位月度填报时间 */
  reportedAt?: string;
}

/** 形象进度目标 */
export interface ImageProgressTarget {
  year: number;
  annualTarget?: number;
  monthlyTargets: MonthlyImageProgress[];
  /** 代建单位年初目标填报时间 */
  targetSubmittedAt?: string;
  targetSubmittedBy?: string;
}

/** 重大攻坚项目 */
export interface KeyProjectItem {
  id: string;
  projectName: string;
  projectCode: string;
  responsibleUnit: string;
  /** 代建单位 */
  agencyUnit: string;
  totalInvestment: number;
  currentStage: string;
  imageProgress: ImageProgressTarget;
  updatedAt: string;
}

export interface KeyProjectQuery {
  keyword?: string;
  responsibleUnit?: string;
  year?: number;
}

export interface ImageProgressTargetPayload {
  year: number;
  annualTarget: number;
  monthlyTargets: { month: number; targetAmount: number }[];
}

export interface MonthlyCompletionPayload {
  year: number;
  month: number;
  actualAmount: number;
  remark?: string;
}

export function calcCompletionRate(actual?: number, target?: number) {
  if (target == null || target <= 0 || actual == null) return null;
  return Math.round((actual / target) * 1000) / 10;
}

export function getMonthLabel(year: number, month: number) {
  return `${year}年第${month}月`;
}

export function getYearActualTotal(progress: ImageProgressTarget) {
  return progress.monthlyTargets.reduce((sum, item) => sum + (item.actualAmount ?? 0), 0);
}

export function getYearTargetTotal(progress: ImageProgressTarget) {
  return progress.monthlyTargets.reduce((sum, item) => sum + (item.targetAmount ?? 0), 0);
}

export function createEmptyMonthlyTargets(year: number): MonthlyImageProgress[] {
  return Array.from({ length: 12 }, (_, i) => ({ month: i + 1 }));
}
