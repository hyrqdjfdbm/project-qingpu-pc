import { mockDelay } from '@/mock/delay';
import { meetingCoordinationStore } from '@/mock/meeting-coordination-store';
import type {
  MeetingCoordinationFormPayload,
  MeetingCoordinationQuery,
  MeetingCoordinationRecord
} from '@/types/meeting-coordination';

export const meetingCoordinationApi = {
  list: (params?: MeetingCoordinationQuery) =>
    mockDelay(meetingCoordinationStore.list(params)),

  getById: (id: string) => {
    const item = meetingCoordinationStore.getById(id);
    if (!item) return Promise.reject(new Error('会议协调事项不存在'));
    return mockDelay(item);
  },

  create: (payload: MeetingCoordinationFormPayload) =>
    mockDelay(meetingCoordinationStore.create(payload)),

  update: (id: string, payload: MeetingCoordinationFormPayload) => {
    const item = meetingCoordinationStore.update(id, payload);
    if (!item) return Promise.reject(new Error('会议协调事项不存在'));
    return mockDelay(item);
  },

  remove: (id: string) => {
    const ok = meetingCoordinationStore.remove(id);
    if (!ok) return Promise.reject(new Error('会议协调事项不存在'));
    return mockDelay(true);
  }
};

export type { MeetingCoordinationRecord };
