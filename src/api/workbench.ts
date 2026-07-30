import { mockDelay } from '@/mock/delay';
import { workbenchStore } from '@/mock/workbench-store';
import { getCurrentUser } from '@/mock/current-user';
import type { WorkbenchStatus, WorkbenchTask } from '@/types/workbench';

export const workbenchApi = {
  listPending() {
    const userId = getCurrentUser().id;
    return mockDelay(workbenchStore.listPendingByAssignee(userId));
  },

  /** @throws Error（mock） */
  processTask(
    id: string,
    opts: { status: WorkbenchStatus; expectedUpdatedAt?: string }
  ): Promise<WorkbenchTask> {
    return mockDelay(workbenchStore.processTask(id, opts));
  }
};

export type { WorkbenchTask };

