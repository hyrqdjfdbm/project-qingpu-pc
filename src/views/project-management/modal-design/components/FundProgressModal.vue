<script setup lang="ts">
import { BarChartOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { reactive, ref, watch } from 'vue';

type PolicyKey = 'specialBond' | 'centralBudget';

interface MonthTarget {
  month: number;
  label: string;
  value: number | undefined;
}

interface PolicyForm {
  year: number;
  annualTarget: number | undefined;
  months: MonthTarget[];
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const activeTab = ref<PolicyKey>('specialBond');
const annualCollapsed = ref(false);
const monthlyCollapsed = ref(false);
const submitting = ref(false);

const currentYear = new Date().getFullYear();

function createMonths(year: number): MonthTarget[] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: `${year}年第${i + 1}月`,
    value: undefined
  }));
}

function createPolicyForm(year = currentYear): PolicyForm {
  return {
    year,
    annualTarget: undefined,
    months: createMonths(year)
  };
}

const forms = reactive<Record<PolicyKey, PolicyForm>>({
  specialBond: createPolicyForm(),
  centralBudget: createPolicyForm()
});

const seed: Record<PolicyKey, { annual: number; months: number[] }> = {
  specialBond: {
    annual: 1231,
    months: [123, 23, 24, 12, 434, 34, 34, 123, 0, 0, 0, 0]
  },
  centralBudget: {
    annual: 860,
    months: [80, 70, 65, 60, 95, 88, 72, 90, 0, 0, 0, 0]
  }
};

function resetForms() {
  (['specialBond', 'centralBudget'] as PolicyKey[]).forEach((key) => {
    forms[key] = createPolicyForm();
    forms[key].annualTarget = seed[key].annual;
    forms[key].months.forEach((item, index) => {
      const n = seed[key].months[index];
      item.value = n > 0 ? n : undefined;
    });
  });
  activeTab.value = 'specialBond';
  annualCollapsed.value = false;
  monthlyCollapsed.value = false;
}

watch(
  () => props.open,
  (open) => {
    if (open) resetForms();
  }
);

function close() {
  emit('update:open', false);
}

function handleSubmit() {
  const current = forms[activeTab.value];
  if (current.annualTarget === undefined) {
    message.warning('请填写年度投资目标');
    return;
  }

  submitting.value = true;
  window.setTimeout(() => {
    submitting.value = false;
    message.success('资金进度目标已保存');
    close();
  }, 400);
}
</script>

<template>
  <a-modal
    :open="open"
    title="上级资金进度填报"
    :width="720"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交"
    cancel-text="取消"
    @ok="handleSubmit"
    @cancel="close"
  >
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="specialBond" tab="专项债项目" />
      <a-tab-pane key="centralBudget" tab="中央预算内项目" />
    </a-tabs>

    <div v-for="tabKey in (['specialBond', 'centralBudget'] as PolicyKey[])" :key="tabKey">
      <div v-show="activeTab === tabKey" class="progress-panel">
        <!-- 年度 -->
        <section class="progress-block">
          <header class="progress-block__header">
            <div class="progress-block__title">
              <BarChartOutlined class="progress-block__icon" />
              <span>年度投资进度情况</span>
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
              <div class="progress-table__cell">年度投资目标（万元）</div>
            </div>
            <div class="progress-table__row">
              <div class="progress-table__cell progress-table__cell--label">
                {{ forms[tabKey].year }}
              </div>
              <div class="progress-table__cell">
                <a-input-number
                  v-model:value="forms[tabKey].annualTarget"
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

        <!-- 月度 -->
        <section class="progress-block">
          <header class="progress-block__header">
            <div class="progress-block__title">
              <BarChartOutlined class="progress-block__icon" />
              <span>月度投资进度情况</span>
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
              <div class="progress-table__cell">月度投资目标（万元）</div>
            </div>
            <div
              v-for="item in forms[tabKey].months"
              :key="`${tabKey}-${item.month}`"
              class="progress-table__row"
            >
              <div class="progress-table__cell progress-table__cell--label">
                {{ item.label }}
              </div>
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
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
.progress-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 58vh;
  overflow: auto;
  padding-right: 4px;
}

.progress-block {
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
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
  color: var(--color-text, #1f1f1f);
}

.progress-block__icon {
  color: var(--color-primary);
  font-size: 15px;
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
  padding: 0;
}

.progress-table__head,
.progress-table__row {
  display: grid;
  grid-template-columns: 180px 1fr;
}

.progress-table__head {
  background: #eef2ff;
  font-weight: 600;
  color: var(--color-text, #1f1f1f);
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
  color: var(--color-text, #1f1f1f);
  font-size: 13px;
  background: #fafafa;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}
</style>
