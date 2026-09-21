<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { qingpuRestoreApi } from '@/api/qingpu-restore';
import {
  QINGPU_RESTORE_STATUS_LABEL,
  getQingpuRestoreStatusColor,
  type QingpuRestoreItem
} from '@/types/qingpu-restore';

const props = defineProps<{
  open: boolean;
  record: QingpuRestoreItem | null;
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
    await qingpuRestoreApi.audit(props.record.id, {
      approved: approved.value,
      opinion: opinion.value.trim()
    });
    message.success(approved.value ? '审核通过，项目已恢复至实施库' : '已退回申请人');
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
    title="恢复审核"
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
        <a-descriptions-item label="申请时间">{{ record.submittedAt }}</a-descriptions-item>
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="恢复原因" :span="2">{{ record.restoreReason }}</a-descriptions-item>
        <a-descriptions-item label="申请状态">
          <a-tag :color="getQingpuRestoreStatusColor(record.status)">
            {{ QINGPU_RESTORE_STATUS_LABEL[record.status] }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="项目代码">{{ record.projectCode }}</a-descriptions-item>
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
