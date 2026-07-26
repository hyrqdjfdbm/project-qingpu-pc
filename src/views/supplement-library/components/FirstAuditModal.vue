<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { supplementLibraryApi } from '@/api/supplement-library';
import type { SupplementLibraryItem } from '@/types/supplement-library';

const props = defineProps<{
  open: boolean;
  record: SupplementLibraryItem | null;
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

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (!opinion.value.trim()) {
    message.warning('请填写审核意见');
    return;
  }
  if (!approved.value && opinion.value.trim().length < 4) {
    message.warning('驳回时请写明具体原因');
    return;
  }
  submitting.value = true;
  try {
    await supplementLibraryApi.firstAudit(props.record.id, {
      approved: approved.value,
      opinion: opinion.value.trim()
    });
    message.success(approved.value ? '初审通过，已流转至增补终审' : '已驳回，退回申请人');
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
    title="增补初审"
    :width="640"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交审核"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-descriptions bordered size="small" :column="2" style="margin-bottom: 16px">
        <a-descriptions-item label="申请人">{{ record.applicant }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ record.submittedAt || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目代码" :span="2">
          {{ record.projectCode || '—' }}
        </a-descriptions-item>
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
        <a-form-item label="审核意见" required>
          <a-textarea
            v-model:value="opinion"
            :rows="3"
            :placeholder="approved ? '请填写审核意见' : '驳回必须写明原因'"
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
