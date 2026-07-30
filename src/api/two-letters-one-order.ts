import { mockDelay } from '@/mock/delay';
import { twoLettersOneOrderStore } from '@/mock/two-letters-one-order-store';
import type { LetterDocQuery, LetterDocument } from '@/types/two-letters-one-order';

export const twoLettersOneOrderApi = {
  list: (params?: LetterDocQuery) => {
    twoLettersOneOrderStore.ensureGenerated();
    return mockDelay(twoLettersOneOrderStore.list(params));
  },

  getById: (id: string) => {
    const item = twoLettersOneOrderStore.getById(id);
    if (!item) return Promise.reject(new Error('文档不存在'));
    return mockDelay(item);
  }
};

export type { LetterDocument };
