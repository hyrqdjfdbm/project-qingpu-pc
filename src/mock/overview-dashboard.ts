import type {
  ProgressRateYoYSeries,
  ProgressYoY2Data,
  ProgressYoY2MetricBlock,
  ProgressYoY2PeriodBundle,
  ProjectOverviewDashboard,
  RateYoYPoint,
  UnitCategory,
  UnitEconomicItem,
  UnitPivotRow
} from '@/types/overview';

const CURRENT_YEAR = 2026;
/** 进度同比分析2 口径年份：当期 2026 vs 同期 2025 */
const YOY2_YEAR = 2026;

const UNIT_NAMES: Record<UnitCategory, string[]> = {
  street: [
    '徐泾镇',
    '华新镇',
    '赵巷镇',
    '重固镇',
    '白鹤镇',
    '朱家角镇',
    '练塘镇',
    '金泽镇',
    '夏阳街道',
    '盈浦街道',
    '香花桥街道',
    '工业园区'
  ],
  gov: ['区发改委', '区经信委', '区建管委', '区科委', '区商务委', '区农业农村委', '区文旅局', '区卫健委'],
  soe: [
    '青浦新城集团',
    '青浦城投集团',
    '青浦水务集团',
    '青浦交通投资公司',
    '青浦产业投资公司',
    '淀山湖建设发展公司'
  ]
};

function rate(completed: number, target: number) {
  if (target <= 0) return 0;
  return Math.round((completed / target) * 1000) / 10;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function buildRows(names: string[], baseSeed: number): UnitPivotRow[] {
  return names.map((unitName, index) => {
    const f = baseSeed + index * 1.7;
    return {
      unitName,
      projectCount: Math.round(8 + f),
      totalInvestment: round1(12 + f * 2.4),
      imageProgressInvestment: round1(7 + f * 1.5),
      securedFunds: round1(1.5 + f * 0.4),
      startCount: Math.round(4 + f * 0.6),
      warehouseCount: Math.round(3 + f * 0.5),
      gallopCount: Math.round(1 + (index % 4)),
      snailCount: index % 3,
      redAlertCount: index % 4,
      yellowAlertCount: (index % 5) + 1
    };
  });
}

function buildEconomic(rows: UnitPivotRow[]): UnitEconomicItem[] {
  return rows.map((row) => ({
    unitName: row.unitName,
    fixedInvestment: round1(row.totalInvestment * 0.72),
    imageProgressAmount: row.imageProgressInvestment
  }));
}

function makeRatePoint(label: string, currentRate: number, previousRate: number): RateYoYPoint {
  return {
    label,
    currentRate: round1(currentRate),
    previousRate: round1(previousRate),
    deltaPp: round1(currentRate - previousRate)
  };
}

/** 月度比率 mock：开工 / 入库 / 投产 */
function buildMonthRates(current: number[], previous: number[]): RateYoYPoint[] {
  return current.map((c, i) => makeRatePoint(`${i + 1}月`, c, previous[i]));
}

function aggregateQuarter(monthly: RateYoYPoint[]): RateYoYPoint[] {
  return [0, 1, 2, 3].map((q) => {
    const slice = monthly.slice(q * 3, q * 3 + 3);
    const currentRate = round1(slice.reduce((s, p) => s + p.currentRate, 0) / slice.length);
    const previousRate = round1(slice.reduce((s, p) => s + p.previousRate, 0) / slice.length);
    return makeRatePoint(`第${q + 1}季度`, currentRate, previousRate);
  });
}

function aggregateYear(monthly: RateYoYPoint[]): RateYoYPoint[] {
  const currentRate = round1(monthly.reduce((s, p) => s + p.currentRate, 0) / monthly.length);
  const previousRate = round1(monthly.reduce((s, p) => s + p.previousRate, 0) / monthly.length);
  return [makeRatePoint('全年', currentRate, previousRate)];
}

function buildRateSeries(
  currentMonth: number[],
  previousMonth: number[]
): { month: RateYoYPoint[]; quarter: RateYoYPoint[]; year: RateYoYPoint[] } {
  const month = buildMonthRates(currentMonth, previousMonth);
  return {
    month,
    quarter: aggregateQuarter(month),
    year: aggregateYear(month)
  };
}

const startCurrent = [42, 48, 55, 58, 62, 68, 72, 70, 66, 60, 56, 52];
const startPrevious = [38, 44, 50, 53, 57, 61, 65, 64, 60, 55, 51, 48];
const warehouseCurrent = [35, 40, 46, 50, 54, 58, 61, 59, 55, 50, 46, 42];
const warehousePrevious = [32, 36, 42, 45, 49, 52, 55, 54, 50, 46, 42, 39];
const productionCurrent = [18, 22, 26, 30, 34, 38, 42, 45, 43, 40, 36, 32];
const productionPrevious = [15, 19, 23, 27, 30, 34, 37, 40, 38, 35, 32, 29];

function metricBlock(
  key: ProgressYoY2MetricBlock['key'],
  label: string,
  points: RateYoYPoint[]
): ProgressYoY2MetricBlock {
  const latest = points[points.length - 1];
  return {
    key,
    label,
    latestCurrentRate: latest.currentRate,
    latestPreviousRate: latest.previousRate,
    latestDeltaPp: latest.deltaPp,
    points
  };
}

function buildYoY2MonthBundle(): ProgressYoY2PeriodBundle {
  const startPts = buildMonthRates(startCurrent, startPrevious);
  const warehousePts = buildMonthRates(warehouseCurrent, warehousePrevious);
  const productionPts = buildMonthRates(productionCurrent, productionPrevious);
  return {
    currentYear: YOY2_YEAR,
    previousYear: YOY2_YEAR - 1,
    scopeNote: `数据口径：${YOY2_YEAR}年各月开工率/入库率/投产率 vs ${YOY2_YEAR - 1}年同月`,
    metrics: [
      metricBlock('start', '开工率', startPts),
      metricBlock('warehouse', '入库率', warehousePts),
      metricBlock('production', '投产率', productionPts)
    ]
  };
}

function buildYoY2QuarterBundle(): ProgressYoY2PeriodBundle {
  const quarterLabels = ['一季度', '二季度', '三季度', '四季度'];
  const startPts = aggregateQuarter(buildMonthRates(startCurrent, startPrevious)).map((p, i) => ({
    ...p,
    label: quarterLabels[i]
  }));
  const warehousePts = aggregateQuarter(buildMonthRates(warehouseCurrent, warehousePrevious)).map(
    (p, i) => ({ ...p, label: quarterLabels[i] })
  );
  const productionPts = aggregateQuarter(buildMonthRates(productionCurrent, productionPrevious)).map(
    (p, i) => ({ ...p, label: quarterLabels[i] })
  );
  return {
    currentYear: YOY2_YEAR,
    previousYear: YOY2_YEAR - 1,
    scopeNote: `数据口径：${YOY2_YEAR}年各季度开工率/入库率/投产率 vs ${YOY2_YEAR - 1}年同季`,
    metrics: [
      metricBlock('start', '开工率', startPts),
      metricBlock('warehouse', '入库率', warehousePts),
      metricBlock('production', '投产率', productionPts)
    ]
  };
}

function buildYoY2YearBundle(): ProgressYoY2PeriodBundle {
  /** 近5个年度：每年当期率 vs 上一年 */
  const years = [YOY2_YEAR - 4, YOY2_YEAR - 3, YOY2_YEAR - 2, YOY2_YEAR - 1, YOY2_YEAR];
  const startRates = [48, 52, 56, 60, 64];
  const warehouseRates = [40, 44, 48, 51, 55];
  const productionRates = [28, 31, 34, 37, 41];
  const prevStart = [44, 48, 52, 56, 60];
  const prevWarehouse = [36, 40, 44, 48, 51];
  const prevProduction = [25, 28, 31, 34, 37];

  const toPoints = (curr: number[], prev: number[]) =>
    years.map((y, i) => makeRatePoint(`${y}年`, curr[i], prev[i]));

  const startPts = toPoints(startRates, prevStart);
  const warehousePts = toPoints(warehouseRates, prevWarehouse);
  const productionPts = toPoints(productionRates, prevProduction);

  return {
    currentYear: YOY2_YEAR,
    previousYear: YOY2_YEAR - 1,
    scopeNote: `数据口径：近5年各年度比率；柱体为当年与上年并排，重点关注 ${YOY2_YEAR}年 vs ${YOY2_YEAR - 1}年`,
    metrics: [
      metricBlock('start', '开工率', startPts),
      metricBlock('warehouse', '入库率', warehousePts),
      metricBlock('production', '投产率', productionPts)
    ]
  };
}

function buildProgressRateYoY2(): ProgressYoY2Data {
  return {
    month: buildYoY2MonthBundle(),
    quarter: buildYoY2QuarterBundle(),
    year: buildYoY2YearBundle()
  };
}

export function getProjectOverviewDashboard(): ProjectOverviewDashboard {
  const unitPivotByCategory: Record<UnitCategory, UnitPivotRow[]> = {
    street: buildRows(UNIT_NAMES.street, 3),
    gov: buildRows(UNIT_NAMES.gov, 6),
    soe: buildRows(UNIT_NAMES.soe, 8)
  };

  const start = buildRateSeries(startCurrent, startPrevious);
  const warehouse = buildRateSeries(warehouseCurrent, warehousePrevious);
  const production = buildRateSeries(productionCurrent, productionPrevious);

  const pack = (period: 'month' | 'quarter' | 'year'): ProgressRateYoYSeries => ({
    start: start[period],
    warehouse: warehouse[period],
    production: production[period]
  });

  return {
    year: CURRENT_YEAR,
    progressOverview: [
      { key: 'sign', label: '签约进度', target: 48, completed: 36, rate: rate(36, 48), unit: '个' },
      { key: 'approve', label: '立项进度', target: 42, completed: 31, rate: rate(31, 42), unit: '个' },
      { key: 'start', label: '开工进度', target: 60, completed: 45, rate: rate(45, 60), unit: '个' },
      {
        key: 'warehouse',
        label: '入库进度',
        target: 55,
        completed: 41,
        rate: rate(41, 55),
        unit: '个'
      }
    ],
    unitPivotByCategory,
    economicAnalysisByCategory: {
      street: buildEconomic(unitPivotByCategory.street),
      gov: buildEconomic(unitPivotByCategory.gov),
      soe: buildEconomic(unitPivotByCategory.soe)
    },
    progressRateYoY: {
      month: pack('month'),
      quarter: pack('quarter'),
      year: pack('year')
    },
    progressRateYoY2: buildProgressRateYoY2()
  };
}
