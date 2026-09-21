<script setup lang="ts">
import { computed } from 'vue';
import { QINGPU_AUDIT_CHANNEL_LABEL } from '@/types/qingpu-supplement';
import {
  QINGPU_WITHDRAW_STATUS_LABEL,
  getQingpuWithdrawStatusColor,
  type QingpuWithdrawItem
} from '@/types/qingpu-withdraw';

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
  record: QingpuWithdrawItem | null;
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

const auditFlow = computed<FlowStep[]>(() => {
  const record = props.record;
  if (!record) return [];

  const auditor = auditorLabel.value;
  const applyStep: FlowStep = {
    title: '项目专员申请退库',
    status: 'done',
    operator: `${record.applicant}（${record.applicantUnit}）`,
    time: record.submittedAt,
    remark: record.reason
  };

  if (record.status === 'pendingReview') {
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

  if (record.status === 'returned') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'error',
        operator: record.auditedBy ? `${record.auditedBy}（${auditor}）` : auditor,
        time: record.auditedAt,
        remark: record.auditOpinion ? `退回：${record.auditOpinion}` : '已退回'
      }
    ];
  }

  if (record.status === 'withdrawn') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'done',
        operator: record.auditedBy ? `${record.auditedBy}（${auditor}）` : auditor,
        time: record.auditedAt,
        remark: record.auditOpinion
          ? `通过：${record.auditOpinion}`
          : record.restoredAt
            ? `审核通过，项目已退库；已于 ${record.restoredAt} 恢复至实施库`
            : '审核通过，项目已退库'
      }
    ];
  }

  if (record.auditedAt) {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'error',
        operator: record.auditedBy ? `${record.auditedBy}（${auditor}）` : auditor,
        time: record.auditedAt,
        remark: record.auditOpinion ? `退回：${record.auditOpinion}` : '已退回'
      },
      {
        title: '撤销退库',
        status: 'done',
        time: record.updatedAt,
        remark: record.revokeReason || '退库申请已撤销'
      }
    ];
  }

  return [
    applyStep,
    {
      title: `${auditor}审核`,
      status: 'wait',
      remark: record.revokeReason ? `申请已撤销：${record.revokeReason}` : '退库申请已撤销，未进入审核'
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
  <a-modal :open="open" title="退库详情" :width="680" destroy-on-close :footer="null" @cancel="close">
    <template v-if="record">
      <div class="section-title">基本信息</div>
      <a-descriptions bordered size="small" :column="2">
        <a-descriptions-item label="申请人">{{ record.applicant }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ record.submittedAt }}</a-descriptions-item>
        <a-descriptions-item label="退库原因" :span="2">{{ record.reason }}</a-descriptions-item>
        <a-descriptions-item label="退库状态">
          <a-tag :color="getQingpuWithdrawStatusColor(record.status)">
            {{ QINGPU_WITHDRAW_STATUS_LABEL[record.status] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="审核通道">
          {{ QINGPU_AUDIT_CHANNEL_LABEL[record.auditChannel] }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.status === 'revoked'" label="撤销原因" :span="2">
          {{ record.revokeReason || '—' }}
        </a-descriptions-item>
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目代码" :span="2">{{ record.projectCode }}</a-descriptions-item>
      </a-descriptions>

      <div class="flow-section">
        <div class="section-title">审核流程</div>
        <a-timeline>
          <a-timeline-item
            v-for="(step, index) in auditFlow"
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
.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.flow-section {
  margin-top: 24px;
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
