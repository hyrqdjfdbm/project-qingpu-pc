<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  PROJECT_TYPES,
  TOTAL_TAB_KEY,
  buildProjectAnalysisMatrix,
  getGrandTotal,
  getStageCount,
  getTypePercent,
  getTypeTotal
} from '../project-analysis-matrix';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const activeTab = ref<string>(PROJECT_TYPES[0].key);
const matrix = ref(buildProjectAnalysisMatrix());

const activeType = computed(() => PROJECT_TYPES.find((t) => t.key === activeTab.value));

watch(
  () => props.open,
  (open) => {
    if (open) {
      matrix.value = buildProjectAnalysisMatrix();
      activeTab.value = PROJECT_TYPES[0].key;
    }
  }
);

function close() {
  emit('update:open', false);
}
</script>

<template>
  <a-modal
    :open="open"
    title="项目分析"
    :width="360"
    wrap-class-name="project-chart-modal-wrap"
    class="project-chart-modal"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <a-tabs v-model:activeKey="activeTab" size="small" :tab-bar-gutter="8">
      <a-tab-pane v-for="type in PROJECT_TYPES" :key="type.key" :tab="type.shortName" />
      <a-tab-pane :key="TOTAL_TAB_KEY" tab="合计" />
    </a-tabs>

    <!-- 分类型：阶段 + 项目数 -->
    <div v-if="activeType" class="chart-body">
      <div
        v-for="stage in activeType.stages"
        :key="stage"
        class="chart-row"
      >
        <span class="chart-row__label">{{ stage }}</span>
        <span class="chart-row__value">{{ getStageCount(matrix, activeType.key, stage) }}</span>
      </div>
      <div class="chart-row chart-row--total">
        <span class="chart-row__label">小计</span>
        <span class="chart-row__value">{{ getTypeTotal(matrix, activeType.key) }}</span>
      </div>
    </div>

    <!-- 合计：各类型汇总 + 全部合计 -->
    <div v-else class="chart-body">
      <div
        v-for="type in PROJECT_TYPES"
        :key="type.key"
        class="chart-row"
      >
        <span class="chart-row__label">{{ type.name }}</span>
        <span class="chart-row__value">
          {{ getTypeTotal(matrix, type.key) }}
          <em class="chart-row__pct">{{ getTypePercent(matrix, type.key) }}%</em>
        </span>
      </div>
      <div class="chart-row chart-row--total chart-row--grand">
        <span class="chart-row__label">全部合计</span>
        <span class="chart-row__value">{{ getGrandTotal(matrix) }}</span>
      </div>
    </div>
  </a-modal>
</template>

<style scoped>
:deep(.ant-tabs-nav) {
  margin-bottom: 8px;
}

:deep(.ant-tabs-tab) {
  padding: 6px 10px;
  font-size: 13px;
}

.chart-body {
  border: 1px solid var(--color-border, #eee);
  border-radius: 8px;
  overflow: hidden;
}

.chart-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 12px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
}

.chart-row:last-child {
  border-bottom: none;
}

.chart-row__label {
  flex: 1;
  min-width: 0;
  color: var(--color-text, #1f1f1f);
  line-height: 1.4;
}

.chart-row__value {
  flex-shrink: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
}

.chart-row__pct {
  margin-left: 6px;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  color: var(--color-text-secondary, #8c8c8c);
}

.chart-row--total {
  background: #fafafa;
}

.chart-row--total .chart-row__label {
  font-weight: 600;
}

.chart-row--grand {
  background: var(--color-primary-light, #e8effd);
}

.chart-row--grand .chart-row__value {
  font-size: 16px;
}
</style>

<style>
/* 移动端弹窗：窄屏全宽、圆角 */
.project-chart-modal-wrap .ant-modal {
  max-width: calc(100vw - 24px);
  margin: 12px auto;
  padding-bottom: 0;
}

.project-chart-modal-wrap .ant-modal-content {
  border-radius: 12px;
}

.project-chart-modal-wrap .ant-modal-header {
  padding: 14px 16px 8px;
}

.project-chart-modal-wrap .ant-modal-body {
  padding: 0 16px 16px;
}

.project-chart-modal-wrap .ant-modal-title {
  font-size: 16px;
}

@media (max-width: 480px) {
  .project-chart-modal-wrap .ant-modal {
    max-width: 100vw;
    margin: 0;
    top: auto;
    padding-bottom: 0;
    vertical-align: bottom;
  }

  .project-chart-modal-wrap .ant-modal-content {
    border-radius: 12px 12px 0 0;
  }
}
</style>
