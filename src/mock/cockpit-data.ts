export interface CockpitKpi {
  label: string;
  value: number;
  unit: string;
}

export interface MapRegion {
  name: string;
  value: number;
  x: number;
  y: number;
}

export interface ProgressStage {
  name: string;
  rate: number;
  count: number;
}

export interface LagItem {
  rank: number;
  name: string;
  rate: number;
}

export interface KeyTaskData {
  newProjectTotal: number;
  problemProjectTotal: number;
  newNotStarted: number;
  newStarted: number;
  imageProgressInvestment: number;
  problemItemTotal: number;
  resolvedProblemItems: number;
  unresolvedProblemItems: number;
}

export const economicKpis: CockpitKpi[] = [
  { label: '项目总数', value: 128, unit: '个' },
  { label: '总投资额', value: 86.5, unit: '亿元' },
  { label: '在建项目', value: 42, unit: '个' },
  { label: '待审核', value: 8, unit: '个' },
  { label: '已入库', value: 76, unit: '个' },
  { label: '街镇覆盖', value: 12, unit: '个' },
  { label: '协调事项', value: 10, unit: '项' },
  { label: '年度目标完成', value: 68, unit: '%' }
];

export const mapRegions: MapRegion[] = [
  { name: '朱家角镇', value: 12, x: 18, y: 72 },
  { name: '练塘镇', value: 8, x: 42, y: 88 },
  { name: '金泽镇', value: 15, x: 8, y: 48 },
  { name: '赵巷镇', value: 11, x: 62, y: 38 },
  { name: '徐泾镇', value: 22, x: 78, y: 28 },
  { name: '华新镇', value: 18, x: 58, y: 22 },
  { name: '重固镇', value: 9, x: 48, y: 32 },
  { name: '白鹤镇', value: 7, x: 72, y: 52 },
  { name: '夏阳街道', value: 14, x: 38, y: 48 },
  { name: '盈浦街道', value: 16, x: 32, y: 58 },
  { name: '香花桥街道', value: 13, x: 52, y: 58 },
  { name: '工业园区', value: 20, x: 68, y: 42 }
];

export const progressStages: ProgressStage[] = [
  { name: '竣工投产', rate: 12, count: 5 },
  { name: '开工建设', rate: 38, count: 16 },
  { name: '取得土地', rate: 56, count: 24 },
  { name: '完成立项', rate: 72, count: 31 },
  { name: '方案形成', rate: 85, count: 36 },
  { name: '谋划储备', rate: 100, count: 42 }
];

export const lagItems: LagItem[] = [
  { rank: 1, name: '新城公司', rate: 18 },
  { rank: 2, name: '工业园区', rate: 15 },
  { rank: 3, name: '华新镇', rate: 12 },
  { rank: 4, name: '徐泾镇', rate: 9 },
  { rank: 5, name: '金泽镇', rate: 6 }
];

export const keyTaskData: KeyTaskData = {
  newProjectTotal: 24,
  problemProjectTotal: 12,
  newNotStarted: 8,
  newStarted: 16,
  imageProgressInvestment: 45.6,
  problemItemTotal: 28,
  resolvedProblemItems: 18,
  unresolvedProblemItems: 10
};

export const mapTabs = ['街镇', '国企', '区属'] as const;
export type MapTab = (typeof mapTabs)[number];

export const progressFilters = ['社会投资', '房地产', '政府投资', '工业'] as const;
