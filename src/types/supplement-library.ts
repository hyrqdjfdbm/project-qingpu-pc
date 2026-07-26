import { RESPONSIBLE_UNIT_OPTIONS, STREET_TOWN_OPTIONS } from '@/types/supplement-pool';

/** 增补库流程状态 */
export type SupplementLibraryStatus =
  | 'pendingReview'
  | 'reviewing'
  | 'entered'
  | 'returned'
  | 'revoked';

export const SUPPLEMENT_LIBRARY_STATUS_LABEL: Record<SupplementLibraryStatus, string> = {
  pendingReview: '待审核',
  reviewing: '审核中',
  entered: '已入库',
  returned: '退回',
  revoked: '已撤销'
};

export const SUPPLEMENT_LIBRARY_STATUS_OPTIONS = (
  Object.keys(SUPPLEMENT_LIBRARY_STATUS_LABEL) as SupplementLibraryStatus[]
).map((value) => ({ value, label: SUPPLEMENT_LIBRARY_STATUS_LABEL[value] }));

export function getSupplementLibraryStatusColor(status: SupplementLibraryStatus) {
  const map: Record<SupplementLibraryStatus, string> = {
    pendingReview: 'processing',
    reviewing: 'warning',
    entered: 'success',
    returned: 'error',
    revoked: 'default'
  };
  return map[status];
}

/** 项目属地：与实施库街镇一致（青浦） */
export const SL_TERRITORY_OPTIONS = STREET_TOWN_OPTIONS;

/** 项目责任单位：与实施库一致 */
export const SL_RESPONSIBLE_UNIT_OPTIONS = RESPONSIBLE_UNIT_OPTIONS;

export const SL_PROJECT_ATTRIBUTE_OPTIONS = [
  '民间固定资产投资项目',
  '国有控股项目',
  '其他项目'
].map((v) => ({ value: v, label: v }));

export const SL_PROJECT_CATEGORY_OPTIONS = ['基本建设', '技术改造'].map((v) => ({
  value: v,
  label: v
}));

export const SL_APPROVAL_TYPE_OPTIONS = ['备案', '核准', '审批'].map((v) => ({
  value: v,
  label: v
}));

export const SL_PROJECT_TYPE_OPTIONS = [
  '先进制造业基地领域',
  '民生设施领域',
  '科技创新强基领域',
  '城镇有机更新领域',
  '文化旅游融合领域',
  '交通强省领域',
  '水网安澜提升领域',
  '农业农村优先领域',
  '清洁能源保供领域'
].map((v) => ({ value: v, label: v }));

/** 项目来源（按青浦口径适配） */
export const SL_PROJECT_SOURCE_OPTIONS = ['市重大项目', '区重大项目', '其他重大项目'].map((v) => ({
  value: v,
  label: v
}));

/** 项目套餐（图二「项目分类」选项） */
export const SL_PROJECT_PACKAGE_OPTIONS = [
  '城市基础设施项目',
  '房屋建筑项目',
  '工业项目',
  '光伏项目',
  '交通项目',
  '境外项目',
  '落地技改项目',
  '民用建筑项目',
  '水利项目',
  '维修改建项目',
  '小型项目',
  '装修项目',
  '其他项目'
].map((v) => ({ value: v, label: v }));

export const SL_FILING_CATEGORY_OPTIONS = ['内资', '外资', '境外'].map((v) => ({
  value: v,
  label: v
}));

export const SL_CODING_AUTHORITY_OPTIONS = [
  { value: '青浦区发展和改革委', label: '青浦区发展和改革委' },
  { value: '__other__', label: '其他（用户自己填）' }
];

export const SL_YES_NO_OPTIONS = [
  { value: true, label: '是' },
  { value: false, label: '否' }
];

export const SL_NATIONAL_INDUSTRY_OPTIONS = [
  '农、林、牧、渔业',
  '采矿业',
  '制造业',
  '电力、热力、燃气及水生产和供应业',
  '建筑业',
  '批发和零售业',
  '交通运输、仓储和邮政业',
  '住宿和餐饮业',
  '信息传输、软件和信息技术服务业',
  '金融业',
  '房地产业',
  '租赁和商务服务业',
  '科学研究和技术服务业',
  '水利、环境和公共设施管理业',
  '居民服务、修理和其他服务业',
  '教育',
  '卫生和社会工作',
  '文化、体育和娱乐业',
  '公共管理、社会保障和社会组织',
  '国际组织'
].map((v) => ({ value: v, label: v }));

export const SL_CONSTRUCTION_NATURE_OPTIONS = [
  { value: '新建', label: '新建' },
  { value: '续建', label: '续建' },
  { value: '__other__', label: '其他（用户自己填）' }
];

/** 申报表单字段 */
export interface SupplementLibraryForm {
  // 业主信息
  projectName: string;
  /** 是否有关联子项目 */
  hasRelatedSubProjects: boolean;
  /** 子项目代码（实施库项目），多选 */
  subProjectCodes: string[];
  projectCode?: string;
  unitName: string;
  unitLicenseNo: string;
  contactName: string;
  contactPhone: string;
  leaderName: string;
  leaderPhone: string;
  territory: string;
  responsibleUnits: string[];
  projectAttribute: string;
  projectCategory: string;
  approvalType: string;
  projectType: string;
  projectSources: string[];
  projectPackage: string;
  filingCategory?: string;
  filingDate: string;
  codingAuthority: string;
  codingAuthorityOther?: string;
  codingDate?: string;
  isCommitment?: boolean;
  isComplementCode?: boolean;
  nationalIndustry: string;
  investContinent?: string;
  investCountry?: string;
  // 建筑信息
  constructionSite: string;
  constructionAddress: string;
  constructionNature: string;
  constructionNatureOther?: string;
  constructionScale: string;
  projectProgress?: string;
  proposedStartDate?: string;
  proposedEndDate?: string;
  abovegroundArea: number | undefined;
  totalBuildingArea: number | undefined;
  newBuildingArea: number | undefined;
  needConstructionPermit: boolean;
  useIdleSite?: boolean;
  // 资金信息（万元）
  totalInvestment: number | undefined;
  fixedAssetInvestment?: number;
  registeredCapital?: number;
  ownFunds?: number;
  bankLoan?: number;
  fiscalFunds?: number;
  workingCapital?: number;
  civilCost?: number;
  equipmentCost?: number;
  installCost?: number;
  otherConstructionCost?: number;
  reserveFund?: number;
  constructionInterest?: number;
  otherCost?: number;
  fundSource?: number;
  // 土地信息
  totalLandArea: number | undefined;
  newConstructionLand: number | undefined;
  includeNewLand: boolean;
  isStandardLand?: boolean;
  isZeroLand?: boolean;
  ownLandCertNo: string;
  lessorLandCertNo?: string;
}

export interface SupplementLibraryItem extends SupplementLibraryForm {
  id: string;
  status: SupplementLibraryStatus;
  applicant: string;
  applicantId: string;
  applicantUnit: string;
  /** 分管领导（初审人） */
  supervisorId: string;
  supervisorName: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  firstAuditOpinion?: string;
  firstAuditedAt?: string;
  firstAuditedBy?: string;
  finalAuditOpinion?: string;
  finalAuditedAt?: string;
  finalAuditedBy?: string;
  /** 终审通过后写入实施库的项目 id */
  implementationProjectId?: string;
  revokeReason?: string;
}

export interface SupplementLibraryQuery {
  keyword?: string;
  territory?: string;
  responsibleUnit?: string;
  status?: SupplementLibraryStatus;
  /** 数据权限：仅看某申请人 */
  applicantId?: string;
  /** 数据权限：仅看某分管领导待审 */
  supervisorId?: string;
}

export interface SupplementLibraryAuditPayload {
  approved: boolean;
  opinion: string;
}

export function createEmptySupplementLibraryForm(): SupplementLibraryForm {
  return {
    projectName: '',
    hasRelatedSubProjects: false,
    subProjectCodes: [],
    projectCode: undefined,
    unitName: '',
    unitLicenseNo: '',
    contactName: '',
    contactPhone: '',
    leaderName: '',
    leaderPhone: '',
    territory: undefined as unknown as string,
    responsibleUnits: [],
    projectAttribute: undefined as unknown as string,
    projectCategory: undefined as unknown as string,
    approvalType: undefined as unknown as string,
    projectType: undefined as unknown as string,
    projectSources: [],
    projectPackage: undefined as unknown as string,
    filingCategory: undefined,
    filingDate: '',
    codingAuthority: undefined as unknown as string,
    codingAuthorityOther: undefined,
    codingDate: undefined,
    isCommitment: undefined,
    isComplementCode: undefined,
    nationalIndustry: undefined as unknown as string,
    investContinent: undefined,
    investCountry: undefined,
    constructionSite: '',
    constructionAddress: '',
    constructionNature: undefined as unknown as string,
    constructionNatureOther: undefined,
    constructionScale: '',
    projectProgress: undefined,
    proposedStartDate: undefined,
    proposedEndDate: undefined,
    abovegroundArea: undefined,
    totalBuildingArea: undefined,
    newBuildingArea: undefined,
    needConstructionPermit: true,
    useIdleSite: undefined,
    totalInvestment: undefined,
    fixedAssetInvestment: undefined,
    registeredCapital: undefined,
    ownFunds: undefined,
    bankLoan: undefined,
    fiscalFunds: undefined,
    workingCapital: undefined,
    civilCost: undefined,
    equipmentCost: undefined,
    installCost: undefined,
    otherConstructionCost: undefined,
    reserveFund: undefined,
    constructionInterest: undefined,
    otherCost: undefined,
    fundSource: undefined,
    totalLandArea: undefined,
    newConstructionLand: undefined,
    includeNewLand: false,
    isStandardLand: undefined,
    isZeroLand: undefined,
    ownLandCertNo: '',
    lessorLandCertNo: undefined
  };
}
