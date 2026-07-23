<script setup lang="ts">
import { BarChartOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { reactive, ref, watch } from 'vue';
import { keyProjectApi } from '@/api/key-project-overview';
import type { KeyProjectItem } from '@/types/key-project-overview';
import { createEmptyMonthlyTargets, getMonthLabel } from '@/types/key-project-overview';

const props = defineProps<{
  open: boolean;
  project: KeyProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const annualCollapsed = ref(false);
const monthlyCollapsed = ref(false);
const submitting = ref(false);

const form = reactive({
  year: new Date().getFullYear(),
  annualTarget: undefined as number | undefined,
  months: createEmptyMonthlyTargets(new Date().getFullYear()).map((item) => ({
    month: item.month,
    label: getMonthLabel(new Date().getFullYear(), item.month),
    value: undefined as number | undefined
  }))
});

watch(
  () => props.open,
  (open) => {
    if (!open || !props.project) return;
    const progress = props.project.imageProgress;
    form.year = progress.year;
    form.annualTarget = progress.annualTarget;
    form.months = createEmptyMonthlyTargets(progress.year).map((item) => ({
      month: item.month,
      label: getMonthLabel(progress.year, item.month),
      value: progress.monthlyTargets.find((m) => m.month === item.month)?.targetAmount
    }));
    annualCollapsed.value = false;
    monthlyCollapsed.value = false;
  }
);

function close() {
  emit('update:open', false);
}

async function handleSubmit() {
  if (!props.project) return;
  if (form.annualTarget === undefined) {
    message.warning('请填写年度形象进度目标');
    return;
  }

  submitting.value = true;
  try {
    await keyProjectApi.saveTarget(props.project.id, {
      year: form.year,
      annualTarget: form.annualTarget,
      monthlyTargets: form.months
        .filter((item) => item.value !== undefined)
        .map((item) => ({ month: item.month, targetAmount: item.value! }))
    });
    message.success('形象进度目标已保存');
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
    :title="project ? `形象进度目标 — ${project.projectName}` : '形象进度目标'"
    :width="760"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="保存"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="close"
  >
    <section class="progress-block">
      <header class="progress-block__header">
        <div class="progress-block__title">
          <BarChartOutlined class="progress-block__icon" />
          <span>年度形象进度目标情况</span>
        </div>
        <button type="button" class="progress-block__toggle" @click="annualCollapsed = !annualCollapsed">
          {{ annualCollapsed ? '展开' : '收起' }}
          <DownOutlined v-if="annualCollapsed" />
          <UpOutlined v-else />
        </button>
      </header>
      <div v-show="!annualCollapsed" class="progress-table">
        <div class="progress-table__head">
          <div class="progress-table__cell">年度</div>
          <div class="progress-table__cell">年度形象进度目标（万元）</div>
        </div>
        <div class="progress-table__row">
          <div class="progress-table__cell progress-table__cell--label">{{ form.year }}</div>
          <div class="progress-table__cell">
            <a-input-number
              v-model:value="form.annualTarget"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="progress-block">
      <header class="progress-block__header">
        <div class="progress-block__title">
          <BarChartOutlined class="progress-block__icon" />
          <span>月度形象进度目标情况</span>
        </div>
        <button type="button" class="progress-block__toggle" @click="monthlyCollapsed = !monthlyCollapsed">
          {{ monthlyCollapsed ? '展开' : '收起' }}
          <DownOutlined v-if="monthlyCollapsed" />
          <UpOutlined v-else />
        </button>
      </header>
      <div v-show="!monthlyCollapsed" class="progress-table">
        <div class="progress-table__head">
          <div class="progress-table__cell">月度</div>
          <div class="progress-table__cell">月度形象进度目标（万元）</div>
        </div>
        <div v-for="item in form.months" :key="item.month" class="progress-table__row">
          <div class="progress-table__cell progress-table__cell--label">{{ item.label }}</div>
          <div class="progress-table__cell">
            <a-input-number
              v-model:value="item.value"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="请输入"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
    </section>
  </a-modal>
</template>

<style scoped>
.progress-block {
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.progress-block + .progress-block {
  margin-top: 16px;
}

.progress-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(19, 75, 234, 0.08) 0%, rgba(19, 75, 234, 0.02) 100%);
  border-bottom: 1px solid rgba(19, 75, 234, 0.08);
}

.progress-block__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.progress-block__icon {
  color: var(--color-primary);
}

.progress-block__toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 13px;
  cursor: pointer;
}

.progress-table__head,
.progress-table__row {
  display: grid;
  grid-template-columns: 180px 1fr;
}

.progress-table__head {
  background: #eef2ff;
  font-weight: 600;
}

.progress-table__cell {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
  border-right: 1px solid var(--color-border, #f0f0f0);
  display: flex;
  align-items: center;
}

.progress-table__cell:last-child {
  border-right: none;
}

.progress-table__row:last-child .progress-table__cell {
  border-bottom: none;
}

.progress-table__cell--label {
  background: #fafafa;
}
</style>
