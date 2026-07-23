export interface QingpuRegionGeo {
  name: string;
  value: number;
  /** 平面坐标，x 向东、y 向南，范围约 0-100 */
  points: [number, number][];
}

/** 青浦区街镇简化 Geo 轮廓（示意，用于 3D 挤出地图） */
export const qingpuRegionGeos: QingpuRegionGeo[] = [
  {
    name: '白鹤镇',
    value: 31,
    points: [
      [60, 4], [84, 4], [92, 20], [78, 30], [62, 26]
    ]
  },
  {
    name: '重固镇',
    value: 39,
    points: [
      [38, 4], [60, 4], [62, 26], [50, 32], [36, 26]
    ]
  },
  {
    name: '华新镇',
    value: 94,
    points: [
      [16, 4], [38, 4], [36, 26], [24, 32], [12, 24]
    ]
  },
  {
    name: '徐泾镇',
    value: 41,
    points: [
      [62, 26], [78, 30], [92, 20], [96, 44], [80, 50], [66, 44]
    ]
  },
  {
    name: '赵巷镇',
    value: 41,
    points: [
      [36, 26], [50, 32], [62, 26], [66, 44], [52, 50], [38, 44]
    ]
  },
  {
    name: '香花桥街道',
    value: 2,
    points: [
      [24, 32], [36, 26], [38, 44], [28, 50], [18, 44]
    ]
  },
  {
    name: '工业园区',
    value: 20,
    points: [
      [52, 50], [66, 44], [72, 56], [62, 64], [48, 58]
    ]
  },
  {
    name: '夏阳街道',
    value: 10,
    points: [
      [18, 44], [28, 50], [38, 44], [42, 58], [30, 64], [16, 58]
    ]
  },
  {
    name: '盈浦街道',
    value: 2,
    points: [
      [6, 44], [18, 44], [16, 58], [8, 64], [4, 52]
    ]
  },
  {
    name: '金泽镇',
    value: 93,
    points: [
      [4, 52], [8, 64], [16, 58], [22, 76], [10, 96], [4, 96]
    ]
  },
  {
    name: '朱家角镇',
    value: 40,
    points: [
      [16, 58], [30, 64], [42, 58], [48, 76], [36, 96], [18, 96], [10, 96], [22, 76]
    ]
  },
  {
    name: '练塘镇',
    value: 28,
    points: [
      [42, 58], [48, 58], [62, 64], [72, 56], [78, 72], [66, 96], [48, 96], [36, 96], [48, 76]
    ]
  }
];

export function getRegionCentroid(points: [number, number][]) {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p[0];
    y += p[1];
  }
  return { x: x / points.length, y: y / points.length };
}

export function getMaxRegionValue(regions: QingpuRegionGeo[]) {
  return Math.max(...regions.map((r) => r.value), 1);
}

/** 平面坐标 → Three.js 平面坐标 */
export function toWorldCoord(x: number, y: number, scale = 0.11) {
  return {
    x: (x - 50) * scale,
    z: (y - 50) * scale
  };
}
