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
  agencyUnit?: string;
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

export const QP_TERRITORY_OPTIONS = [
  '夏阳街道',
  '盈浦街道',
  '香花桥街道',
  '朱家角镇',
  '练塘镇',
  '金泽镇',
  '赵巷镇',
  '徐泾镇',
  '华新镇',
  '白鹤镇',
  '重固镇',
  '工业园区',
  '新城公司',
  '青发集团'
].map((v) => ({ value: v, label: v }));

export const QP_RESPONSIBLE_UNIT_OPTIONS = [
  '区发改委',
  '区经委',
  '区教育局',
  '区科技委',
  '区民宗办',
  '区公安分局',
  '区民政局',
  '区司法局',
  '区财政局',
  '区人社局',
  '区规划资源局',
  '区生态环境局',
  '区建管委',
  '区交通委',
  '区农业农村委',
  '区商务委',
  '区文旅局',
  '区卫生健康委',
  '区退役军人局',
  '区应急局',
  '区审计局',
  '区市场监管局',
  '区体育局',
  '区统计局',
  '区医保局',
  '区绿化市容局',
  '区机管局',
  '区城管执法局',
  '区民防办',
  '区地方志办',
  '区档案局',
  '区数据局',
  '区合作交流办',
  '区国资委',
  '区信访办',
  '区研究室',
  '区政务服务办',
  '区委组织部',
  '区委宣传部',
  '区委统战部',
  '区委政法委',
  '区委社工部',
  '区委编办',
  '区委党校',
  '区总工会',
  '团区委',
  '区妇联',
  '区残联',
  '区工商联',
  '区科协',
  '区红十字会',
  '区文联',
  '区侨联',
  '区法学会',
  '夏阳街道',
  '盈浦街道',
  '香花桥街道',
  '朱家角镇',
  '练塘镇',
  '金泽镇',
  '赵巷镇',
  '徐泾镇',
  '华新镇',
  '白鹤镇',
  '重固镇',
  '工业园区',
  '新城公司',
  '青发集团'
].map((v) => ({ value: v, label: v }));

export const QP_AGENCY_UNIT_OPTIONS = ['工业园区', '新城公司', '青发集团'].map((v) => ({
  value: v,
  label: v
}));

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
    agencyUnit: undefined,
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
