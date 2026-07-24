<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { workSuspendApi } from '@/api/work-suspend';
import { HOLIDAY_TYPE_LABEL, type WorkSuspendItem } from '@/types/work-suspend';

const props = defineProps<{
  open: boolean;
  record: WorkSuspendItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const isResumed = ref(true);
const resumeDate = ref<string | undefined>();

watch(
  () => props.open,
  (open) => {
    if (!open || !props.record) return;
    isResumed.value = props.record.isResumed ?? true;
    resumeDate.value = props.record.resumeDate;
  }
);

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (isResumed.value && !resumeDate.value) {
    message.warning('请选择复工时间');
    return;
  }
  submitting.value = true;
  try {
    await workSuspendApi.reportResume(props.record.id, {
      isResumed: isResumed.value,
      resumeDate: isResumed.value ? resumeDate.value : undefined
    });
    message.success('复工情况已填报完成');
    emit('saved');
    close();
  } catch (e: any) {
    message.error(e?.message || '填报失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="填报复工情况"
    :width="520"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-descriptions size="small" :column="1" style="margin-bottom: 12px">
        <a-descriptions-item label="项目">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="节假日">
          {{ record.year }}年{{ HOLIDAY_TYPE_LABEL[record.holiday] }}
        </a-descriptions-item>
        <a-descriptions-item label="停工时间">
          {{ record.suspendStartDate }} 至 {{ record.suspendEndDate }}
        </a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical">
        <a-form-item label="是否复工" required>
          <a-radio-group
            v-model:value="isResumed"
            :options="[
              { label: '是', value: true },
              { label: '否', value: false }
            ]"
          />
        </a-form-item>
        <a-form-item v-if="isResumed" label="复工时间" required>
          <a-date-picker v-model:value="resumeDate" value-format="YYYY-MM-DD" style="width: 100%" />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
