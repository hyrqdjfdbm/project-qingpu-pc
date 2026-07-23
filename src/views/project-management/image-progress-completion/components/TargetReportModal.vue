<script setup lang="ts">
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { imageProgressCompletionApi } from '@/api/image-progress-completion';
import {
  createEmptyMonthlyTargets,
  getMonthLabel
} from '@/types/image-progress-completion';

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
const monthlyCollapsed = ref(false);
const projectOptions = ref<{ value: string; label: string }[]>([]);
const projectLocked = computed(() => Boolean(props.projectId));

const form = reactive({
  projectId: undefined as string | undefined,
  year: new Date().getFullYear(),
  fundTarget: undefined as number | undefined,
  imageProgressTarget: '',
  months: createEmptyMonthlyTargets().map((item) => ({
    month: item.month,
    label: getMonthLabel(new Date().getFullYear(), item.month),
    fundTarget: undefined as number | undefined,
    imageProgressTarget: ''
  }))
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    projectOptions.value = await imageProgressCompletionApi.listOptions();
    form.projectId = props.projectId;
    form.year = props.year ?? new Date().getFullYear();
    form.fundTarget = undefined;
    form.imageProgressTarget = '';
    form.months = createEmptyMonthlyTargets().map((item) => ({
      month: item.month,
      label: getMonthLabel(form.year, item.month),
      fundTarget: undefined as number | undefined,
      imageProgressTarget: ''
    }));
    monthlyCollapsed.value = false;
    if (form.projectId) await fillExisting(form.projectId);
  }
);

watch(
  () => form.projectId,
  async (id) => {
    if (!props.open || !id) return;
    await fillExisting(id);
  }
);

async function fillExisting(projectId: string) {
  try {
    const project = await imageProgressCompletionApi.getById(projectId, form.year);
    const target = project.yearTarget;
    if (target && target.year === form.year) {
      form.fundTarget = target.fundTarget;
      form.imageProgressTarget = target.imageProgressTarget;
      form.months = createEmptyMonthlyTargets().map((item) => {
        const row = target.monthlyTargets.find((m) => m.month === item.month);
        return {
          month: item.month,
          label: getMonthLabel(form.year, item.month),
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

async function handleSubmit() {
  if (!form.projectId) {
    message.warning('请选择项目');
    return;
  }
  if (form.fundTarget === undefined || form.fundTarget < 0) {
    message.warning('请填写年度资金目标');
    return;
  }
  if (!form.imageProgressTarget.trim()) {
    message.warning('请填写年度形象进度目标');
    return;
  }

  submitting.value = true;
  try {
    await imageProgressCompletionApi.saveYearTarget({
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
    message.success('年度及月度进度目标已保存');
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
    title="项目进度目标填报"
    :width="860"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="保存"
    @ok="handleSubmit"
    @cancel="close"
  >
    <a-alert
      type="info"
      show-icon
      style="margin-bottom: 16px"
      message="年初填报本年度资金目标、形象进度目标及各月分解目标。"
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
          style="width: 100%"
        />
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="年度" required>
            <a-input-number
              v-model:value="form.year"
              :min="2020"
              :max="2099"
              :controls="false"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="16">
          <a-form-item label="年度资金目标（万元）" required>
            <a-input-number
              v-model:value="form.fundTarget"
              :min="0"
              :precision="2"
              :controls="false"
              style="width: 100%"
              placeholder="请输入年度资金目标"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="年度形象进度目标" required>
        <a-textarea
          v-model:value="form.imageProgressTarget"
          :rows="3"
          placeholder="请描述本年度形象进度目标"
          :maxlength="500"
          show-count
        />
      </a-form-item>

      <div class="month-block">
        <div class="month-block__head">
          <span class="month-block__title">各月目标分解</span>
          <a-button type="link" size="small" @click="monthlyCollapsed = !monthlyCollapsed">
            {{ monthlyCollapsed ? '展开' : '收起' }}
            <DownOutlined v-if="monthlyCollapsed" />
            <UpOutlined v-else />
          </a-button>
        </div>
        <div v-show="!monthlyCollapsed" class="month-block__body">
          <div v-for="item in form.months" :key="item.month" class="month-row">
            <div class="month-row__label">{{ item.label }}</div>
            <a-input-number
              v-model:value="item.fundTarget"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="资金目标（万元）"
              style="width: 160px"
            />
            <a-input
              v-model:value="item.imageProgressTarget"
              placeholder="形象进度目标"
              style="flex: 1"
            />
          </div>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<style scoped>
.month-block {
  margin-top: 8px;
  border: 1px solid var(--color-border-secondary, #e8e8e8);
  border-radius: 6px;
  overflow: hidden;
}

.month-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fafafa;
}

.month-block__title {
  font-size: 14px;
  font-weight: 600;
}

.month-block__body {
  padding: 12px;
  max-height: 360px;
  overflow: auto;
}

.month-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.month-row:last-child {
  margin-bottom: 0;
}

.month-row__label {
  width: 100px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #8c8c8c);
}
</style>
