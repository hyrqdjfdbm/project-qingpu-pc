/** 单位固投累计台账（万元） */
export interface UnitFixedInvestmentRecord {
  id: string;
  year: number;
  month: number;
  unitName: string;
  amountWan: number;
  updatedAt: string;
  updatedBy: string;
}

export type UnitFixedInvestmentAuditAction =
  | 'create'
  | 'update'
  | 'import_insert'
  | 'import_overwrite';

export interface UnitFixedInvestmentAuditLog {
  id: string;
  action: UnitFixedInvestmentAuditAction;
  year: number;
  month: number;
  unitName: string;
  oldAmountWan?: number;
  newAmountWan: number;
  operator: string;
  operatedAt: string;
  batchId?: string;
}

export interface UnitFixedInvestmentMatrixRow {
  unitName: string;
  /** month 1-12 → amount or undefined（未填） */
  months: Record<number, number | undefined>;
}

export type ImportPreviewAction = 'insert' | 'overwrite' | 'skip' | 'invalid';

export interface ImportPreviewRow {
  rowNo: number;
  year: number;
  month: number;
  unitName: string;
  newAmountWan: number;
  oldAmountWan?: number;
  action: ImportPreviewAction;
  error?: string;
}

export interface ImportPreviewResult {
  rows: ImportPreviewRow[];
  validCount: number;
  conflictCount: number;
  invalidCount: number;
}

export interface ImportConfirmPayload {
  rows: Array<{
    year: number;
    month: number;
    unitName: string;
    amountWan: number;
    action: 'insert' | 'overwrite';
  }>;
  batchId?: string;
}
