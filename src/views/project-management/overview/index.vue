<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import type { TableColumnType } from 'ant-design-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { overviewApi } from '@/api/supplement-pool';
import type {
  ProjectOverviewDashboard,
  UnitCategory,
  UnitPivotRow
} from '@/types/overview';
import { UNIT_CATEGORY_OPTIONS } from '@/types/overview';
import ProgressYoYAnalysis2 from './components/ProgressYoYAnalysis2.vue';

const COLOR = {
  start: '#134bea',
  warehouse: '#1db969'
};

const loading = ref(false);
const dashboard = ref<ProjectOverviewDashboard | null>(null);
const unitCategory = ref<UnitCategory>('street');

const economicChartRef = ref<HTMLDivElement | null>(null);
let economicChart: echarts.ECharts | null = null;

const pivotColumns: TableColumnType[] = [
  { title: '责任单位', dataIndex: 'unitName', key: 'unitName', fixed: 'left', width: 120 },
  { title: '项目数', dataIndex: 'projectCount', key: 'projectCount', align: 'right', width: 80 },
  { title: '总投资（亿元）', dataIndex: 'totalInvestment', key: 'totalInvestment', align: 'right', width: 120 },
  {
    title: '形象进度完成投资（亿元）',
    dataIndex: 'imageProgressInvestment',
    key: 'imageProgressInvestment',
    align: 'right',
    width: 180
  },
  { title: '争取资金（亿元）', dataIndex: 'securedFunds', key: 'securedFunds', align: 'right', width: 130 },
  { title: '开工数', dataIndex: 'startCount', key: 'startCount', align: 'right', width: 80 },
  { title: '入库数', dataIndex: 'warehouseCount', key: 'warehouseCount', align: 'right', width: 80 },
  { title: '骏马项目数', dataIndex: 'gallopCount', key: 'gallopCount', align: 'right', width: 100 },
  { title: '蜗牛项目数', dataIndex: 'snailCount', key: 'snailCount', align: 'right', width: 100 },
  { title: '红灯预警数', dataIndex: 'redAlertCount', key: 'redAlertCount', align: 'right', width: 100 },
  { title: '黄灯预警数', dataIndex: 'yellowAlertCount', key: 'yellowAlertCount', align: 'right', width: 100 }
];

const pivotRows = computed(() => dashboard.value?.unitPivotByCategory[unitCategory.value] ?? []);

const economicRows = computed(
  () => dashboard.value?.economicAnalysisByCategory[unitCategory.value] ?? []
);

const unitCategoryLabel = computed(
  () => UNIT_CATEGORY_OPTIONS.find((item) => item.value === unitCategory.value)?.label ?? ''
);

const pivotSummary = computed(() => {
  const rows = pivotRows.value;
  const sum = (key: keyof UnitPivotRow) =>
    rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);

  return {
    projectCount: sum('projectCount'),
    totalInvestment: Math.round(sum('totalInvestment') * 10) / 10,
    imageProgressInvestment: Math.round(sum('imageProgressInvestment') * 10) / 10,
    securedFunds: Math.round(sum('securedFunds') * 10) / 10,
    startCount: sum('startCount'),
    warehouseCount: sum('warehouseCount'),
    gallopCount: sum('gallopCount'),
    snailCount: sum('snailCount'),
    redAlertCount: sum('redAlertCount'),
    yellowAlertCount: sum('yellowAlertCount')
  };
});

/** 合计作为表头下第一行 */
const pivotTableData = computed(() => {
  const summaryRow: UnitPivotRow & { isSummary?: boolean } = {
    unitName: '合计',
    ...pivotSummary.value,
    isSummary: true
  };
  return [summaryRow, ...pivotRows.value];
});

function pivotRowClassName(record: UnitPivotRow & { isSummary?: boolean }) {
  return record.isSummary ? 'pivot-summary-data-row' : '';
}

function isPivotSummaryRow(record: unknown) {
  return Boolean((record as { isSummary?: boolean }).isSummary);
}

async function loadDashboard() {
  loading.value = true;
  try {
    dashboard.value = await overviewApi.getDashboard();
    await nextTick();
    renderEconomicChart();
  } finally {
    loading.value = false;
  }
}

function renderEconomicChart() {
  if (!economicChartRef.value || !dashboard.value) return;
  if (!economicChart) economicChart = echarts.init(economicChartRef.value);

  const rows = economicRows.value;
  const units = rows.map((item) => item.unitName);
  const fixed = rows.map((item) => item.fixedInvestment);
  const image = rows.map((item) => item.imageProgressAmount);

  const option: EChartsOption = {
    color: [COLOR.start, COLOR.warehouse],
    tooltip: { trigger: 'axis' },
    legend: { data: ['固定资产投资', '形象进度完成金额'], top: 0 },
    grid: { left: 48, right: 24, top: 40, bottom: 48 },
    xAxis: {
      type: 'category',
      data: units,
      axisLabel: { interval: 0, rotate: units.length > 8 ? 28 : 20, fontSize: 12 }
    },
    yAxis: { type: 'value', name: '金额（亿元）' },
    series: [
      { name: '固定资产投资', type: 'bar', barMaxWidth: 28, data: fixed },
      { name: '形象进度完成金额', type: 'bar', barMaxWidth: 28, data: image }
    ]
  };
  economicChart.setOption(option, true);
  economicChart.resize();
}

function handleResize() {
  economicChart?.resize();
}

watch(unitCategory, async () => {
  await nextTick();
  renderEconomicChart();
});

onMounted(() => {
  loadDashboard();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  economicChart?.dispose();
  economicChart = null;
});

</script>

<template>
  <div class="overview-page">
    <div class="page-header">
      <h1 class="page-header__title">项目概览</h1>
      <p class="page-header__desc">进度概览、责任单位分析、经济分析与开工入库投产同比对比</p>
    </div>

    <a-spin :spinning="loading">
      <template v-if="dashboard">
        <a-card title="项目进度概览" :bordered="false" class="panel-card">
          <a-row :gutter="[16, 16]">
            <a-col v-for="item in dashboard.progressOverview" :key="item.key" :xs="24" :sm="12" :lg="6">
              <div class="progress-metric">
                <div class="progress-metric__head">
                  <span class="progress-metric__label">{{ item.label }}</span>
                  <span class="progress-metric__rate">{{ item.rate }}%</span>
                </div>
                <a-progress
                  :percent="Math.min(item.rate, 100)"
                  :show-info="false"
                  stroke-color="var(--color-primary)"
                />
                <div class="progress-metric__meta">
                  已完成 <strong>{{ item.completed }}</strong> / 目标 {{ item.target }} {{ item.unit }}
                </div>
              </div>
            </a-col>
          </a-row>
        </a-card>

        <div class="unit-filter-bar">
          <span class="unit-filter-bar__label">单位类型</span>
          <a-select
            v-model:value="unitCategory"
            :options="UNIT_CATEGORY_OPTIONS"
            style="width: 140px"
            size="middle"
          />
          <span class="unit-filter-bar__hint">同时作用于责任单位分析、经济分析</span>
        </div>

        <a-card title="责任单位分析" :bordered="false" class="panel-card" style="margin-top: 12px">
          <template #extra>
            <span class="panel-extra">当前：{{ unitCategoryLabel }}</span>
          </template>
          <a-table
            :columns="pivotColumns"
            :data-source="pivotTableData"
            row-key="unitName"
            size="small"
            bordered
            :pagination="false"
            :scroll="{ x: 1300 }"
            :row-class-name="pivotRowClassName"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'unitName' && isPivotSummaryRow(record)">
                <strong>合计</strong>
              </template>
              <template v-else-if="column.key === 'redAlertCount'">
                <span class="cell-red">{{ (record as UnitPivotRow).redAlertCount }}</span>
              </template>
              <template v-else-if="column.key === 'yellowAlertCount'">
                <span class="cell-yellow">{{ (record as UnitPivotRow).yellowAlertCount }}</span>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card title="经济分析" :bordered="false" class="panel-card" style="margin-top: 16px">
          <template #extra>
            <span class="panel-extra">固定资产投资及形象进度分析（{{ unitCategoryLabel }}）</span>
          </template>
          <div ref="economicChartRef" class="chart-box" />
        </a-card>

        <ProgressYoYAnalysis2 v-if="dashboard.progressRateYoY2" :data="dashboard.progressRateYoY2" />
      </template>
    </a-spin>
  </div>
</template>

<style scoped>
.panel-card {
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 4px rgba(19, 75, 234, 0.05);
}

.unit-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 4px rgba(19, 75, 234, 0.05);
}

.unit-filter-bar__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.unit-filter-bar__hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.progress-metric {
  padding: 14px 16px;
  background: var(--color-bg-layout);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-secondary);
}

.progress-metric__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.progress-metric__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.progress-metric__rate {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.progress-metric__meta {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.progress-metric__meta strong {
  color: var(--color-text-primary);
}

.cell-red {
  color: var(--color-error);
  font-weight: 600;
}

.cell-yellow {
  color: var(--color-warning);
  font-weight: 600;
}

:deep(.pivot-summary-data-row > td) {
  background: #eef2ff !important;
  font-weight: 600;
}

.panel-extra {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.chart-box {
  width: 100%;
  height: 360px;
}
</style>
