/** 项目所属库 */
export type PoolStage = 'planning' | 'supplement' | 'implementation' | 'gov';

export const POOL_STAGE_LABEL: Record<PoolStage, string> = {
  planning: '谋划库',
  supplement: '增补库',
  implementation: '实施库',
  gov: '政府投资项目库'
};

/** 项目类型 */
export type ProjectType = 'real_estate' | 'industry' | 'other';

/** 项目属性 */
export type ProjectAttribute = 'social' | 'government' | 'other';

/** 项目状态 */
export type ProjectStatus = 'pending' | 'stored' | 'returned';

/** 建设性质 */
export type ConstructionNature = 'new' | 'expand' | 'rebuild' | 'relocate';

/** 项目类别 */
export type ProjectCategory = 'real_estate' | 'industry' | 'other';

/** 投资额筛选区间 */
export type InvestRange = '0-1' | '1-5' | '5-10' | '10+';

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  real_estate: '房地产',
  industry: '工业',
  other: '其他'
};

export const PROJECT_ATTRIBUTE_LABEL: Record<ProjectAttribute, string> = {
  social: '社会投资',
  government: '政府投资',
  other: '其他'
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  pending: '待审核',
  stored: '已入库',
  returned: '退回'
};

export function getProjectStatusTagColor(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    pending: 'processing',
    stored: 'success',
    returned: 'error'
  };
  return map[status];
}

export const CONSTRUCTION_NATURE_LABEL: Record<ConstructionNature, string> = {
  new: '新建',
  expand: '扩建',
  rebuild: '改建',
  relocate: '迁建'
};

export const PROJECT_CATEGORY_LABEL: Record<ProjectCategory, string> = {
  real_estate: '房地产',
  industry: '工业',
  other: '其他'
};

export const INVEST_RANGE_LABEL: Record<InvestRange, string> = {
  '0-1': '1亿元以下',
  '1-5': '1-5亿元',
  '5-10': '5-10亿元',
  '10+': '10亿元以上'
};

/** 街镇选项 */
export const STREET_TOWN_OPTIONS = [
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
].map((v) => ({ value: v, label: v }));

/** 责任单位选项 */
export const RESPONSIBLE_UNIT_OPTIONS = [
  '区发改委',
  '区经信委',
  '区建管委',
  '区科委',
  '区商务委',
  '区农业农村委',
  '区文旅局',
  '区卫健委'
].map((v) => ({ value: v, label: v }));

/** 子项目选项（可搜索） */
export const SUB_PROJECT_OPTIONS = [
  { value: 'sp001', label: '智能水表数字化迭代转型一期' },
  { value: 'sp002', label: '智能水表数字化迭代转型二期' },
  { value: 'sp003', label: '新能源汽车电池壳生产线技改' },
  { value: 'sp004', label: '汽车传动轴自动化生产线升级' }
];

export interface SupplementProjectForm {
  projectName: string;
  projectAbbr?: string;
  projectLocation: string;
  totalInvestment: number | undefined;
  responsibleUnits: string[];
  unitName: string;
  projectAttribute?: ProjectAttribute;
  projectCategory?: ProjectCategory;
  constructionSite: string;
  constructionAddress: string;
  constructionNature?: ConstructionNature;
  constructionScale: string;
  constructionProgress?: string;
  proposedStartDate?: string;
  proposedEndDate?: string;
  needConstructionPermit: boolean;
  landCertificateNo?: string;
  subProjects?: string[];
  schemeCompleteDate?: string;
  planningCompleteDate?: string;
  proposalApprovalDate?: string;
}

export interface SupplementProjectItem extends SupplementProjectForm {
  id: string;
  projectCode: string;
  projectType: ProjectType;
  projectNature: ConstructionNature;
  poolStage: PoolStage;
  status: ProjectStatus;
  progressPercent?: number;
  declaredBy?: string;
  createdAt: string;
  auditRemark?: string;
}

export interface SupplementProjectQuery {
  keyword?: string;
  projectType?: ProjectType;
  investRange?: InvestRange;
  streetTown?: string;
  responsibleUnit?: string;
  status?: ProjectStatus;
  poolStage?: PoolStage;
  projectAttribute?: ProjectAttribute;
}

export interface AuditPayload {
  approved: boolean;
  remark?: string;
}
