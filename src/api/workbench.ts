import { mockDelay } from '@/mock/delay';
import { workbenchStore } from '@/mock/workbench-store';
import { getCurrentUser } from '@/mock/current-user';
import type { WorkbenchStatus, WorkbenchTask } from '@/types/workbench';

export const workbenchApi = {
  listPending() {
    const user = getCurrentUser();
    if (user.role === 'admin') {
      return mockDelay(workbenchStore.listAllPending());
    }
    return mockDelay(workbenchStore.listPendingByAssignee(user.id));
  },

  /** @throws Error（mock） */
  processTask(
    id: string,
    opts: {
      status: WorkbenchStatus;
      expectedUpdatedAt?: string;
      reviewResult?: 'approve' | 'reject';
      opinion?: string;
    }
  ): Promise<WorkbenchTask> {
    return mockDelay(workbenchStore.processTask(id, opts));
  }
};

export type { WorkbenchTask };
