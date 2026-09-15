<script setup lang="ts">
import type { AuditStatus } from '@/types/progress-fund-report';
import { AUDIT_STATUS_COLOR, AUDIT_STATUS_LABEL } from '@/types/progress-fund-report';

const props = defineProps<{
  status?: AuditStatus;
  comment?: string;
}>();

const tagStatus = () => props.status ?? 'none';
</script>

<template>
  <div class="audit-status-cell">
    <a-tag :color="AUDIT_STATUS_COLOR[tagStatus()]">{{ AUDIT_STATUS_LABEL[tagStatus()] }}</a-tag>
    <div v-if="tagStatus() === 'rejected' && comment" class="audit-status-cell__reason">
      退回原因：{{ comment }}
    </div>
  </div>
</template>

<style scoped>
.audit-status-cell__reason {
  margin-top: 4px;
  color: var(--color-error, #ff4d4f);
  font-size: 12px;
  line-height: 1.5;
  white-space: normal;
  word-break: break-all;
}
</style>
