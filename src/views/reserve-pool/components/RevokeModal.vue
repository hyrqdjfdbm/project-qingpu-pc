<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { reservePoolApi } from '@/api/reserve-pool';
import {
  RESERVE_FLOW_STATUS_LABEL,
  getReserveProjectName,
  type ReserveProjectItem
} from '@/types/reserve-pool';

const props = defineProps<{
  open: boolean;
  record: ReserveProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const reason = ref('');

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    reason.value = '';
  }
);

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  submitting.value = true;
  try {
    await reservePoolApi.revoke(props.record.id, {
      reason: reason.value.trim() || undefined
    });
    message.success('申请已撤销');
    emit('saved');
    close();
  } catch (e: any) {
    message.error(e?.message || '撤销失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="撤销申请"
    :width="560"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="确认撤销"
    ok-type="danger"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-alert
        type="warning"
        show-icon
        style="margin-bottom: 12px"
        :message="`即将撤销：${getReserveProjectName(record)}`"
        :description="`当前状态：${RESERVE_FLOW_STATUS_LABEL[record.status]}。待审核状态可直接撤销。`"
      />
      <a-form layout="vertical">
        <a-form-item label="撤销原因（选填）">
          <a-textarea
            v-model:value="reason"
            :rows="4"
            placeholder="可填写撤销说明"
            :maxlength="300"
            show-count
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
