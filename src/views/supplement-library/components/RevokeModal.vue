<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { supplementLibraryApi } from '@/api/supplement-library';
import {
  SUPPLEMENT_LIBRARY_STATUS_LABEL,
  type SupplementLibraryItem
} from '@/types/supplement-library';

const props = defineProps<{
  open: boolean;
  record: SupplementLibraryItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const reason = ref('');

const needReason = computed(
  () => Boolean(props.record && props.record.status !== 'pendingReview')
);

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
  if (needReason.value && !reason.value.trim()) {
    message.warning('请填写撤销原因');
    return;
  }
  submitting.value = true;
  try {
    await supplementLibraryApi.revoke(
      props.record.id,
      reason.value.trim() || undefined
    );
    message.success('申报已撤销');
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
    title="撤销申报"
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
        :message="`即将撤销：${record.projectName}`"
        :description="`当前申报状态：${SUPPLEMENT_LIBRARY_STATUS_LABEL[record.status]}`"
      />
      <a-form layout="vertical">
        <a-form-item :label="needReason ? '撤销原因' : '撤销原因（选填）'" :required="needReason">
          <a-textarea
            v-model:value="reason"
            :rows="4"
            :placeholder="needReason ? '非待审核状态须填写撤销原因' : '可填写撤销说明'"
            :maxlength="300"
            show-count
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
