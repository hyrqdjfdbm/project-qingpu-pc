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
const showAll = ref(true);
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

function buildOption(rows: UnitProjectCountItem[]): EChartsOption {
  const units = rows.map((r) => r.unitName);
  const counts = rows.map((r) => r.projectCount);
  const needZoom = units.length > 12;

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
      left: 48,
      right: 24,
      top: 28,
      bottom: needZoom ? 88 : 72,
      containLabel: false
    },
    dataZoom: needZoom
      ? [
          {
            type: 'slider',
            xAxisIndex: 0,
            height: 18,
            bottom: 8,
            start: 0,
            end: Math.min(100, Math.round((12 / units.length) * 100)),
            brushSelect: false
          },
          {
            type: 'inside',
            xAxisIndex: 0,
            zoomOnMouseWheel: false,
            moveOnMouseWheel: true,
            moveOnMouseMove: true
          }
        ]
      : undefined,
    xAxis: {
      type: 'category',
      data: units,
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: {
        interval: 0,
        rotate: 40,
        fontSize: 11,
        color: 'rgba(0,0,0,0.75)',
        hideOverlap: false,
        width: 72,
        overflow: 'truncate'
      }
    },
    yAxis: {
      type: 'value',
      name: '项目数',
      nameTextStyle: { color: 'rgba(0,0,0,0.45)', fontSize: 12 },
      minInterval: 1,
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLabel: { color: 'rgba(0,0,0,0.45)' }
    },
    series: [
      {
        name: '项目数',
        type: 'bar',
        data: counts,
        barMaxWidth: 22,
        itemStyle: {
          color: '#134bea',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: units.length <= 18,
          position: 'top',
          color: 'rgba(0,0,0,0.55)',
          fontSize: 11
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
      showAll.value = true;
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

watch(displayData, async () => {
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
    title="多单位项目数（斜标柱状图）"
    :width="860"
    wrap-class-name="multi-unit-slant-chart-modal-wrap"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <div class="unit-chart-toolbar">
      <div class="unit-chart-toolbar__meta">
        共 <b>{{ totalUnits }}</b> 个责任单位 · 项目合计 <b>{{ totalProjects }}</b>
        <span class="unit-chart-toolbar__hint"> · 横轴单位名倾斜 40°</span>
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

    <div class="unit-chart-panel">
      <div ref="chartRef" class="unit-chart" />
    </div>

    <div class="unit-chart-foot">
      竖向柱状图 + 横轴斜向标签；单位较多时底部可拖动缩放条左右浏览，或缩到 Top 15 再对比。
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

.unit-chart-panel {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  padding: 8px 4px 4px;
}

.unit-chart {
  width: 100%;
  height: 420px;
}

.unit-chart-foot {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  line-height: 1.5;
}
</style>

<style>
.multi-unit-slant-chart-modal-wrap .ant-modal-body {
  padding-top: 8px;
}
</style>
