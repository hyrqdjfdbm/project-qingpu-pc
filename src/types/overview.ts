/** 进度指标：目标 / 已完成 / 完成率 */
export interface ProgressMetric {
  key: 'sign' | 'approve' | 'start' | 'warehouse';
  label: string;
  target: number;
  completed: number;
  rate: number;
  unit: string;
}

/** 责任单位分类 */
export type UnitCategory = 'street' | 'gov' | 'soe';

export const UNIT_CATEGORY_OPTIONS: { value: UnitCategory; label: string }[] = [
  { value: 'street', label: '街镇' },
  { value: 'gov', label: '政府机构' },
  { value: 'soe', label: '国企' }
];

/** 责任单位透视表行 */
export interface UnitPivotRow {
  unitName: string;
  projectCount: number;
  /** 总投资（亿元） */
  totalInvestment: number;
  /** 形象进度完成投资（亿元） */
  imageProgressInvestment: number;
  /** 争取资金（亿元） */
  securedFunds: number;
  startCount: number;
  warehouseCount: number;
  /** 骏马项目数 */
  gallopCount: number;
  /** 蜗牛项目数 */
  snailCount: number;
  redAlertCount: number;
  yellowAlertCount: number;
}

/** 经济分析：按责任单位 */
export interface UnitEconomicItem {
  unitName: string;
  /** 固定资产投资金额（亿元） */
  fixedInvestment: number;
  /** 形象进度完成金额（亿元） */
  imageProgressAmount: number;
}

export type ProgressPeriod = 'month' | 'quarter' | 'year';

/** 比率同比点：当年率 / 去年同期率 / 增减百分点 */
export interface RateYoYPoint {
  label: string;
  /** 当年比率（%） */
  currentRate: number;
  /** 去年同期比率（%） */
  previousRate: number;
  /** 同比增减百分点 */
  deltaPp: number;
}

/** 进度同比：开工率 / 入库率 / 投产率 */
export interface ProgressRateYoYSeries {
  start: RateYoYPoint[];
  warehouse: RateYoYPoint[];
  production: RateYoYPoint[];
}

export interface ProjectOverviewDashboard {
  /** 统计年份（当年） */
  year: number;
  progressOverview: ProgressMetric[];
  unitPivotByCategory: Record<UnitCategory, UnitPivotRow[]>;
  economicAnalysisByCategory: Record<UnitCategory, UnitEconomicItem[]>;
  progressRateYoY: {
    month: ProgressRateYoYSeries;
    quarter: ProgressRateYoYSeries;
    year: ProgressRateYoYSeries;
  };
  /** 进度同比分析2：独立三图 + 月/季/年切换 */
  progressRateYoY2: ProgressYoY2Data;
}

/** 进度同比分析2：指标定义文案 */
export const PROGRESS_RATE_DEFINITIONS = [
  { key: 'start', label: '开工率', formula: '已开工项目数 ÷ 应开工项目数 × 100%' },
  { key: 'warehouse', label: '入库率', formula: '已入库项目数 ÷ 计划入库项目数 × 100%' },
  { key: 'production', label: '投产率', formula: '已投产项目数 ÷ 应投产项目数 × 100%' }
] as const;

export type ProgressYoY2MetricKey = 'start' | 'warehouse' | 'production';

export interface ProgressYoY2MetricBlock {
  key: ProgressYoY2MetricKey;
  label: string;
  /** 当期汇总比率（用于顶部卡片） */
  latestCurrentRate: number;
  latestPreviousRate: number;
  latestDeltaPp: number;
  points: RateYoYPoint[];
}

export interface ProgressYoY2PeriodBundle {
  /** 当期年份 */
  currentYear: number;
  /** 同期年份 */
  previousYear: number;
  /** 口径说明 */
  scopeNote: string;
  metrics: ProgressYoY2MetricBlock[];
}

export interface ProgressYoY2Data {
  month: ProgressYoY2PeriodBundle;
  quarter: ProgressYoY2PeriodBundle;
  year: ProgressYoY2PeriodBundle;
}

/** 兼容旧概览统计（库分布等） */
export interface OverviewStats {
  totalProjects: number;
  pendingAudit: number;
  inImplementation: number;
  totalInvestment: number;
  byPoolStage: { stage: string; label: string; count: number }[];
  byStreetTown: { name: string; count: number }[];
}
