<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { qingpuRestoreApi } from '@/api/qingpu-restore';
import { QINGPU_AUDIT_CHANNEL_LABEL } from '@/types/qingpu-supplement';
import type { QingpuWithdrawnProject } from '@/types/qingpu-restore';

const props = defineProps<{
  open: boolean;
  record: QingpuWithdrawnProject | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const restoreReason = ref('');

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    restoreReason.value = '';
  }
);

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (!restoreReason.value.trim()) {
    message.warning('请填写恢复原因');
    return;
  }
  submitting.value = true;
  try {
    await qingpuRestoreApi.create({
      withdrawId: props.record.withdrawId,
      restoreReason: restoreReason.value.trim()
    });
    message.success('已流转至审核专员审核，请耐心等候～');
    emit('saved');
    close();
  } catch (e: any) {
    message.error(e?.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="申请恢复入库"
    :width="640"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交申请"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-descriptions bordered size="small" :column="2" class="info">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目代码" :span="2">{{ record.projectCode }}</a-descriptions-item>
        <a-descriptions-item label="纳统归属">{{ record.statisticalBelonging }}</a-descriptions-item>
        <a-descriptions-item label="审核通道">
          {{ QINGPU_AUDIT_CHANNEL_LABEL[record.auditChannel] }}
        </a-descriptions-item>
        <a-descriptions-item label="退库原因" :span="2">{{ record.withdrawReason }}</a-descriptions-item>
      </a-descriptions>
      <a-form layout="vertical">
        <a-form-item label="恢复原因" required>
          <a-textarea v-model:value="restoreReason" :rows="4" placeholder="请说明申请恢复入库的原因" />
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
