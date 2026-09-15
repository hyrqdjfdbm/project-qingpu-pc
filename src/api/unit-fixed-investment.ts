import { mockDelay } from '@/mock/delay';
import { getCurrentUser, isInvestmentMgmtRole } from '@/mock/current-user';
import {
  getAllowedYears,
  unitFixedInvestmentStore
} from '@/mock/unit-fixed-investment-store';
import type {
  ImportConfirmPayload,
  ImportPreviewResult,
  UnitFixedInvestmentAuditLog,
  UnitFixedInvestmentMatrixRow,
  UnitFixedInvestmentRecord
} from '@/types/unit-fixed-investment';

function assertInvestmentMgmt() {
  if (!isInvestmentMgmtRole(getCurrentUser().role)) {
    throw new Error('仅投管科可维护责任单位固投');
  }
}

export const unitFixedInvestmentApi = {
  getAllowedYears: () => mockDelay(getAllowedYears()),

  getMatrix(year: number): Promise<UnitFixedInvestmentMatrixRow[]> {
    assertInvestmentMgmt();
    return mockDelay(unitFixedInvestmentStore.getMatrix(year));
  },

  saveCell(
    year: number,
    month: number,
    unitName: string,
    amountWan: number
  ): Promise<UnitFixedInvestmentRecord> {
    assertInvestmentMgmt();
    return mockDelay(unitFixedInvestmentStore.upsertCell(year, month, unitName, amountWan));
  },

  listAuditLogs(): Promise<UnitFixedInvestmentAuditLog[]> {
    assertInvestmentMgmt();
    return mockDelay(unitFixedInvestmentStore.listAuditLogs());
  },

  previewImport(text: string): Promise<ImportPreviewResult> {
    assertInvestmentMgmt();
    return mockDelay(unitFixedInvestmentStore.parseImportText(text));
  },

  confirmImport(payload: ImportConfirmPayload) {
    assertInvestmentMgmt();
    return mockDelay(unitFixedInvestmentStore.confirmImport(payload));
  }
};
