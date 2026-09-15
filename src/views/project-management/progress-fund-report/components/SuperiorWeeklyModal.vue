<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { progressFundReportApi } from '@/api/progress-fund-report';
import {
  getWeekInfo,
  SUPERIOR_POLICY_LABEL,
  type SuperiorPolicyKey
} from '@/types/progress-fund-report';

const props = defineProps<{
  open: boolean;
  projectId?: string;
  policy?: SuperiorPolicyKey;
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
  policy: 'specialBond' as SuperiorPolicyKey,
  year: new Date().getFullYear(),
  week: 1,
  weekStart: '',
  weekEnd: '',
  completedAmount: undefined as number | undefined,
  cumulativeAmount: undefined as number | undefined,
  remark: ''
});

function applyWeekInfo(date = new Date()) {
  const info = getWeekInfo(date);
  form.year = info.year;
  form.week = info.week;
  form.weekStart = info.weekStart;
  form.weekEnd = info.weekEnd;
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    projectOptions.value = await progressFundReportApi.listOptions();
    form.projectId = props.projectId;
    form.policy = props.policy ?? 'specialBond';
    applyWeekInfo();
    form.completedAmount = undefined;
    form.cumulativeAmount = undefined;
    form.remark = '';
    if (form.projectId) await fillExisting();
  }
);

async function fillExisting() {
  if (!form.projectId) return;
  try {
    const project = await progressFundReportApi.getById(form.projectId);
    const row = project.superior[form.policy].weeklyReports.find(
      (r) => r.year === form.year && r.week === form.week
    );
    if (row) {
      form.completedAmount = row.completedAmount;
      form.cumulativeAmount = row.cumulativeAmount;
      form.remark = row.remark ?? '';
    }
  } catch {
    /* ignore */
  }
}

function onWeekStartChange(val: string | { format?: (f: string) => string } | undefined) {
  if (!val) return;
  const dateStr = typeof val === 'string' ? val : val.format?.('YYYY-MM-DD');
  if (!dateStr) return;
  applyWeekInfo(new Date(dateStr.replace(/-/g, '/')));
}

function close() {
  emit('update:open', false);
}

function onOk() {
  void handleSubmit();
}

async function handleSubmit() {
  if (!form.projectId) {
    message.warning('请选择项目');
    return;
  }
  if (form.completedAmount === undefined || form.cumulativeAmount === undefined) {
    message.warning('请填写本周完成资金和累计完成资金');
    return;
  }
  submitting.value = true;
  try {
    await progressFundReportApi.submitSuperiorWeekly({
      projectId: form.projectId,
      policy: form.policy,
      year: form.year,
      week: form.week,
      weekStart: form.weekStart,
      weekEnd: form.weekEnd,
      completedAmount: form.completedAmount,
      cumulativeAmount: form.cumulativeAmount,
      remark: form.remark.trim() || undefined
    });
    message.success('已提交审核');
    emit('saved');
  } finally {
    submitting.value = false;
    close();
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="上级资金 · 周资金完成填报"
    :width="560"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交审核"
    @ok="onOk"
    @cancel="close"
  >
    <a-form layout="vertical">
      <a-form-item label="选择项目" required>
        <a-select
          v-model:value="form.projectId"
          :options="projectOptions"
          :disabled="projectLocked"
          show-search
          option-filter-prop="label"
        />
      </a-form-item>
      <a-form-item label="资金类型" required>
        <a-radio-group v-model:value="form.policy">
          <a-radio v-for="(label, key) in SUPERIOR_POLICY_LABEL" :key="key" :value="key">{{ label }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="周起始日（周一）" required>
        <a-date-picker
          :value="form.weekStart || undefined"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          @update:value="onWeekStartChange"
        />
      </a-form-item>
      <a-form-item label="填报周次">
        <a-input :value="`${form.year}年第${form.week}周（${form.weekStart} ~ ${form.weekEnd}）`" disabled />
      </a-form-item>
      <a-form-item label="本周完成资金（万元）" required>
        <a-input-number
          v-model:value="form.completedAmount"
          :min="0"
          :precision="2"
          :controls="false"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="累计完成资金（万元）" required>
        <a-input-number
          v-model:value="form.cumulativeAmount"
          :min="0"
          :precision="2"
          :controls="false"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="备注">
        <a-textarea v-model:value="form.remark" :rows="3" placeholder="可选" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
