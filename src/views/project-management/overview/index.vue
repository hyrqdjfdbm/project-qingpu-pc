<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import type { TableColumnType } from 'ant-design-vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { overviewApi } from '@/api/supplement-pool';
import type {
  ProgressPeriod,
  ProjectOverviewDashboard,
  RateYoYPoint,
  UnitCategory,
  UnitPivotRow
} from '@/types/overview';
import { UNIT_CATEGORY_OPTIONS } from '@/types/overview';
import ProgressYoYAnalysis2 from './components/ProgressYoYAnalysis2.vue';

const COLOR = {
  start: '#134bea',
  startLight: '#9db4f8',
  warehouse: '#1db969',
  warehouseLight: '#9ee0bf',
  production: '#ff8c21',
  productionLight: '#ffd0a0',
  zeroLine: '#f53c3c'
};

const loading = ref(false);
const dashboard = ref<ProjectOverviewDashboard | null>(null);
const unitCategory = ref<UnitCategory>('street');
const yoyPeriod = ref<ProgressPeriod>('month');

const economicChartRef = ref<HTMLDivElement | null>(null);
const yoyBarChartRef = ref<HTMLDivElement | null>(null);
const yoyLineChartRef = ref<HTMLDivElement | null>(null);
let economicChart: echarts.ECharts | null = null;
let yoyBarChart: echarts.ECharts | null = null;
let yoyLineChart: echarts.ECharts | null = null;

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
const currentYear = computed(() => dashboard.value?.year ?? 2026);
const previousYear = computed(() => currentYear.value - 1);

const yoyTitle = computed(() => {
  const y = currentYear.value;
  if (yoyPeriod.value === 'quarter') {
    return `${y} 年各季度开工率、入库率、投产率同期对比`;
  }
  if (yoyPeriod.value === 'year') {
    return `${y} 全年 VS ${y - 1} 全年开工、入库、投产率对比`;
  }
  return `${y} 年各月开工率、入库率、投产率同期对比`;
});

const yearSummary = computed(() => {
  const series = dashboard.value?.progressRateYoY.year;
  if (!series) return [];
  return [
    { key: 'start', label: '开工率', color: COLOR.start, point: series.start[0] },
    { key: 'warehouse', label: '入库率', color: COLOR.warehouse, point: series.warehouse[0] },
    { key: 'production', label: '投产率', color: COLOR.production, point: series.production[0] }
  ];
});

function formatDelta(pp: number) {
  const sign = pp > 0 ? '+' : '';
  return `${sign}${pp.toFixed(1)} 个百分点`;
}

async function loadDashboard() {
  loading.value = true;
  try {
    dashboard.value = await overviewApi.getDashboard();
    await nextTick();
    renderEconomicChart();
    renderYoyCharts();
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

function buildPeriodBarOption(series: {
  start: RateYoYPoint[];
  warehouse: RateYoYPoint[];
  production: RateYoYPoint[];
}): EChartsOption {
  const labels = series.start.map((p) => p.label);
  const y = currentYear.value;
  const py = previousYear.value;

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = params as unknown as {
          axisValue: string;
          seriesName: string;
          value: number;
          marker: string;
        }[];
        if (!list.length) return '';
        const label = list[0].axisValue;
        const idx = labels.indexOf(label);
        if (idx < 0) return label;
        const s = series.start[idx];
        const w = series.warehouse[idx];
        const p = series.production[idx];
        return [
          `<div style="font-weight:600;margin-bottom:6px">${label}</div>`,
          `<span style="color:${COLOR.start}">开工率</span>：本年 ${s.currentRate}% / 去年 ${s.previousRate}% / ${formatDelta(s.deltaPp)}`,
          `<span style="color:${COLOR.warehouse}">入库率</span>：本年 ${w.currentRate}% / 去年 ${w.previousRate}% / ${formatDelta(w.deltaPp)}`,
          `<span style="color:${COLOR.production}">投产率</span>：本年 ${p.currentRate}% / 去年 ${p.previousRate}% / ${formatDelta(p.deltaPp)}`
        ].join('<br/>');
      }
    },
    legend: {
      data: [
        `开工率-${y}`,
        `开工率-${py}`,
        `入库率-${y}`,
        `入库率-${py}`,
        `投产率-${y}`,
        `投产率-${py}`
      ],
      top: 0,
      type: 'scroll'
    },
    grid: { left: 48, right: 16, top: 52, bottom: 36 },
    xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', name: '比率（%）', max: 100 },
    series: [
      {
        name: `开工率-${y}`,
        type: 'bar',
        barGap: '10%',
        barMaxWidth: 12,
        itemStyle: { color: COLOR.start },
        data: series.start.map((i) => i.currentRate)
      },
      {
        name: `开工率-${py}`,
        type: 'bar',
        barMaxWidth: 12,
        itemStyle: { color: COLOR.startLight },
        data: series.start.map((i) => i.previousRate)
      },
      {
        name: `入库率-${y}`,
        type: 'bar',
        barMaxWidth: 12,
        itemStyle: { color: COLOR.warehouse },
        data: series.warehouse.map((i) => i.currentRate)
      },
      {
        name: `入库率-${py}`,
        type: 'bar',
        barMaxWidth: 12,
        itemStyle: { color: COLOR.warehouseLight },
        data: series.warehouse.map((i) => i.previousRate)
      },
      {
        name: `投产率-${y}`,
        type: 'bar',
        barMaxWidth: 12,
        itemStyle: { color: COLOR.production },
        data: series.production.map((i) => i.currentRate)
      },
      {
        name: `投产率-${py}`,
        type: 'bar',
        barMaxWidth: 12,
        itemStyle: { color: COLOR.productionLight },
        data: series.production.map((i) => i.previousRate)
      }
    ]
  };
}

function buildPeriodLineOption(series: {
  start: RateYoYPoint[];
  warehouse: RateYoYPoint[];
  production: RateYoYPoint[];
}): EChartsOption {
  const labels = series.start.map((p) => p.label);
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = params as unknown as {
          axisValue: string;
          seriesName: string;
          value: number;
          marker: string;
        }[];
        if (!list.length) return '';
        const lines = list.map(
          (item) => `${item.marker}${item.seriesName}：${formatDelta(Number(item.value))}`
        );
        return [`<div style="font-weight:600;margin-bottom:4px">${list[0].axisValue}</div>`, ...lines].join(
          '<br/>'
        );
      }
    },
    legend: {
      data: ['开工率差值', '入库率差值', '投产率差值'],
      top: 0
    },
    grid: { left: 52, right: 16, top: 48, bottom: 36 },
    xAxis: { type: 'category', data: labels, boundaryGap: false },
    yAxis: {
      type: 'value',
      name: '同比增减（百分点）',
      axisLine: { show: true },
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: '开工率差值',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        itemStyle: { color: COLOR.start },
        lineStyle: { width: 2, color: COLOR.start },
        data: series.start.map((i) => i.deltaPp),
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: false },
          lineStyle: { color: COLOR.zeroLine, width: 2, type: 'solid' },
          data: [{ yAxis: 0 }]
        }
      },
      {
        name: '入库率差值',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        itemStyle: { color: COLOR.warehouse },
        lineStyle: { width: 2, color: COLOR.warehouse },
        data: series.warehouse.map((i) => i.deltaPp)
      },
      {
        name: '投产率差值',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        itemStyle: { color: COLOR.production },
        lineStyle: { width: 2, color: COLOR.production },
        data: series.production.map((i) => i.deltaPp)
      }
    ]
  };
}

function buildYearBarOption(): EChartsOption {
  const series = dashboard.value!.progressRateYoY.year;
  const y = currentYear.value;
  const py = previousYear.value;
  const metrics = ['开工率', '入库率', '投产率'];
  const current = [series.start[0].currentRate, series.warehouse[0].currentRate, series.production[0].currentRate];
  const previous = [
    series.start[0].previousRate,
    series.warehouse[0].previousRate,
    series.production[0].previousRate
  ];

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = params as unknown as { axisValue: string; seriesName: string; value: number }[];
        if (!list.length) return '';
        const label = list[0].axisValue;
        const map: Record<string, RateYoYPoint> = {
          开工率: series.start[0],
          入库率: series.warehouse[0],
          投产率: series.production[0]
        };
        const point = map[label];
        if (!point) return label;
        return [
          `<div style="font-weight:600;margin-bottom:4px">${label}</div>`,
          `本年率：${point.currentRate}%`,
          `去年同期率：${point.previousRate}%`,
          `同比增减：${formatDelta(point.deltaPp)}`
        ].join('<br/>');
      }
    },
    legend: { data: [`${y} 全年`, `${py} 全年`], top: 0 },
    grid: { left: 48, right: 16, top: 40, bottom: 36 },
    xAxis: { type: 'category', data: metrics },
    yAxis: { type: 'value', name: '比率（%）', max: 100 },
    series: [
      {
        name: `${y} 全年`,
        type: 'bar',
        barMaxWidth: 36,
        itemStyle: {
          color: (params) => [COLOR.start, COLOR.warehouse, COLOR.production][params.dataIndex]
        },
        data: current
      },
      {
        name: `${py} 全年`,
        type: 'bar',
        barMaxWidth: 36,
        itemStyle: {
          color: (params) =>
            [COLOR.startLight, COLOR.warehouseLight, COLOR.productionLight][params.dataIndex]
        },
        data: previous
      }
    ]
  };
}

function disposeYoyCharts() {
  yoyBarChart?.dispose();
  yoyLineChart?.dispose();
  yoyBarChart = null;
  yoyLineChart = null;
}

function renderYoyCharts() {
  if (!dashboard.value) return;
  disposeYoyCharts();

  if (yoyPeriod.value === 'year') {
    if (!yoyBarChartRef.value) return;
    yoyBarChart = echarts.init(yoyBarChartRef.value);
    yoyBarChart.setOption(buildYearBarOption(), true);
    return;
  }

  const series = dashboard.value.progressRateYoY[yoyPeriod.value];
  if (yoyBarChartRef.value) {
    yoyBarChart = echarts.init(yoyBarChartRef.value);
    yoyBarChart.setOption(buildPeriodBarOption(series), true);
  }
  if (yoyLineChartRef.value) {
    yoyLineChart = echarts.init(yoyLineChartRef.value);
    yoyLineChart.setOption(buildPeriodLineOption(series), true);
  }
}

function handleResize() {
  economicChart?.resize();
  yoyBarChart?.resize();
  yoyLineChart?.resize();
}

watch(yoyPeriod, async () => {
  await nextTick();
  renderYoyCharts();
  handleResize();
});

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
  disposeYoyCharts();
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

        <a-card :bordered="false" class="panel-card" style="margin-top: 16px">
          <template #title>
            <div class="yoy-title-wrap">
              <span>进度同比分析</span>
              <span class="yoy-subtitle">{{ yoyTitle }}</span>
            </div>
          </template>
          <template #extra>
            <a-radio-group v-model:value="yoyPeriod" size="small" button-style="solid">
              <a-radio-button value="month">每月</a-radio-button>
              <a-radio-button value="quarter">每季度</a-radio-button>
              <a-radio-button value="year">全年</a-radio-button>
            </a-radio-group>
          </template>

          <!-- 月度 / 季度：左柱 + 右折线 -->
          <a-row v-if="yoyPeriod !== 'year'" :gutter="[16, 16]">
            <a-col :xs="24" :lg="14">
              <div class="chart-panel">
                <div class="chart-panel__label">比率同期双柱对比</div>
                <div ref="yoyBarChartRef" class="chart-box chart-box--split" />
              </div>
            </a-col>
            <a-col :xs="24" :lg="10">
              <div class="chart-panel">
                <div class="chart-panel__label">比率同比增减折线</div>
                <div ref="yoyLineChartRef" class="chart-box chart-box--split" />
              </div>
            </a-col>
          </a-row>

          <!-- 全年：左柱 + 右说明 -->
          <a-row v-else :gutter="[16, 16]">
            <a-col :xs="24" :lg="14">
              <div class="chart-panel">
                <div class="chart-panel__label">全年三项比率对比</div>
                <div ref="yoyBarChartRef" class="chart-box chart-box--split" />
              </div>
            </a-col>
            <a-col :xs="24" :lg="10">
              <div class="year-summary">
                <div class="year-summary__title">同比增减说明</div>
                <div v-for="item in yearSummary" :key="item.key" class="year-summary__item">
                  <div class="year-summary__head">
                    <span class="year-summary__dot" :style="{ background: item.color }" />
                    <span class="year-summary__name">{{ item.label }}</span>
                  </div>
                  <div class="year-summary__rates">
                    {{ currentYear }}：{{ item.point.currentRate }}%　｜　{{ previousYear }}：{{
                      item.point.previousRate
                    }}%
                  </div>
                  <div
                    class="year-summary__delta"
                    :class="{
                      'year-summary__delta--up': item.point.deltaPp > 0,
                      'year-summary__delta--down': item.point.deltaPp < 0
                    }"
                  >
                    同比 {{ formatDelta(item.point.deltaPp) }}
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
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

.yoy-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.yoy-subtitle {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-tertiary);
}

.chart-panel {
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-md);
  padding: 8px 8px 4px;
  background: #fff;
}

.chart-panel__label {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 0 8px 4px;
}

.chart-box {
  width: 100%;
  height: 360px;
}

.chart-box--split {
  height: 340px;
}

.year-summary {
  height: 100%;
  min-height: 340px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-md);
  padding: 16px;
  background: linear-gradient(180deg, #f7fafd 0%, #fff 100%);
}

.year-summary__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.year-summary__item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-secondary);
}

.year-summary__item:last-child {
  border-bottom: none;
}

.year-summary__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.year-summary__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.year-summary__name {
  font-weight: 600;
  font-size: 14px;
}

.year-summary__rates {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.year-summary__delta {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.year-summary__delta--up {
  color: var(--color-success);
}

.year-summary__delta--down {
  color: var(--color-error);
}

:deep(.ant-card-extra) {
  max-width: 100%;
}

:deep(.ant-card-head-title) {
  white-space: normal;
}
</style>
