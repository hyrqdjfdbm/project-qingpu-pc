<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { workbenchApi } from '@/api/workbench';
import type { WorkbenchTask } from '@/types/workbench';
import {
  WORKBENCH_SOURCE_MODULE_LABEL,
  WORKBENCH_STATUS_LABEL,
  WORKBENCH_STATUS_OPTIONS,
  WORKBENCH_OVERDUE_OPTIONS,
  WORKBENCH_SOURCE_MODULE_OPTIONS
} from '@/types/workbench';

import type {
  WorkbenchOverdueFilter,
  WorkbenchSourceModule,
  WorkbenchStatusFilter
} from '@/types/workbench';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import {
  APP_ROLE_LABEL,
  getCurrentUser,
  switchRole,
  type AppRole
} from '@/mock/current-user';

const loading = ref(false);
const tasks = ref<WorkbenchTask[]>([]);

/** 演示：切换身份查看不同角色待办 */
const demoRoles = [
  'projectSpecialist',
  'supervisor',
  'districtSpecialist',
  'cityLeader'
] as const;
type DemoRole = (typeof demoRoles)[number];
const demoRoleLabel: Record<DemoRole, string> = {
  projectSpecialist: APP_ROLE_LABEL.projectSpecialist,
  supervisor: APP_ROLE_LABEL.supervisor,
  districtSpecialist: APP_ROLE_LABEL.districtSpecialist,
  cityLeader: '领导'
};
const currentRole = ref<AppRole>(getCurrentUser().role);
const currentUserLabel = computed(() => {
  const u = getCurrentUser();
  const roleLabel = demoRoles.includes(u.role as DemoRole)
    ? demoRoleLabel[u.role as DemoRole]
    : APP_ROLE_LABEL[u.role];
  return `${u.name}（${roleLabel}）`;
});

const keyword = ref('');
const sourceModuleFilter = ref<WorkbenchSourceModule | 'all'>('all');
const statusFilter = ref<WorkbenchStatusFilter>('all');
const receivedRange = ref<[string, string] | undefined>(undefined);
const overdueFilter = ref<WorkbenchOverdueFilter>('all');

const pagination = reactive({ current: 1, pageSize: 10 });

const counts = computed(() => {
  const base = tasks.value;
  return {
    all: base.length,
    pending_dispose: base.filter((t) => t.status === 'pending_dispose').length,
    pending_review: base.filter((t) => t.status === 'pending_review').length,
    pending_confirm: base.filter((t) => t.status === 'pending_confirm').length,
    pending_read: base.filter((t) => t.status === 'pending_read').length
  };
});

function resetFilters() {
  keyword.value = '';
  sourceModuleFilter.value = 'all';
  statusFilter.value = 'all';
  receivedRange.value = undefined;
  overdueFilter.value = 'all';
  pagination.current = 1;
}

function matchKeyword(task: WorkbenchTask, kw: string) {
  const s = kw.toLowerCase();
  const candidates = [
    task.title,
    task.projectName || '',
    task.projectCode || '',
    task.summary || ''
  ];
  return candidates.some((c) => c.toLowerCase().includes(s));
}

const filteredData = computed(() => {
  const kw = keyword.value.trim();
  const [start, end] = receivedRange.value ?? [undefined, undefined];

  return tasks.value.filter((task) => {
    if (kw && !matchKeyword(task, kw)) return false;
    if (sourceModuleFilter.value !== 'all' && task.sourceModule !== sourceModuleFilter.value)
      return false;
    if (statusFilter.value !== 'all' && task.status !== statusFilter.value) return false;

    if (start && end) {
      const d = task.receivedAt.slice(0, 10); // YYYY-MM-DD
      if (d < start || d > end) return false;
    }

    if (overdueFilter.value === 'overdue' && !task.isOverdue) return false;
    if (overdueFilter.value === 'notOverdue' && task.isOverdue) return false;

    return true;
  });
});

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return filteredData.value.slice(start, start + pagination.pageSize);
});

async function loadTasks() {
  loading.value = true;
  try {
    tasks.value = await workbenchApi.listPending();
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
}

function statusTagColor(status: WorkbenchTask['status']) {
  switch (status) {
    case 'pending_dispose':
      return 'processing';
    case 'pending_review':
      return 'blue';
    case 'pending_confirm':
      return 'orange';
    case 'pending_read':
      return 'purple';
    default:
      return 'default';
  }
}

function getStatusLabel(status: WorkbenchTask['status']) {
  if (status === 'done') return '已完成';
  return WORKBENCH_STATUS_LABEL[status as Exclude<WorkbenchTask['status'], 'done'>];
}

function getSourceLabel(source: unknown) {
  return WORKBENCH_SOURCE_MODULE_LABEL[source as WorkbenchSourceModule] ?? '—';
}

const detailOpen = ref(false);
const detailTask = ref<WorkbenchTask | null>(null);
const submitting = ref(false);
const reviewOpinion = ref('');
const reviewResult = ref<'approve' | 'reject'>('approve');
const confirmNote = ref('');

watch(detailOpen, (open) => {
  if (!open) return;
  reviewOpinion.value = '';
  reviewResult.value = 'approve';
  confirmNote.value = '';
});

function openTask(task: WorkbenchTask) {
  detailTask.value = task;
  detailOpen.value = true;
}

async function handleRoleChange(role: AppRole) {
  switchRole(role);
  currentRole.value = role;
  resetFilters();
  await loadTasks();
  window.dispatchEvent(new CustomEvent('workbench:updated'));
  const label = demoRoles.includes(role as DemoRole)
    ? demoRoleLabel[role as DemoRole]
    : APP_ROLE_LABEL[role];
  message.success(`已切换为${label}视角`);
}

function onDemoRoleChange(value: unknown) {
  if (typeof value === 'string' && (demoRoles as readonly string[]).includes(value)) {
    void handleRoleChange(value as AppRole);
  }
}

async function submitTask() {
  const task = detailTask.value;
  if (!task) return;

  if (task.status === 'pending_review' && !reviewOpinion.value.trim()) {
    message.warning('请填写审核意见');
    return;
  }
  if (task.status === 'pending_confirm' && !confirmNote.value.trim()) {
    message.warning('请填写确认说明');
    return;
  }

  submitting.value = true;
  try {
    await workbenchApi.processTask(task.id, {
      status: task.status,
      expectedUpdatedAt: task.updatedAt,
      reviewResult: task.status === 'pending_review' ? reviewResult.value : undefined,
      opinion:
        task.status === 'pending_review'
          ? reviewOpinion.value.trim()
          : task.status === 'pending_confirm'
            ? confirmNote.value.trim()
            : undefined
    });
    message.success(
      task.status === 'pending_review' && reviewResult.value === 'reject'
        ? '已退回，已生成专员待改待办'
        : '已处理完成'
    );
    detailOpen.value = false;
    await loadTasks();
    window.dispatchEvent(new CustomEvent('workbench:updated'));
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '处理失败');
  } finally {
    submitting.value = false;
  }
}

onMounted(loadTasks);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header__row">
        <div>
          <h2 class="page-title">个人任务中心</h2>
          <p class="page-desc">
            按 PRD 汇聚 8 类业务待办；含领导/片区查阅，以及资金月报（每月1号）与进度周报（每周五晚）。
          </p>
        </div>
        <div class="page-header__role">
          <span class="page-header__user">当前：{{ currentUserLabel }}</span>
          <a-select
            v-model:value="currentRole"
            style="width: 140px"
            :options="demoRoles.map((r) => ({ value: r, label: demoRoleLabel[r] }))"
            @change="onDemoRoleChange"
          />
        </div>
      </div>
    </div>

    <a-card class="summary-card" :bordered="false">
      <div class="summary-grid">
        <div class="summary-item summary-item--all" role="button" tabindex="0" @click="statusFilter = 'all'; handleSearch()">
          <div class="summary-item__value">{{ counts.all }}</div>
          <div class="summary-item__label">待办总数</div>
        </div>
        <div
          class="summary-item summary-item--dispose"
          role="button"
          tabindex="0"
          @click="statusFilter = 'pending_dispose'; handleSearch()"
        >
          <div class="summary-item__value">{{ counts.pending_dispose }}</div>
          <div class="summary-item__label">待处置</div>
        </div>
        <div
          class="summary-item summary-item--review"
          role="button"
          tabindex="0"
          @click="statusFilter = 'pending_review'; handleSearch()"
        >
          <div class="summary-item__value">{{ counts.pending_review }}</div>
          <div class="summary-item__label">待审核</div>
        </div>
        <div
          class="summary-item summary-item--confirm"
          role="button"
          tabindex="0"
          @click="statusFilter = 'pending_confirm'; handleSearch()"
        >
          <div class="summary-item__value">{{ counts.pending_confirm }}</div>
          <div class="summary-item__label">待确认</div>
        </div>
        <div
          class="summary-item summary-item--read"
          role="button"
          tabindex="0"
          @click="statusFilter = 'pending_read'; handleSearch()"
        >
          <div class="summary-item__value">{{ counts.pending_read }}</div>
          <div class="summary-item__label">待查阅</div>
        </div>
      </div>
    </a-card>

    <a-card class="filter-card" :bordered="false">
      <a-form layout="inline" class="filter-form">
        <a-form-item label="关键词">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="标题 / 项目名称 / 项目编码 / 摘要"
            style="width: 260px"
            @press-enter="handleSearch"
          />
        </a-form-item>

        <a-form-item label="来源业务">
          <a-select
            v-model:value="sourceModuleFilter"
            allow-clear
            placeholder="全部来源"
            style="width: 180px"
            :options="WORKBENCH_SOURCE_MODULE_OPTIONS"
            @change="handleSearch"
          />
        </a-form-item>

        <a-form-item label="状态">
          <a-select
            v-model:value="statusFilter"
            allow-clear
            placeholder="全部状态"
            style="width: 160px"
            :options="WORKBENCH_STATUS_OPTIONS"
            @change="handleSearch"
          />
        </a-form-item>

        <a-form-item label="接收时间">
          <a-range-picker
            v-model:value="receivedRange"
            value-format="YYYY-MM-DD"
            style="width: 280px"
            @change="handleSearch"
          />
        </a-form-item>

        <a-form-item label="逾期">
          <a-select
            v-model:value="overdueFilter"
            allow-clear
            placeholder="全部"
            style="width: 150px"
            :options="WORKBENCH_OVERDUE_OPTIONS"
            @change="handleSearch"
          />
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card" :bordered="false">
      <a-spin :spinning="loading">
        <div v-if="pagedData.length" class="workbench-list">
          <a-card
            v-for="task in pagedData"
            :key="task.id"
            class="workbench-task-card"
            :bordered="false"
          >
            <div class="workbench-task-card__row">
              <div class="workbench-task-card__left">
                <div class="workbench-task-card__top-tags">
                  <a-tag v-if="task.isOverdue" color="error" class="task-cell__overdue">
                    <template #icon>
                      <ExclamationCircleOutlined />
                    </template>
                    逾期
                  </a-tag>
                  <a-tag :color="statusTagColor(task.status)">{{ getStatusLabel(task.status) }}</a-tag>
                  <a-tag v-for="t in task.tags" :key="t" class="task-cell__tag">
                    {{ t }}
                  </a-tag>
                </div>

                <div class="workbench-task-card__title">{{ task.title }}</div>
                <div class="workbench-task-card__meta">
                  <span>{{ getSourceLabel(task.sourceModule) }} · {{ task.bizNodeLabel }}（{{ task.bizNode }}）</span>
                  <span>{{ task.projectName || '—' }}</span>
                  <span v-if="task.projectCode" class="workbench-task-card__code">（{{ task.projectCode }}）</span>
                </div>
                <div v-if="task.summary" class="workbench-task-card__summary">{{ task.summary }}</div>
              </div>

              <div class="workbench-task-card__right">
                <a-button
                  type="primary"
                  size="small"
                  :loading="submitting && detailTask?.id === task.id"
                  @click="openTask(task)"
                >
                  {{ task.actionLabel }}
                </a-button>
              </div>
            </div>

            <div class="workbench-task-card__times">
              <span>接收时间：{{ task.receivedAt }}</span>
              <span>
                截止时间：
                <span :class="{ 'dueAt--overdue': task.isOverdue }">{{ task.dueAt || '—' }}</span>
              </span>
            </div>
          </a-card>
        </div>

        <a-empty v-else description="暂无待办事项" />
      </a-spin>

      <div v-if="filteredData.length > pagination.pageSize" class="table-pagination">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="filteredData.length"
          show-size-changer
          show-quick-jumper
          :show-total="(total: number) => `共 ${total} 条`"
        />
      </div>
    </a-card>

    <a-modal
      :open="detailOpen"
      :title="detailTask ? `${getSourceLabel(detailTask.sourceModule)} · ${detailTask.title}` : '任务详情'"
      :width="680"
      destroy-on-close
      :confirm-loading="submitting"
      ok-text="确定"
      @ok="submitTask"
      @cancel="detailOpen = false"
    >
      <template v-if="detailTask">
        <a-descriptions bordered :column="1">
          <a-descriptions-item label="来源业务">
            {{ getSourceLabel(detailTask.sourceModule) }}
          </a-descriptions-item>
          <a-descriptions-item label="流程节点">
            {{ detailTask.bizNodeLabel }}（{{ detailTask.bizNode }}）
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            {{ getStatusLabel(detailTask.status) }}
          </a-descriptions-item>
          <a-descriptions-item label="关联信息">
            {{ detailTask.projectName || '—' }}
            <span v-if="detailTask.projectCode">（{{ detailTask.projectCode }}）</span>
          </a-descriptions-item>
          <a-descriptions-item label="接收时间">{{ detailTask.receivedAt }}</a-descriptions-item>
          <a-descriptions-item label="截止时间">{{ detailTask.dueAt || '—' }}</a-descriptions-item>
          <a-descriptions-item label="摘要">{{ detailTask.summary || '—' }}</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <div v-if="detailTask.status === 'pending_review'">
          <div class="modal-hint">审核结论</div>
          <a-radio-group v-model:value="reviewResult" style="margin-bottom: 12px">
            <a-radio value="approve">通过</a-radio>
            <a-radio value="reject">退回</a-radio>
          </a-radio-group>
          <div class="modal-hint">请填写审核意见（必填）</div>
          <a-textarea v-model:value="reviewOpinion" :rows="4" placeholder="请输入审核意见" />
        </div>

        <div v-else-if="detailTask.status === 'pending_confirm'">
          <div class="modal-hint">请填写确认说明（必填）</div>
          <a-textarea v-model:value="confirmNote" :rows="4" placeholder="请输入确认说明" />
        </div>

        <div v-else>
          <div class="modal-hint">
            {{
              detailTask.status === 'pending_dispose'
                ? '确认已完成处置。'
                : '确认已查阅并标记为已阅。'
            }}
          </div>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<style scoped>
.page {
  padding: 16px 20px 24px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header__role {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.page-header__user {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
  white-space: nowrap;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, rgba(0, 0, 0, 0.88));
}

.page-desc {
  margin: 8px 0 0;
  color: var(--color-text-secondary, rgba(0, 0, 0, 0.45));
  font-size: 14px;
  max-width: 640px;
}

.summary-card {
  margin-bottom: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.filter-card {
  margin-bottom: 16px;
}

.table-card {
  margin-top: 16px;
}

.workbench-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workbench-task-card {
  border-radius: 8px;
}

.workbench-task-card__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.workbench-task-card__left {
  min-width: 0;
  flex: 1;
}

.workbench-task-card__top-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.workbench-task-card__title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, rgba(0, 0, 0, 0.88));
  line-height: 1.4;
}

.workbench-task-card__meta {
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.workbench-task-card__code {
  color: rgba(0, 0, 0, 0.65);
}

.workbench-task-card__summary {
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  line-height: 1.5;
}

.workbench-task-card__times {
  margin-top: 10px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.workbench-task-card__right {
  flex-shrink: 0;
  padding-top: 4px;
}

.table-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.summary-item {
  padding: 14px 12px;
  border-radius: 8px;
  background: rgba(0, 60, 120, 0.06);
  border: 1px solid rgba(0, 180, 255, 0.12);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.summary-item:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 180, 255, 0.35);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.summary-item__value {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text-primary, rgba(0, 0, 0, 0.88));
}

.summary-item__label {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.summary-item--all .summary-item__value {
  color: #1890ff;
}
.summary-item--dispose .summary-item__value {
  color: #52c41a;
}
.summary-item--review .summary-item__value {
  color: #1890ff;
}
.summary-item--confirm .summary-item__value {
  color: #faad14;
}
.summary-item--read .summary-item__value {
  color: #722ed1;
}

.task-cell__head {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.task-cell__overdue {
  margin-right: 2px;
}

.task-cell__tag {
  margin-right: 0;
}

.task-cell__title {
  margin-top: 6px;
  font-weight: 600;
}

.task-cell__meta {
  margin-top: 4px;
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
}

.task-cell__code {
  color: rgba(0, 0, 0, 0.65);
}

.task-cell__summary {
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}

.dueAt--overdue {
  color: #cf1322;
  font-weight: 600;
}

.ellipsis {
  display: inline-block;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.modal-hint {
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 8px;
}
</style>

