export interface ProjectType {
  key: string;
  name: string;
  /** Tab 短名，适配移动端 */
  shortName: string;
  stages: string[];
}

/** 项目类型与对应阶段（各类型阶段独立，不合并展示） */
export const PROJECT_TYPES: ProjectType[] = [
  {
    key: 'social',
    name: '社会投资项目',
    shortName: '社会投资',
    stages: ['四委两局会议', '土领会', '已拿地', '已开工', '竣工验收']
  },
  {
    key: 'gov',
    name: '政府投资',
    shortName: '政府投资',
    stages: ['项建书', '工可', '初步设计', '征地', '施工许可', '已开工', '竣工验收']
  },
  {
    key: 'other',
    name: '其他工程',
    shortName: '其他工程',
    stages: ['项建书', '工可', '初步设计', '征地', '施工许可', '已开工', '竣工验收']
  }
];

export const TOTAL_TAB_KEY = 'total';

/** mock 项目数：按项目类型汇总 */
export function buildProjectAnalysisMatrix(): Record<string, Record<string, number>> {
  const seed: Record<string, number[]> = {
    social: [4, 9, 16, 26, 37],
    gov: [5, 7, 10, 3, 8, 11, 18],
    other: [4, 4, 10, 6, 8, 14, 20]
  };

  const matrix: Record<string, Record<string, number>> = {};
  for (const type of PROJECT_TYPES) {
    matrix[type.key] = {};
    type.stages.forEach((stage, index) => {
      matrix[type.key][stage] = seed[type.key]?.[index] ?? 0;
    });
  }
  return matrix;
}

export function getStageCount(
  matrix: Record<string, Record<string, number>>,
  typeKey: string,
  stage: string
) {
  return matrix[typeKey]?.[stage] ?? 0;
}

export function getTypeTotal(matrix: Record<string, Record<string, number>>, typeKey: string) {
  return Object.values(matrix[typeKey] ?? {}).reduce((sum, n) => sum + n, 0);
}

export function getGrandTotal(matrix: Record<string, Record<string, number>>) {
  return PROJECT_TYPES.reduce((sum, type) => sum + getTypeTotal(matrix, type.key), 0);
}

export function getTypePercent(matrix: Record<string, Record<string, number>>, typeKey: string) {
  const grand = getGrandTotal(matrix);
  if (grand <= 0) return 0;
  return Math.round((getTypeTotal(matrix, typeKey) / grand) * 100);
}
