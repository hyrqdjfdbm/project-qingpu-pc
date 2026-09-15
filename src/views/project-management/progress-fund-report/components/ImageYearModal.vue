<script setup lang="ts">
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { progressFundReportApi } from '@/api/progress-fund-report';
import { emptyMonthlyFundTargets, cumulativeMonthLabel } from '@/types/progress-fund-report';

const props = defineProps<{
  open: boolean;
  projectId?: string;
  year?: number;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const rejectReason = ref('');
const monthlyCollapsed = ref(false);
const projectOptions = ref<{ value: string; label: string }[]>([]);
const projectLocked = computed(() => Boolean(props.projectId));

const form = reactive({
  projectId: undefined as string | undefined,
  year: new Date().getFullYear(),
  fundTarget: undefined as number | undefined,
  imageProgressTarget: '',
  months: emptyMonthlyFundTargets().map((item) => ({
    ...item,
    label: cumulativeMonthLabel(new Date().getFullYear(), item.month)
  }))
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    projectOptions.value = await progressFundReportApi.listOptions();
    form.projectId = props.projectId;
    form.year = props.year ?? new Date().getFullYear();
    form.fundTarget = undefined;
    form.imageProgressTarget = '';
    rejectReason.value = '';
    monthlyCollapsed.value = false;
    refreshMonthLabels();
    if (form.projectId) await fillExisting();
  }
);

function refreshMonthLabels() {
  form.months = emptyMonthlyFundTargets().map((item) => ({
    ...item,
    label: cumulativeMonthLabel(form.year, item.month)
  }));
}

async function fillExisting() {
  if (!form.projectId) return;
  try {
    const project = await progressFundReportApi.getById(form.projectId);
    const target = project.imageYearTarget;
    if (target && target.year === form.year) {
      form.fundTarget = target.fundTarget;
      form.imageProgressTarget = target.imageProgressTarget;
      rejectReason.value = target.status === 'rejected' ? target.auditComment || '审核已退回' : '';
      form.months = emptyMonthlyFundTargets().map((item) => {
        const row = target.monthlyTargets.find((m) => m.month === item.month);
        return {
          month: item.month,
          label: cumulativeMonthLabel(form.year, item.month),
          fundTarget: row?.fundTarget,
          imageProgressTarget: row?.imageProgressTarget ?? ''
        };
      });
    }
  } catch {
    /* ignore */
  }
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
  if (form.fundTarget === undefined) {
    message.warning('请填写年度投资目标');
    return;
  }
  if (!form.imageProgressTarget.trim()) {
    message.warning('请填写年度形象进度目标');
    return;
  }
  submitting.value = true;
  try {
    await progressFundReportApi.submitImageYear({
      projectId: form.projectId,
      year: form.year,
      fundTarget: form.fundTarget,
      imageProgressTarget: form.imageProgressTarget.trim(),
      monthlyTargets: form.months.map((m) => ({
        month: m.month,
        fundTarget: m.fundTarget,
        imageProgressTarget: m.imageProgressTarget.trim() || undefined
      }))
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
    title="项目进度目标填报"
    :width="860"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交审核"
    @ok="onOk"
    @cancel="close"
  >
    <a-alert
      v-if="rejectReason"
      type="error"
      show-icon
      style="margin-bottom: 16px"
      message="上次审核已退回"
      :description="rejectReason"
    />
    <a-alert
      type="info"
      show-icon
      style="margin-bottom: 16px"
      message="年初填报本年度投资目标、形象进度目标及累计月投资进度目标，提交后由审核管理审核。"
    />
    <a-form layout="vertical">
      <a-form-item label="选择项目" required>
        <a-select
          v-model:value="form.projectId"
          placeholder="请选择项目"
          :options="projectOptions"
          :disabled="projectLocked"
          show-search
          option-filter-prop="label"
        />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="年度" required>
            <a-input-number v-model:value="form.year" :min="2020" :max="2099" :controls="false" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="16">
          <a-form-item label="年度投资目标（万元）" required>
            <a-input-number
              v-model:value="form.fundTarget"
              :min="0"
              :precision="2"
              :controls="false"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="年度形象进度目标" required>
        <a-textarea v-model:value="form.imageProgressTarget" :rows="3" :maxlength="500" show-count />
      </a-form-item>
      <div class="month-block">
        <div class="month-block__head">
          <span>累计月投资进度目标（1-2月～1-12月）</span>
          <a-button type="link" size="small" @click="monthlyCollapsed = !monthlyCollapsed">
            {{ monthlyCollapsed ? '展开' : '收起' }}
            <DownOutlined v-if="monthlyCollapsed" />
            <UpOutlined v-else />
          </a-button>
        </div>
        <div v-show="!monthlyCollapsed" class="month-block__body">
          <div v-for="item in form.months" :key="item.month" class="month-row">
            <div class="month-row__label">{{ item.label }}</div>
            <a-input v-model:value="item.imageProgressTarget" placeholder="进度目标" style="flex: 1" />
            <a-input-number
              v-model:value="item.fundTarget"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="累计图投资目标（万元）"
              style="width: 200px"
            />
          </div>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<style scoped>
.month-block {
  border: 1px solid var(--color-border-secondary, #e8e8e8);
  border-radius: 6px;
  overflow: hidden;
}
.month-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-bg-container, #fafafa);
  font-weight: 600;
}
.month-block__body {
  padding: 12px;
  max-height: 320px;
  overflow: auto;
}
.month-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.month-row__label {
  width: 130px;
  flex-shrink: 0;
  color: var(--color-text-secondary, #8c8c8c);
  font-size: 13px;
}
</style>
