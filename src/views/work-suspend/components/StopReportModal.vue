<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { workSuspendApi } from '@/api/work-suspend';
import {
  HOLIDAY_TYPE_LABEL,
  type WorkSuspendItem
} from '@/types/work-suspend';

const props = defineProps<{
  open: boolean;
  record: WorkSuspendItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const isSuspended = ref(true);
const dateRange = ref<[string, string] | undefined>();

watch(
  () => props.open,
  (open) => {
    if (!open || !props.record) return;
    isSuspended.value = props.record.isSuspended ?? true;
    dateRange.value =
      props.record.suspendStartDate && props.record.suspendEndDate
        ? [props.record.suspendStartDate, props.record.suspendEndDate]
        : undefined;
  }
);

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (isSuspended.value) {
    if (!dateRange.value?.[0] || !dateRange.value?.[1]) {
      message.warning('请选择停工时间区间');
      return;
    }
    if (dateRange.value[1] < dateRange.value[0]) {
      message.warning('停工结束日期不能早于开始日期');
      return;
    }
  }
  submitting.value = true;
  try {
    await workSuspendApi.reportStop(props.record.id, {
      isSuspended: isSuspended.value,
      suspendStartDate: isSuspended.value ? dateRange.value![0] : undefined,
      suspendEndDate: isSuspended.value ? dateRange.value![1] : undefined
    });
    message.success(
      isSuspended.value ? '停工情况已填报，请继续填报停工期间每日在岗人数' : '已确认不停工，本条填报完成'
    );
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
    title="填报停工情况"
    :width="560"
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
        <a-descriptions-item label="责任单位">{{ record.responsibleUnit }}</a-descriptions-item>
      </a-descriptions>

      <a-form layout="vertical">
        <a-form-item label="是否停工" required>
          <a-radio-group
            v-model:value="isSuspended"
            :options="[
              { label: '是', value: true },
              { label: '否', value: false }
            ]"
          />
        </a-form-item>
        <a-form-item v-if="isSuspended" label="停工时间" required>
          <a-range-picker
            v-model:value="dateRange"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
          <div style="margin-top: 4px; color: rgba(0, 0, 0, 0.45); font-size: 12px">
            请选择停工起止日期（如 5月1日-5月5日）
          </div>
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
