/** 概算/可研单位（由其他模块录入） */
export interface BudgetUnit {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
}

/** 不参与抽取单位及原因 */
export interface ExcludedUnitDetail {
  unitName: string;
  reason: string;
}

/** 附件分类 */
export const DRAW_ATTACHMENT_CATEGORIES = [
  { key: 'applicationForm', label: '申请表', seq: 1 },
  { key: 'projectProposal', label: '项目建议书', seq: 2 },
  { key: 'feasibilityReport', label: '可行性研究报告', seq: 3 },
  { key: 'preliminaryDesign', label: '初步设计文本', seq: 4 },
  { key: 'budgetEstimate', label: '工程概算书', seq: 5 },
  { key: 'quantityMeasure', label: '工程计量数', seq: 6 }
] as const;

export type DrawAttachmentCategoryKey = (typeof DRAW_ATTACHMENT_CATEGORIES)[number]['key'];

export function getDrawAttachmentDisplayLabel(key: DrawAttachmentCategoryKey): string {
  const item = DRAW_ATTACHMENT_CATEGORIES.find((category) => category.key === key);
  if (!item) return key;
  return 'seq' in item && item.seq != null ? `${item.seq}、${item.label}` : item.label;
}

export const DRAW_ATTACHMENT_CATEGORY_LABEL: Record<DrawAttachmentCategoryKey, string> =
  Object.fromEntries(
    DRAW_ATTACHMENT_CATEGORIES.map((item) => [item.key, getDrawAttachmentDisplayLabel(item.key)])
  ) as Record<DrawAttachmentCategoryKey, string>;

/** 抽奖附件 */
export interface DrawAttachmentMeta {
  category: DrawAttachmentCategoryKey;
  name: string;
  size: number;
  /** 本地预览/下载地址，mock 上传后由 blob URL 提供 */
  url?: string;
}

/** 随机抽取表单 */
export interface BudgetDrawForm {
  projectName: string;
  /** 投资额（万元） */
  totalInvestment: number;
  constructionUnit: string;
  legalPerson: string;
  handler: string;
  contactPhone: string;
  compileUnit: string;
  compileContact: string;
  compilePhone: string;
  constructionContent: string;
  /** 不参与本次抽取的单位 ID */
  excludedUnitIds: string[];
  /** 各单位不参与原因，key 为单位 ID */
  excludedReasons: Record<string, string>;
  attachments: DrawAttachmentMeta[];
}

/** 公示记录 */
export interface BudgetDrawRecord {
  id: string;
  projectName: string;
  /** 投资额（万元） */
  totalInvestment: number;
  constructionUnit: string;
  legalPerson: string;
  handler: string;
  contactPhone: string;
  compileUnit: string;
  compileContact: string;
  compilePhone: string;
  constructionContent: string;
  excludedDetails: ExcludedUnitDetail[];
  attachments: DrawAttachmentMeta[];
  winnerUnit: string;
  eligibleCount: number;
  drawTime: string;
}

export interface BudgetDrawPayload extends BudgetDrawForm {}

export interface BudgetDrawResult {
  record: BudgetDrawRecord;
}
