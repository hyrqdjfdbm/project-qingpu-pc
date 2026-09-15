<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { qingpuSupplementApi } from '@/api/qingpu-supplement';
import type { QingpuSupplementItem } from '@/types/qingpu-supplement';

const props = defineProps<{
  open: boolean;
  record: QingpuSupplementItem | null;
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
  if (!approved.value && !opinion.value.trim()) {
    message.warning('退回时请填写审核意见');
    return;
  }
  if (!approved.value && opinion.value.trim().length < 4) {
    message.warning('退回时请写明具体原因');
    return;
  }
  submitting.value = true;
  try {
    await qingpuSupplementApi.audit(props.record.id, {
      approved: approved.value,
      opinion: opinion.value.trim()
    });
    message.success(approved.value ? '审核通过，项目已进入实施库' : '已退回申请人');
    emit('done');
    close();
  } catch (e: any) {
    message.error(e?.message || '审核失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="增补审核"
    :width="640"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交审核"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-descriptions bordered size="small" :column="2" class="info">
        <a-descriptions-item label="申请人">{{ record.applicant }}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{ record.submittedAt || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group
            v-model:value="approved"
            :options="[
              { label: '通过', value: true },
              { label: '退回', value: false }
            ]"
          />
        </a-form-item>
        <a-form-item label="审核意见" :required="!approved">
          <a-textarea
            v-model:value="opinion"
            :rows="3"
            :placeholder="approved ? '选填' : '退回必须写明原因'"
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>

<style scoped>
.info {
  margin-bottom: 16px;
}
</style>
