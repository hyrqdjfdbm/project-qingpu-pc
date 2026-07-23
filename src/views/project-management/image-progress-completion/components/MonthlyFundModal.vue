<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { imageProgressCompletionApi } from '@/api/image-progress-completion';

const props = defineProps<{
  open: boolean;
  projectId?: string;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const projectOptions = ref<{ value: string; label: string }[]>([]);
const projectLocked = computed(() => Boolean(props.projectId));

const form = reactive({
  projectId: undefined as string | undefined,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  completedAmount: undefined as number | undefined,
  cumulativeAmount: undefined as number | undefined,
  remark: ''
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    projectOptions.value = await imageProgressCompletionApi.listOptions();
    form.projectId = props.projectId;
    form.year = new Date().getFullYear();
    form.month = new Date().getMonth() + 1;
    form.completedAmount = undefined;
    form.cumulativeAmount = undefined;
    form.remark = '';

    if (form.projectId) await fillExisting();
  }
);

watch([() => form.projectId, () => form.year, () => form.month], async () => {
  if (!props.open || !form.projectId) return;
  await fillExisting();
});

async function fillExisting() {
  if (!form.projectId) return;
  try {
    const project = await imageProgressCompletionApi.getById(form.projectId);
    const row = project.monthlyFundReports.find(
      (r) => r.year === form.year && r.month === form.month
    );
    if (row) {
      form.completedAmount = row.completedAmount;
      form.cumulativeAmount = row.cumulativeAmount;
      form.remark = row.remark ?? '';
    } else {
      form.completedAmount = undefined;
      form.cumulativeAmount = undefined;
      form.remark = '';
    }
  } catch {
    /* ignore */
  }
}

function close() {
  emit('update:open', false);
}

async function handleSubmit() {
  if (!form.projectId) {
    message.warning('请选择项目');
    return;
  }
  if (form.completedAmount === undefined) {
    message.warning('请填写本月完成资金');
    return;
  }
  if (form.cumulativeAmount === undefined) {
    message.warning('请填写累计完成资金');
    return;
  }

  submitting.value = true;
  try {
    await imageProgressCompletionApi.saveMonthlyFund({
      projectId: form.projectId,
      year: form.year,
      month: form.month,
      completedAmount: form.completedAmount,
      cumulativeAmount: form.cumulativeAmount,
      remark: form.remark.trim() || undefined
    });
    message.success('月度资金进度已保存');
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
    title="月度资金进度填报"
    :width="560"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="保存"
    @ok="handleSubmit"
    @cancel="close"
  >
    <a-form layout="vertical">
      <a-form-item label="选择项目" required>
        <a-select
          v-model:value="form.projectId"
          placeholder="请选择项目"
          :options="projectOptions"
          :disabled="projectLocked"
          show-search
          option-filter-prop="label"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="填报月份" required>
        <a-space>
          <a-input-number
            v-model:value="form.year"
            :min="2020"
            :max="2099"
            :controls="false"
            style="width: 100px"
            addon-after="年"
          />
          <a-select
            v-model:value="form.month"
            style="width: 120px"
            :options="
              Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }))
            "
          />
        </a-space>
      </a-form-item>
      <a-form-item label="本月完成资金（万元）" required>
        <a-input-number
          v-model:value="form.completedAmount"
          :min="0"
          :precision="2"
          :controls="false"
          style="width: 100%"
          placeholder="请输入本月完成资金"
        />
      </a-form-item>
      <a-form-item label="累计完成资金（万元）" required>
        <a-input-number
          v-model:value="form.cumulativeAmount"
          :min="0"
          :precision="2"
          :controls="false"
          style="width: 100%"
          placeholder="请输入累计完成资金"
        />
      </a-form-item>
      <a-form-item label="备注">
        <a-textarea v-model:value="form.remark" :rows="3" placeholder="可选，补充说明" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
