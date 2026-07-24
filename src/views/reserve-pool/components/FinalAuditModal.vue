<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { reservePoolApi } from '@/api/reserve-pool';
import {
  getReserveProjectName,
  getReserveResponsibleUnit,
  getReserveTotalInvestment,
  type ReserveProjectItem
} from '@/types/reserve-pool';

const props = defineProps<{
  open: boolean;
  record: ReserveProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  done: [];
}>();

const submitting = ref(false);
const approved = ref(true);
const opinion = ref('');

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    approved.value = true;
    opinion.value = '';
  }
);

const firstAudit = computed(() => props.record?.auditRecords.find((r) => r.stage === 'first'));
const projectName = computed(() => (props.record ? getReserveProjectName(props.record) : ''));

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (!opinion.value.trim()) {
    message.warning('请填写终审意见');
    return;
  }
  submitting.value = true;
  try {
    await reservePoolApi.finalAudit(props.record.id, {
      approved: approved.value,
      opinion: opinion.value.trim()
    });
    message.success(approved.value ? '终审通过，项目已入库' : '不予纳入，已退回发起人');
    emit('done');
    close();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="片区专员终审"
    :width="760"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交终审"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-descriptions bordered size="small" :column="2" style="margin-bottom: 12px">
        <a-descriptions-item label="项目名称" :span="2">{{ projectName }}</a-descriptions-item>
        <a-descriptions-item label="责任单位">
          {{ getReserveResponsibleUnit(record) }}
        </a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">
          {{ getReserveTotalInvestment(record) }}
        </a-descriptions-item>
        <a-descriptions-item label="申报人">{{ record.applicant }}</a-descriptions-item>
        <a-descriptions-item label="申报时间">{{ record.submittedAt || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-card v-if="firstAudit" size="small" title="分管领导初审记录" style="margin-bottom: 16px">
        <a-descriptions size="small" :column="2">
          <a-descriptions-item label="初审人">{{ firstAudit.auditor }}</a-descriptions-item>
          <a-descriptions-item label="初审时间">{{ firstAudit.auditedAt }}</a-descriptions-item>
          <a-descriptions-item label="初审结论">
            {{ firstAudit.result === 'pass' ? '同意' : '驳回' }}
          </a-descriptions-item>
          <a-descriptions-item label="初审意见" :span="2">{{ firstAudit.opinion }}</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-form layout="vertical">
        <a-form-item label="终审结论" required>
          <a-radio-group
            v-model:value="approved"
            :options="[
              { label: '准予纳入储备', value: true },
              { label: '不予纳入', value: false }
            ]"
          />
        </a-form-item>
        <a-form-item label="终审意见" required>
          <a-textarea v-model:value="opinion" :rows="3" placeholder="请填写终审意见" />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
