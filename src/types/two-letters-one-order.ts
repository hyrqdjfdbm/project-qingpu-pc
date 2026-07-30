/** 两函一单文档类型 */
export type LetterDocType = 'assign' | 'remind' | 'supervise';

export const LETTER_DOC_TYPE_LABEL: Record<LetterDocType, string> = {
  assign: '交办函',
  remind: '提醒函',
  supervise: '督办函'
};

export interface LetterDocument {
  id: string;
  type: LetterDocType;
  /** 周期展示，如 2026年7月 */
  periodLabel: string;
  year: number;
  month: number;
  fileName: string;
  fileSize: number;
  /** 系统自动生成时间 */
  generatedAt: string;
  generateRule: string;
}

export interface LetterDocQuery {
  type?: LetterDocType;
  year?: number;
  month?: number;
}
