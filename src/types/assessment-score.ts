/** 考核评分文档类型 */
export type AssessmentDocType = 'red_yellow_flag' | 'annual' | 'quarterly';

export interface AssessmentDocument {
  id: string;
  type: AssessmentDocType;
  /** 考核周期展示，如 2026年6月 / 2026年二季度 / 2025年度 */
  periodLabel: string;
  year: number;
  /** 红黄旗：月份 1-12 */
  month?: number;
  /** 季度考核：1-4 */
  quarter?: number;
  fileName: string;
  fileSize: number;
  /** 系统自动生成时间 */
  generatedAt: string;
  /** 生成规则说明 */
  generateRule: string;
}

export interface AssessmentDocQuery {
  type?: AssessmentDocType;
  /** annual 页 Tab：年度 / 季度 */
  category?: 'annual' | 'quarterly';
  year?: number;
  keyword?: string;
}
