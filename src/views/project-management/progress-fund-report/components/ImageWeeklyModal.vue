<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { progressFundReportApi } from '@/api/progress-fund-report';
import { getWeekInfo } from '@/types/progress-fund-report';

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
  week: 1,
  weekStart: '',
  weekEnd: '',
  content: '',
  progressPercent: undefined as number | undefined
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
    applyWeekInfo();
    form.content = '';
    form.progressPercent = undefined;
    if (form.projectId) await fillExisting();
  }
);

async function fillExisting() {
  if (!form.projectId) return;
  try {
    const project = await progressFundReportApi.getById(form.projectId);
    const row = project.imageWeeklyReports.find((r) => r.year === form.year && r.week === form.week);
    if (row) {
      form.weekStart = row.weekStart;
      form.weekEnd = row.weekEnd;
      form.content = row.content;
      form.progressPercent = row.progressPercent;
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
  if (!form.content.trim()) {
    message.warning('请填写本周形象进度完成情况');
    return;
  }
  submitting.value = true;
  try {
    await progressFundReportApi.submitImageWeekly({
      projectId: form.projectId,
      year: form.year,
      week: form.week,
      weekStart: form.weekStart,
      weekEnd: form.weekEnd,
      content: form.content.trim(),
      progressPercent: form.progressPercent
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
    title="形象进度 · 周进度完成填报"
    :width="640"
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
      <a-form-item label="本周形象进度完成情况" required>
        <a-textarea v-model:value="form.content" :rows="4" :maxlength="500" show-count />
      </a-form-item>
      <a-form-item label="形象进度完成比例（%）">
        <a-input-number
          v-model:value="form.progressPercent"
          :min="0"
          :max="100"
          :precision="1"
          :controls="false"
          style="width: 160px"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
