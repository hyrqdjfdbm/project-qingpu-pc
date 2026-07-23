/** 月度目标（年初填报） */
export interface MonthlyProgressTarget {
  month: number;
  /** 本月资金目标（万元） */
  fundTarget?: number;
  /** 本月形象进度目标 */
  imageProgressTarget?: string;
}

/** 形象进度完成情况 — 年度目标 */
export interface ProgressYearTarget {
  year: number;
  /** 年度资金目标（万元） */
  fundTarget: number;
  /** 年度形象进度目标描述 */
  imageProgressTarget: string;
  /** 各月目标 */
  monthlyTargets: MonthlyProgressTarget[];
  submittedAt: string;
  submittedBy: string;
}

/** 月度资金进度填报 */
export interface MonthlyFundReport {
  id: string;
  year: number;
  month: number;
  /** 本月完成资金（万元） */
  completedAmount: number;
  /** 累计完成资金（万元） */
  cumulativeAmount: number;
  remark?: string;
  reportedAt: string;
  reportedBy: string;
}

/** 月度形象进度完成填报（可由周报汇总或直接月度填报） */
export interface MonthlyImageReport {
  id: string;
  year: number;
  month: number;
  /** 本月形象进度完成情况 */
  content: string;
  /** 形象进度完成比例 0-100 */
  progressPercent?: number;
  reportedAt: string;
  reportedBy: string;
}

/** 周形象进度填报 */
export interface WeeklyImageReport {
  id: string;
  year: number;
  week: number;
  weekStart: string;
  weekEnd: string;
  content: string;
  progressPercent?: number;
  reportedAt: string;
  reportedBy: string;
}

export interface ImageProgressProject {
  id: string;
  projectName: string;
  projectCode: string;
  responsibleUnit: string;
  constructionUnit: string;
  totalInvestment: number;
  currentStage: string;
  yearTarget?: ProgressYearTarget;
  monthlyFundReports: MonthlyFundReport[];
  monthlyImageReports: MonthlyImageReport[];
  weeklyImageReports: WeeklyImageReport[];
  updatedAt: string;
}

export interface ImageProgressQuery {
  keyword?: string;
  year?: number;
}

export interface YearTargetPayload {
  projectId: string;
  year: number;
  fundTarget: number;
  imageProgressTarget: string;
  monthlyTargets: MonthlyProgressTarget[];
}

export interface MonthlyFundPayload {
  projectId: string;
  year: number;
  month: number;
  completedAmount: number;
  cumulativeAmount: number;
  remark?: string;
}

export interface MonthlyImagePayload {
  projectId: string;
  year: number;
  month: number;
  content: string;
  progressPercent?: number;
}

export interface WeeklyImagePayload {
  projectId: string;
  year: number;
  week: number;
  weekStart: string;
  weekEnd: string;
  content: string;
  progressPercent?: number;
}

export function getMonthLabel(year: number, month: number) {
  return `${year}年${month}月`;
}

export function getWeekLabel(year: number, week: number, weekStart: string, weekEnd: string) {
  return `${year}年第${week}周（${weekStart.slice(5)} ~ ${weekEnd.slice(5)}）`;
}

export function calcFundRate(completed?: number, target?: number) {
  if (target == null || target <= 0 || completed == null) return null;
  return Math.round((completed / target) * 1000) / 10;
}

export function createEmptyMonthlyTargets(): MonthlyProgressTarget[] {
  return Array.from({ length: 12 }, (_, i) => ({ month: i + 1 }));
}

export function getYearFundCompleted(project: ImageProgressProject, year: number) {
  const list = project.monthlyFundReports.filter((r) => r.year === year);
  if (!list.length) return 0;
  return Math.max(...list.map((r) => r.cumulativeAmount));
}

export function getYearFundTargetTotal(target?: ProgressYearTarget) {
  if (!target) return 0;
  const sum = target.monthlyTargets.reduce((s, m) => s + (m.fundTarget ?? 0), 0);
  return sum > 0 ? sum : target.fundTarget;
}

/** 获取 ISO 周信息（简化：按本地日期计算） */
export function getWeekInfo(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const yearStart = new Date(monday.getFullYear(), 0, 1);
  const week = Math.ceil(((monday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (x: Date) =>
    `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;

  return {
    year: monday.getFullYear(),
    week,
    weekStart: fmt(monday),
    weekEnd: fmt(sunday)
  };
}
