<script setup lang="ts">
import { computed } from 'vue';
import type {
  RouteIssueStatus,
  RouteProjectProblem,
  RouteProjectTask
} from '@/types/route-planning';
import { ROUTE_ISSUE_STATUS_LABEL } from '@/types/route-planning';

const props = defineProps<{
  open: boolean;
  issueType: 'problem' | 'task';
  issue: RouteProjectProblem | RouteProjectTask | null;
  projectName?: string;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const title = computed(() =>
  props.issueType === 'problem' ? '难题事项详情' : '交办事项详情'
);

const status = computed(() => props.issue?.status as RouteIssueStatus | undefined);

const statusColor = computed(() => {
  if (status.value === 'done') return 'success';
  if (status.value === 'processing') return 'processing';
  return 'warning';
});

const problem = computed(() =>
  props.issueType === 'problem' ? (props.issue as RouteProjectProblem | null) : null
);

const task = computed(() =>
  props.issueType === 'task' ? (props.issue as RouteProjectTask | null) : null
);

function close() {
  emit('update:open', false);
}

function timelineColor(step: { current?: boolean }, index: number, total: number) {
  if (status.value === 'done') return 'green';
  if (step.current) return 'blue';
  if (index < total - 1 && !step.current) {
    // 已完成节点：当前节点之前
    const steps = props.issue?.processSteps ?? [];
    const currentIdx = steps.findIndex((s) => s.current);
    if (currentIdx > index) return 'green';
  }
  return 'gray';
}
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    :width="720"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <template v-if="issue">
      <div class="detail-head">
        <a-tag v-if="status" :color="statusColor">
          {{ ROUTE_ISSUE_STATUS_LABEL[status] }}
        </a-tag>
        <span v-if="projectName" class="detail-head__project">关联项目：{{ projectName }}</span>
      </div>

      <div class="section">
        <div class="section__title">基本信息</div>
        <a-descriptions v-if="problem" bordered :column="2" size="small">
          <a-descriptions-item label="责任单位">{{ problem.responsibleUnit }}</a-descriptions-item>
          <a-descriptions-item label="指派单位">{{ problem.assignUnit }}</a-descriptions-item>
          <a-descriptions-item label="协调内容" :span="2">
            {{ problem.coordinateContent }}
          </a-descriptions-item>
          <a-descriptions-item label="登记人">{{ problem.reporter }}</a-descriptions-item>
          <a-descriptions-item label="登记时间">{{ problem.reportedAt }}</a-descriptions-item>
        </a-descriptions>
        <a-descriptions v-else-if="task" bordered :column="2" size="small">
          <a-descriptions-item label="交办领导">{{ task.assignLeader }}</a-descriptions-item>
          <a-descriptions-item label="责任主体">{{ task.responsibleEntity }}</a-descriptions-item>
          <a-descriptions-item label="交办内容" :span="2">
            {{ task.assignContent }}
          </a-descriptions-item>
          <a-descriptions-item label="登记人">{{ task.reporter }}</a-descriptions-item>
          <a-descriptions-item label="登记时间">{{ task.reportedAt }}</a-descriptions-item>
        </a-descriptions>
      </div>

      <div class="section">
        <div class="section__title">处置流程</div>
        <a-timeline v-if="issue.processSteps.length">
          <a-timeline-item
            v-for="(step, index) in issue.processSteps"
            :key="step.id"
            :color="timelineColor(step, index, issue.processSteps.length)"
          >
            <div class="process-step">
              <div class="process-step__title">
                {{ step.title }}
                <a-tag v-if="step.current" color="blue" class="process-step__tag">当前</a-tag>
              </div>
              <div class="process-step__meta">
                <span>{{ step.operator }}</span>
                <span>·</span>
                <span>{{ step.unit }}</span>
                <span>·</span>
                <span>{{ step.time }}</span>
              </div>
              <div class="process-step__remark">{{ step.remark }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
        <div v-else class="empty-tip">暂无处置流程</div>
      </div>

      <div class="detail-footer">
        <a-button type="primary" @click="close">关闭</a-button>
      </div>
    </template>
  </a-modal>
</template>

<style scoped>
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-head__project {
  font-size: 13px;
  color: var(--color-text-secondary, #8c8c8c);
}

.section {
  margin-bottom: 20px;
}

.section__title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #1f1f1f);
}

.process-step__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #1f1f1f);
}

.process-step__tag {
  margin: 0;
  line-height: 18px;
}

.process-step__meta {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary, #8c8c8c);
}

.process-step__remark {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-primary, #1f1f1f);
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.empty-tip {
  font-size: 13px;
  color: var(--color-text-tertiary, #8c8c8c);
}
</style>
