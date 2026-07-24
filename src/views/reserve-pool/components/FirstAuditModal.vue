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

const projectName = computed(() => (props.record ? getReserveProjectName(props.record) : ''));

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (!opinion.value.trim()) {
    message.warning('请填写初审意见');
    return;
  }
  if (!approved.value && opinion.value.trim().length < 4) {
    message.warning('驳回时请写明具体原因');
    return;
  }
  submitting.value = true;
  try {
    await reservePoolApi.firstAudit(props.record.id, {
      approved: approved.value,
      opinion: opinion.value.trim()
    });
    message.success(approved.value ? '初审通过，已流转至待终审' : '已驳回，退回申请人');
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
    title="分管领导初审"
    :width="720"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交审核"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-descriptions bordered size="small" :column="2" style="margin-bottom: 16px">
        <a-descriptions-item label="项目名称" :span="2">{{ projectName }}</a-descriptions-item>
        <a-descriptions-item label="责任单位">
          {{ getReserveResponsibleUnit(record) }}
        </a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">
          {{ getReserveTotalInvestment(record) }}
        </a-descriptions-item>
        <a-descriptions-item label="申报人">
          {{ record.applicant }}（{{ record.applicantUnit }}）
        </a-descriptions-item>
        <a-descriptions-item label="申报时间">{{ record.submittedAt || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group
            v-model:value="approved"
            :options="[
              { label: '同意', value: true },
              { label: '驳回', value: false }
            ]"
          />
        </a-form-item>
        <a-form-item label="初审意见" required>
          <a-textarea
            v-model:value="opinion"
            :rows="3"
            :placeholder="approved ? '请填写初审意见' : '驳回必须写明原因'"
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
