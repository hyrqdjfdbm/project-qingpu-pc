/** 青浦增补库：单级审核（区经委 / 区发改）后进入实施库 */

export type QingpuSupplementStatus = 'pendingReview' | 'entered' | 'returned' | 'revoked';

export type QingpuAuditChannel = 'jingwei' | 'fagai';

export type QingpuProjectLevel = '主项目' | '子项目';

export interface QingpuNodeFill {
  completeDate?: string;
  content?: string;
  /** 不涉及此节点（形象方案 / 项建书） */
  notInvolved?: boolean;
}

export interface QingpuSupplementForm {
  projectName: string;
  projectLevel: QingpuProjectLevel;
  hasRelatedSubProjects: boolean;
  subProjectCodes: string[];
  relatedParentProjectCode?: string;
  unitName: string;
  projectStatus: string;
  territory: string;
  responsibleUnits: string[];
  agencyUnit: string;
  projectAttribute: string;
  projectCategory: string;
  constructionSite: string;
  constructionAddress: string;
  constructionNature: string;
  constructionScale: string;
  projectProgress?: string;
  proposedStartDate?: string;
  proposedEndDate?: string;
  needConstructionPermit: string;
  totalInvestment: number | undefined;
  ownLandCertNo: string;
  imageScheme?: QingpuNodeFill;
  proposalDoc?: QingpuNodeFill;
}

export interface QingpuSupplementItem extends QingpuSupplementForm {
  id: string;
  projectCode: string;
  status: QingpuSupplementStatus;
  auditChannel: QingpuAuditChannel;
  applicant: string;
  applicantId: string;
  applicantUnit: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  auditOpinion?: string;
  auditedAt?: string;
  auditedBy?: string;
  implementationProjectId?: string;
  revokeReason?: string;
}

export interface QingpuSupplementQuery {
  keyword?: string;
  territory?: string;
  responsibleUnit?: string;
  status?: QingpuSupplementStatus;
  applicantId?: string;
  auditChannel?: QingpuAuditChannel;
}

export interface QingpuSupplementAuditPayload {
  approved: boolean;
  opinion: string;
}

export const QINGPU_SUPPLEMENT_STATUS_LABEL: Record<QingpuSupplementStatus, string> = {
  pendingReview: '待审核',
  entered: '已入库',
  returned: '退回',
  revoked: '已撤销'
};

export const QINGPU_SUPPLEMENT_STATUS_OPTIONS = (
  Object.keys(QINGPU_SUPPLEMENT_STATUS_LABEL) as QingpuSupplementStatus[]
).map((value) => ({ value, label: QINGPU_SUPPLEMENT_STATUS_LABEL[value] }));

export function getQingpuSupplementStatusColor(status: QingpuSupplementStatus) {
  const map: Record<QingpuSupplementStatus, string> = {
    pendingReview: 'processing',
    entered: 'success',
    returned: 'error',
    revoked: 'default'
  };
  return map[status];
}

export const QINGPU_AUDIT_CHANNEL_LABEL: Record<QingpuAuditChannel, string> = {
  jingwei: '区经委审核专员',
  fagai: '区发改审核专员'
};

export function getQingpuAuditChannel(category: string): QingpuAuditChannel {
  return category.startsWith('社会投资') ? 'jingwei' : 'fagai';
}

export function isSocialInvestmentCategory(category: string) {
  return category.startsWith('社会投资');
}

function toOptions(values: string[]) {
  return values.map((v) => ({ value: v, label: v }));
}

/** 纳统归属下拉：街镇 / 园区国企 / 区属 */
export const QP_TERRITORY_VALUES = [
  '赵巷镇',
  '徐泾镇',
  '华新镇',
  '重固镇',
  '白鹤镇',
  '朱家角镇',
  '练塘镇',
  '金泽镇',
  '工业园区',
  '新城公司',
  '西虹桥公司',
  '青发集团',
  '科创集团',
  '区属'
];

export const QP_DISTRICT_TERRITORY = '区属';

export const QP_TERRITORY_OPTIONS = toOptions(QP_TERRITORY_VALUES);

const QP_NON_DISTRICT_TERRITORY = new Set(
  QP_TERRITORY_VALUES.filter((v) => v !== QP_DISTRICT_TERRITORY)
);

/** 申报单位是否属于区属（不在街镇/园区国企纳统归属名单中的单位） */
export function isQingpuDistrictUnit(unit: string) {
  return Boolean(unit) && !QP_NON_DISTRICT_TERRITORY.has(unit);
}

/** 申报单位与纳统归属是否不一致：非区属直接比对；区属则看申报单位是否属于区属 */
export function isQingpuBelongingMismatch(applicantUnit: string, territory: string) {
  if (!applicantUnit || !territory) return false;
  if (territory === QP_DISTRICT_TERRITORY) {
    return !isQingpuDistrictUnit(applicantUnit);
  }
  return applicantUnit !== territory;
}

export const QP_RESPONSIBLE_UNIT_VALUES = [
  '赵巷镇',
  '徐泾镇',
  '华新镇',
  '重固镇',
  '白鹤镇',
  '朱家角镇',
  '练塘镇',
  '金泽镇',
  '工业园区',
  '夏阳街道',
  '香花桥街道',
  '盈浦街道',
  '区绿容局',
  '区水务局',
  '区建管委',
  '区国动办',
  '区应急局',
  '区重大办',
  '区卫健委',
  '区民政局',
  '区经委',
  '区商务委',
  '区房管局',
  '区科委',
  '区农委',
  '区文旅局',
  '区体育局',
  '区教育局',
  '区消防支队',
  '区发改委',
  '区规划资源局',
  '区人社局',
  '区征收中心',
  '区委办',
  '区府办',
  '区公安局',
  '区数据局',
  '区资源利用科',
  '区征管中心',
  '新城公司',
  '西虹桥公司',
  '青发集团',
  '科创集团',
  '长新公司',
  '长三投',
  '文旅集团',
  '电力公司',
  '道运中心',
  '华为专班',
  '六业专班',
  '房管公司',
  '城建中心'
];

export const QP_RESPONSIBLE_UNIT_OPTIONS = toOptions(QP_RESPONSIBLE_UNIT_VALUES);

export const QP_AGENCY_UNIT_OPTIONS = toOptions(['工业园区', '新城公司', '青发集团']);

export const QP_PROJECT_LEVEL_OPTIONS = [
  { value: '主项目', label: '主项目' },
  { value: '子项目', label: '子项目' }
];

export const QP_YES_NO_OPTIONS = [
  { value: true, label: '是' },
  { value: false, label: '否' }
];

export const QP_PROJECT_ATTRIBUTE_OPTIONS = [
  '民间固定资产投资项目',
  '国有控股项目',
  '其他项目'
].map((v) => ({ value: v, label: v }));

export const QP_PROJECT_CATEGORY_OPTIONS = [
  '社会投资项目-房地产',
  '社会投资项目-工业',
  '社会投资项目-其他',
  '社会投资项目-商贸业',
  '社会投资项目-研发',
  '政府投资-政府工程',
  '政府投资-其他工程',
  '其他工程-线性工程',
  '其他工程-房建工程',
  '其他工程-其他工程'
].map((v) => ({ value: v, label: v }));

export const QP_CONSTRUCTION_NATURE_OPTIONS = ['新建', '续建'].map((v) => ({
  value: v,
  label: v
}));

export const QP_PERMIT_OPTIONS = ['是', '否'].map((v) => ({ value: v, label: v }));

export function createEmptyQingpuSupplementForm(): QingpuSupplementForm {
  return {
    projectName: '',
    projectLevel: '主项目',
    hasRelatedSubProjects: false,
    subProjectCodes: [],
    relatedParentProjectCode: undefined,
    unitName: '',
    projectStatus: '',
    territory: undefined as unknown as string,
    responsibleUnits: [],
    agencyUnit: undefined as unknown as string,
    projectAttribute: undefined as unknown as string,
    projectCategory: undefined as unknown as string,
    constructionSite: '',
    constructionAddress: '',
    constructionNature: undefined as unknown as string,
    constructionScale: '',
    projectProgress: undefined,
    proposedStartDate: undefined,
    proposedEndDate: undefined,
    needConstructionPermit: undefined as unknown as string,
    totalInvestment: undefined,
    ownLandCertNo: '',
    imageScheme: undefined,
    proposalDoc: undefined
  };
}
