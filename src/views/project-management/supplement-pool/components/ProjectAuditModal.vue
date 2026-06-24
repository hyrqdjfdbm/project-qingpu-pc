<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { SupplementProjectItem } from '@/types/supplement-pool';

const props = defineProps<{
  open: boolean;
  record: SupplementProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: { approved: boolean; remark?: string }];
}>();

const form = reactive({
  approved: true,
  remark: ''
});

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.approved = true;
      form.remark = '';
    }
  }
);

function close() {
  emit('update:open', false);
}

function handleSubmit() {
  emit('submit', { approved: form.approved, remark: form.remark || undefined });
}
</script>

<template>
  <a-modal
    :open="open"
    title="项目审核"
    :width="480"
    destroy-on-close
    @cancel="close"
  >
    <template v-if="record">
      <p style="margin-bottom: 16px">
        正在审核项目：<strong>{{ record.projectName }}</strong>
      </p>
      <a-form layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model:value="form.approved">
            <a-radio :value="true">项目入库</a-radio>
            <a-radio :value="false">退回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="审核意见">
          <a-textarea
            v-model:value="form.remark"
            placeholder="请输入审核意见（选填）"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </template>

    <template #footer>
      <a-button @click="close">取消</a-button>
      <a-button type="primary" @click="handleSubmit">确认入库</a-button>
    </template>
  </a-modal>
</template>
