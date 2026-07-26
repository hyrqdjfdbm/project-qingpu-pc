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
    message.warning('不予纳入时请写明具体原因');
    return;
  }
  submitting.value = true;
  try {
    await supplementLibraryApi.finalAudit(props.record.id, {
      approved: approved.value,
      opinion: opinion.value.trim()
    });
    message.success(
      approved.value ? '终审通过，项目已进入实施库' : '已不予纳入，退回申请人'
    );
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
    title="增补终审"
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

      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 12px"
        message="准予纳入后，系统将写入实施库；未填项目代码时将自动赋码。"
      />

      <a-form layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group
            v-model:value="approved"
            :options="[
              { label: '准予纳入实施库', value: true },
              { label: '不予纳入', value: false }
            ]"
          />
        </a-form-item>
        <a-form-item label="审核意见" required>
          <a-textarea
            v-model:value="opinion"
            :rows="3"
            :placeholder="approved ? '请填写审核意见' : '不予纳入必须写明原因'"
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
