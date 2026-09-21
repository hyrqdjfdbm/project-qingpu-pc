<script setup lang="ts">
import { computed } from 'vue';
import {
  QINGPU_RESTORE_STATUS_LABEL,
  getQingpuRestoreStatusColor,
  type QingpuWithdrawnProject
} from '@/types/qingpu-restore';
import { QINGPU_AUDIT_CHANNEL_LABEL } from '@/types/qingpu-supplement';

type FlowStepStatus = 'done' | 'current' | 'wait' | 'error';

interface FlowStep {
  title: string;
  status: FlowStepStatus;
  operator?: string;
  time?: string;
  remark?: string;
}

const props = defineProps<{
  open: boolean;
  record: QingpuWithdrawnProject | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

function close() {
  emit('update:open', false);
}

const auditorLabel = computed(() =>
  props.record ? QINGPU_AUDIT_CHANNEL_LABEL[props.record.auditChannel] : '审核专员'
);

const restoreFlow = computed<FlowStep[]>(() => {
  const restore = props.record?.restore;
  const auditor = auditorLabel.value;
  if (!restore) {
    return [
      { title: '项目专员申请恢复', status: 'wait', remark: '未开始' },
      { title: `${auditor}审核`, status: 'wait', remark: '未开始' }
    ];
  }

  const applyStep: FlowStep = {
    title: '项目专员申请恢复',
    status: 'done',
    operator: `${restore.applicant}（${restore.applicantUnit}）`,
    time: restore.submittedAt,
    remark: restore.restoreReason
  };

  if (restore.status === 'pendingReview') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'current',
        operator: auditor,
        remark: '待审核'
      }
    ];
  }

  if (restore.status === 'returned') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'error',
        operator: restore.auditedBy ? `${restore.auditedBy}（${auditor}）` : auditor,
        time: restore.auditedAt,
        remark: restore.auditOpinion ? `退回：${restore.auditOpinion}` : '已退回'
      }
    ];
  }

  if (restore.status === 'restored') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'done',
        operator: restore.auditedBy ? `${restore.auditedBy}（${auditor}）` : auditor,
        time: restore.auditedAt,
        remark: restore.auditOpinion
          ? `通过：${restore.auditOpinion}`
          : '审核通过，已恢复至实施库'
      }
    ];
  }

  return [
    applyStep,
    {
      title: `${auditor}审核`,
      status: 'wait',
      remark: restore.revokeReason ? `申请已撤销：${restore.revokeReason}` : '恢复申请已撤销，未进入审核'
    }
  ];
});

function stepColor(status: FlowStepStatus) {
  if (status === 'done') return 'green';
  if (status === 'current') return 'blue';
  if (status === 'error') return 'red';
  return 'gray';
}

function stepTag(status: FlowStepStatus) {
  if (status === 'current') return { color: 'blue', text: '当前' };
  if (status === 'error') return { color: 'error', text: '退回' };
  if (status === 'done') return { color: 'success', text: '完成' };
  return { color: 'default', text: '未开始' };
}
</script>

<template>
  <a-modal :open="open" title="退库项目详情" :width="680" destroy-on-close :footer="null" @cancel="close">
    <template v-if="record">
      <a-descriptions bordered size="small" :column="2">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目代码" :span="2">{{ record.projectCode }}</a-descriptions-item>
        <a-descriptions-item label="总投资">{{ record.totalInvestment ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="纳统归属">{{ record.statisticalBelonging }}</a-descriptions-item>
        <a-descriptions-item label="责任单位" :span="2">
          {{ record.responsibleUnits.join('、') }}
        </a-descriptions-item>
        <a-descriptions-item label="退库申请人">
          {{ record.withdrawApplicant }}（{{ record.withdrawApplicantUnit }}）
        </a-descriptions-item>
        <a-descriptions-item label="退库时间">{{ record.withdrawnAt }}</a-descriptions-item>
        <a-descriptions-item label="退库原因" :span="2">{{ record.withdrawReason }}</a-descriptions-item>
        <a-descriptions-item label="审核通道">
          {{ QINGPU_AUDIT_CHANNEL_LABEL[record.auditChannel] }}
        </a-descriptions-item>
        <a-descriptions-item label="恢复状态">
          <a-tag v-if="record.restore" :color="getQingpuRestoreStatusColor(record.restore.status)">
            {{ QINGPU_RESTORE_STATUS_LABEL[record.restore.status] }}
          </a-tag>
          <span v-else>未申请</span>
        </a-descriptions-item>
      </a-descriptions>

      <div class="flow-section">
        <div class="flow-section__title">审核流程</div>
        <a-timeline>
          <a-timeline-item
            v-for="(step, index) in restoreFlow"
            :key="index"
            :color="stepColor(step.status)"
          >
            <div class="process-step">
              <div class="process-step__title">
                {{ step.title }}
                <a-tag :color="stepTag(step.status).color" class="process-step__tag">
                  {{ stepTag(step.status).text }}
                </a-tag>
              </div>
              <div v-if="step.operator || step.time" class="process-step__meta">
                <span v-if="step.operator">{{ step.operator }}</span>
                <template v-if="step.operator && step.time">
                  <span>·</span>
                </template>
                <span v-if="step.time">{{ step.time }}</span>
              </div>
              <div v-if="step.remark" class="process-step__remark">{{ step.remark }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </template>
  </a-modal>
</template>

<style scoped>
.flow-section {
  margin-top: 16px;
}

.flow-section__title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.process-step__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  color: var(--color-text-secondary);
}

.process-step__remark {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-primary);
}
</style>
