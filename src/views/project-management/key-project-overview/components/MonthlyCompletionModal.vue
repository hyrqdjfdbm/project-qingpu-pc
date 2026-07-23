<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { keyProjectApi } from '@/api/key-project-overview';
import type { KeyProjectItem } from '@/types/key-project-overview';
import { calcCompletionRate, getMonthLabel } from '@/types/key-project-overview';

const props = defineProps<{
  open: boolean;
  project: KeyProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const activeMonth = ref(new Date().getMonth() + 1);

const form = reactive({
  actualAmount: undefined as number | undefined,
  remark: ''
});

const monthOptions = computed(() => {
  if (!props.project) return [];
  const year = props.project.imageProgress.year;
  return props.project.imageProgress.monthlyTargets.map((item) => ({
    value: item.month,
    label: getMonthLabel(year, item.month),
    targetAmount: item.targetAmount,
    actualAmount: item.actualAmount
  }));
});

const selectedMonth = computed(() => monthOptions.value.find((item) => item.value === activeMonth.value));

const previewRate = computed(() =>
  calcCompletionRate(form.actualAmount, selectedMonth.value?.targetAmount)
);

watch(
  () => props.open,
  (open) => {
    if (!open || !props.project) return;
    const nowMonth = new Date().getMonth() + 1;
    activeMonth.value = nowMonth;
    const row = props.project.imageProgress.monthlyTargets.find((m) => m.month === nowMonth);
    form.actualAmount = row?.actualAmount;
    form.remark = row?.remark ?? '';
  }
);

watch(activeMonth, (month) => {
  if (!props.project) return;
  const row = props.project.imageProgress.monthlyTargets.find((m) => m.month === month);
  form.actualAmount = row?.actualAmount;
  form.remark = row?.remark ?? '';
});

function close() {
  emit('update:open', false);
}

async function handleSubmit() {
  if (!props.project) return;
  if (form.actualAmount === undefined) {
    message.warning('请填写本月形象进度完成金额');
    return;
  }

  submitting.value = true;
  try {
    await keyProjectApi.saveMonthlyCompletion(props.project.id, {
      year: props.project.imageProgress.year,
      month: activeMonth.value,
      actualAmount: form.actualAmount,
      remark: form.remark.trim() || undefined
    });
    message.success('月度完成情况已保存');
    emit('saved');
    close();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :title="project ? `月度完成情况 — ${project.projectName}` : '月度完成情况'"
    :width="720"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="保存"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="close"
  >
    <a-form layout="vertical">
      <a-form-item label="填报月份" required>
        <a-select v-model:value="activeMonth" :options="monthOptions" style="width: 100%" />
      </a-form-item>

      <a-descriptions bordered size="small" :column="2" style="margin-bottom: 16px">
        <a-descriptions-item label="月度目标（万元）">
          {{ selectedMonth?.targetAmount ?? '未设定' }}
        </a-descriptions-item>
        <a-descriptions-item label="预计完成率">
          {{ previewRate != null ? `${previewRate}%` : '—' }}
        </a-descriptions-item>
      </a-descriptions>

      <a-form-item label="本月形象进度完成（万元）" required>
        <a-input-number
          v-model:value="form.actualAmount"
          :min="0"
          :precision="2"
          :controls="false"
          placeholder="请输入本月实际完成金额"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="完成情况说明">
        <a-textarea
          v-model:value="form.remark"
          :rows="3"
          placeholder="可填写进度亮点、存在问题等"
          allow-clear
        />
      </a-form-item>
    </a-form>

    <div class="month-summary">
      <div class="month-summary__title">各月填报一览</div>
      <a-table
        :columns="[
          { title: '月份', dataIndex: 'label', key: 'label', width: 120 },
          { title: '目标（万元）', dataIndex: 'targetAmount', key: 'targetAmount', align: 'right' },
          { title: '完成（万元）', dataIndex: 'actualAmount', key: 'actualAmount', align: 'right' },
          { title: '完成率', key: 'rate', width: 90, align: 'right' }
        ]"
        :data-source="
          monthOptions.map((item) => ({
            ...item,
            key: item.value,
            rate:
              calcCompletionRate(item.actualAmount, item.targetAmount) != null
                ? `${calcCompletionRate(item.actualAmount, item.targetAmount)}%`
                : '—'
          }))
        "
        :pagination="false"
        size="small"
        bordered
      />
    </div>
  </a-modal>
</template>

<style scoped>
.month-summary {
  margin-top: 8px;
}

.month-summary__title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text, #1f1f1f);
}
</style>
