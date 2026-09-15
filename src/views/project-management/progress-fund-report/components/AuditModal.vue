<script setup lang="ts">
import { message } from 'ant-design-vue';
import { reactive, ref, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: { passed: boolean; comment?: string }];
}>();

const submitting = ref(false);
const form = reactive({
  passed: true,
  comment: ''
});

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    form.passed = true;
    form.comment = '';
  }
);

function close() {
  emit('update:open', false);
}

function onOk() {
  void handleOk();
}

async function handleOk() {
  if (!form.passed && !form.comment.trim()) {
    message.warning('退回时请填写审核意见');
    return;
  }
  submitting.value = true;
  try {
    emit('submit', {
      passed: form.passed,
      comment: form.comment.trim() || undefined
    });
  } finally {
    submitting.value = false;
    close();
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    :width="480"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="确认"
    @ok="onOk"
    @cancel="close"
  >
    <a-form layout="vertical">
      <a-form-item label="审核结论" required>
        <a-radio-group v-model:value="form.passed">
          <a-radio :value="true">通过</a-radio>
          <a-radio :value="false">退回</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="form.passed ? '审核意见（选填）' : '退回意见'" :required="!form.passed">
        <a-textarea
          v-model:value="form.comment"
          :rows="4"
          :placeholder="form.passed ? '可填写审核说明' : '请说明退回原因'"
          :maxlength="300"
          show-count
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
