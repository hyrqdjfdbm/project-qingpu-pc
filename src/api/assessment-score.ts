import { mockDelay } from '@/mock/delay';
import { assessmentScoreStore } from '@/mock/assessment-score-store';
import type { AssessmentDocQuery, AssessmentDocument } from '@/types/assessment-score';

export const assessmentScoreApi = {
  list: (params?: AssessmentDocQuery) => {
    assessmentScoreStore.ensureGenerated();
    return mockDelay(assessmentScoreStore.list(params));
  },

  getById: (id: string) => {
    const item = assessmentScoreStore.getById(id);
    if (!item) return Promise.reject(new Error('考核文档不存在'));
    return mockDelay(item);
  }
};

export type { AssessmentDocument };
