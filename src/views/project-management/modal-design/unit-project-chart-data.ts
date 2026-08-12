/** 多单位项目数图表 — 演示数据（约 30 个责任单位） */

export interface UnitProjectCountItem {
  unitName: string;
  projectCount: number;
}

/** 青浦区常见责任单位（演示用，共 30 个） */
export const MULTI_UNIT_NAMES = [
  '区发改委',
  '区经信委',
  '区建管委',
  '区科委',
  '区商务委',
  '区农业农村委',
  '区文旅局',
  '区卫健委',
  '区教育局',
  '区水务局',
  '区绿化市容局',
  '区房管局',
  '区交通委',
  '区规划资源局',
  '区生态环境局',
  '区应急管理局',
  '夏阳街道',
  '盈浦街道',
  '香花桥街道',
  '赵巷镇',
  '徐泾镇',
  '华新镇',
  '重固镇',
  '白鹤镇',
  '练塘镇',
  '金泽镇',
  '朱家角镇',
  '工业园区',
  '西虹桥商务区',
  '区国资委'
] as const;

/** 生成降序排列的单位项目数（确定性伪随机，便于演示稳定） */
export function buildUnitProjectCountData(): UnitProjectCountItem[] {
  return MULTI_UNIT_NAMES.map((unitName, index) => {
    // 让前部单位项目数更高，整体仍有差异
    const base = 42 - index;
    const jitter = ((index * 7) % 9) - 4;
    const projectCount = Math.max(1, base + jitter);
    return { unitName, projectCount };
  }).sort((a, b) => b.projectCount - a.projectCount || a.unitName.localeCompare(b.unitName, 'zh-CN'));
}

export const DEFAULT_TOP_N = 15;
