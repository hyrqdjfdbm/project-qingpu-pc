import { mockDelay } from '@/mock/delay';
import { budgetDrawStore } from '@/mock/budget-draw-store';
import type { BudgetDrawPayload, BudgetDrawRecord, BudgetUnit } from '@/types/budget-draw';

export const budgetDrawApi = {
  getUnits: () => mockDelay(budgetDrawStore.listUnits()),

  getRecords: () => mockDelay(budgetDrawStore.listRecords()),

  draw: async (payload: BudgetDrawPayload) => {
    await mockDelay(null, 600);
    const record = budgetDrawStore.draw(payload);
    return mockDelay(record);
  }
};

export type { BudgetDrawRecord, BudgetUnit };
