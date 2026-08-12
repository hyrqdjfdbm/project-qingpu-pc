<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import {
  DEFAULT_TOP_N,
  buildUnitProjectCountData,
  type UnitProjectCountItem
} from '../unit-project-chart-data';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;

const allData = ref<UnitProjectCountItem[]>([]);
const showAll = ref(false);
const keyword = ref('');

const filteredData = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return allData.value;
  return allData.value.filter((item) => item.unitName.includes(kw));
});

const displayData = computed(() => {
  if (showAll.value || keyword.value.trim()) return filteredData.value;
  return filteredData.value.slice(0, DEFAULT_TOP_N);
});

const totalUnits = computed(() => allData.value.length);
const totalProjects = computed(() =>
  allData.value.reduce((sum, item) => sum + item.projectCount, 0)
);
const hiddenCount = computed(() =>
  showAll.value || keyword.value.trim()
    ? 0
    : Math.max(0, filteredData.value.length - DEFAULT_TOP_N)
);

/** 横向条形图高度随条数变化，保证可读 */
const chartHeight = computed(() => Math.max(360, displayData.value.length * 28 + 56));

function buildOption(rows: UnitProjectCountItem[]): EChartsOption {
  // 横向条形图：category 在 y 轴，数据从下到上时 ECharts 默认反序，先 reverse 使最大在上方
  const ordered = [...rows].reverse();
  const units = ordered.map((r) => r.unitName);
  const counts = ordered.map((r) => r.projectCount);

  return {
    color: ['#134bea'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter(params: any) {
        const item = Array.isArray(params) ? params[0] : params;
        if (!item) return '';
        return `${item.name}<br/>项目数：<b>${item.value}</b>`;
      }
    },
    grid: {
      left: 8,
      right: 48,
      top: 12,
      bottom: 8,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '项目数',
      nameTextStyle: { color: 'rgba(0,0,0,0.45)', fontSize: 12 },
      minInterval: 1,
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLabel: { color: 'rgba(0,0,0,0.45)' }
    },
    yAxis: {
      type: 'category',
      data: units,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: {
        color: 'rgba(0,0,0,0.75)',
        fontSize: 12,
        width: 96,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: '项目数',
        type: 'bar',
        data: counts,
        barMaxWidth: 16,
        itemStyle: {
          color: '#134bea',
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: 'rgba(0,0,0,0.65)',
          fontSize: 12
        }
      }
    ]
  };
}

function renderChart() {
  if (!chartRef.value) return;
  if (!chart) chart = echarts.init(chartRef.value);
  chart.setOption(buildOption(displayData.value), true);
  chart.resize();
}

function handleResize() {
  chart?.resize();
}

function close() {
  emit('update:open', false);
}

function toggleShowAll() {
  showAll.value = !showAll.value;
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      allData.value = buildUnitProjectCountData();
      showAll.value = false;
      keyword.value = '';
      await nextTick();
      renderChart();
      window.addEventListener('resize', handleResize);
    } else {
      window.removeEventListener('resize', handleResize);
      chart?.dispose();
      chart = null;
    }
  }
);

watch([displayData, chartHeight], async () => {
  if (!props.open) return;
  await nextTick();
  renderChart();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <a-modal
    :open="open"
    title="多单位项目数"
    :width="720"
    wrap-class-name="multi-unit-chart-modal-wrap"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <div class="unit-chart-toolbar">
      <div class="unit-chart-toolbar__meta">
        共 <b>{{ totalUnits }}</b> 个责任单位 · 项目合计 <b>{{ totalProjects }}</b>
        <span v-if="!showAll && !keyword.trim()" class="unit-chart-toolbar__hint">
          （默认 Top {{ DEFAULT_TOP_N }}，按项目数降序）
        </span>
      </div>
      <div class="unit-chart-toolbar__actions">
        <a-input
          v-model:value="keyword"
          allow-clear
          placeholder="搜索单位"
          style="width: 160px"
        />
        <a-button v-if="!keyword.trim()" @click="toggleShowAll">
          {{ showAll ? '仅看 Top 15' : `展开全部${hiddenCount ? `（+${hiddenCount}）` : ''}` }}
        </a-button>
      </div>
    </div>

    <div class="unit-chart-scroll">
      <div ref="chartRef" class="unit-chart" :style="{ height: `${chartHeight}px` }" />
    </div>

    <div class="unit-chart-foot">
      横轴为项目数，纵轴为责任单位；类别较多时优先横向条形图，避免竖向柱状图标签拥挤。
    </div>
  </a-modal>
</template>

<style scoped>
.unit-chart-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.unit-chart-toolbar__meta {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 32px;
}

.unit-chart-toolbar__meta b {
  color: rgba(0, 0, 0, 0.88);
  font-variant-numeric: tabular-nums;
}

.unit-chart-toolbar__hint {
  color: rgba(0, 0, 0, 0.45);
}

.unit-chart-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.unit-chart-scroll {
  max-height: min(62vh, 560px);
  overflow: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
}

.unit-chart {
  width: 100%;
  min-height: 360px;
}

.unit-chart-foot {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.5;
}
</style>

<style>
.multi-unit-chart-modal-wrap .ant-modal-body {
  padding-top: 8px;
}
</style>
