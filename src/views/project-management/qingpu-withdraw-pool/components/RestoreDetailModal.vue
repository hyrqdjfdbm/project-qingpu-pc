<script setup lang="ts">
import type { QingpuRestoreItem } from '@/types/qingpu-restore';
import { QINGPU_AUDIT_CHANNEL_LABEL } from '@/types/qingpu-supplement';

defineProps<{
  open: boolean;
  record: QingpuRestoreItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

function close() {
  emit('update:open', false);
}
</script>

<template>
  <a-modal :open="open" title="恢复申请详情" :width="680" destroy-on-close :footer="null" @cancel="close">
    <template v-if="record">
      <a-descriptions bordered size="small" :column="2">
        <a-descriptions-item label="申请人">{{ record.applicant }}（{{ record.applicantUnit }}）</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ record.submittedAt }}</a-descriptions-item>
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目代码" :span="2">{{ record.projectCode }}</a-descriptions-item>
        <a-descriptions-item label="纳统归属">{{ record.statisticalBelonging }}</a-descriptions-item>
        <a-descriptions-item label="审核通道">
          {{ QINGPU_AUDIT_CHANNEL_LABEL[record.auditChannel] }}
        </a-descriptions-item>
        <a-descriptions-item label="责任单位" :span="2">
          {{ record.responsibleUnits.join('、') }}
        </a-descriptions-item>
        <a-descriptions-item label="退库原因" :span="2">{{ record.withdrawReason }}</a-descriptions-item>
        <a-descriptions-item label="恢复原因" :span="2">{{ record.restoreReason }}</a-descriptions-item>
        <a-descriptions-item v-if="record.auditOpinion" label="审核意见" :span="2">
          {{ record.auditOpinion }}
        </a-descriptions-item>
      </a-descriptions>
    </template>
  </a-modal>
</template>
