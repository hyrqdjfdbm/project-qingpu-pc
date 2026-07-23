<script setup lang="ts">
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons-vue';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type {
  ProgressPeriod,
  ProgressYoY2Data,
  ProgressYoY2MetricBlock,
  ProgressYoY2MetricKey
} from '@/types/overview';
import { PROGRESS_RATE_DEFINITIONS } from '@/types/overview';

const props = defineProps<{
  data: ProgressYoY2Data;
}>();

const COLOR_MAP: Record<ProgressYoY2MetricKey, { main: string; light: string }> = {
  start: { main: '#134bea', light: '#9db4f8' },
  warehouse: { main: '#1db969', light: '#9ee0bf' },
  production: { main: '#ff8c21', light: '#ffd0a0' }
};

const METRIC_KEYS: ProgressYoY2MetricKey[] = ['start', 'warehouse', 'production'];

const period = ref<ProgressPeriod>('month');
const fading = ref(false);

const startChartEl = ref<HTMLDivElement | null>(null);
const warehouseChartEl = ref<HTMLDivElement | null>(null);
const productionChartEl = ref<HTMLDivElement | null>(null);

const chartEls: Record<ProgressYoY2MetricKey, typeof startChartEl> = {
  start: startChartEl,
  warehouse: warehouseChartEl,
  production: productionChartEl
};

const charts: Partial<Record<ProgressYoY2MetricKey, echarts.ECharts>> = {};

const bundle = computed(() => props.data[period.value]);

const periodOptions: { value: ProgressPeriod; label: string }[] = [
  { value: 'month', label: '月度' },
  { value: 'quarter', label: '季度' },
  { value: 'year', label: '全年' }
];

const scopeDetail = computed(() => {
  const b = bundle.value;
  if (period.value === 'month') {
    return `数据口径：${b.currentYear}年1月开工率 vs ${b.previousYear}年1月开工率（各月同理）`;
  }
  if (period.value === 'quarter') {
    return `数据口径：${b.currentYear}年一季度开工率 vs ${b.previousYear}年一季度开工率（各季同理）`;
  }
  return `数据口径：近5年各年度「当年」与「上年」比率并排；重点关注 ${b.currentYear}年 vs ${b.previousYear}年`;
});

function formatDelta(pp: number) {
  const sign = pp > 0 ? '+' : '';
  return `${sign}${pp.toFixed(1)}%`;
}

function buildMetricOption(metric: ProgressYoY2MetricBlock): EChartsOption {
  const colors = COLOR_MAP[metric.key];
  const y = bundle.value.currentYear;
  const py = bundle.value.previousYear;
  const labels = metric.points.map((p) => p.label);
  const isYearView = period.value === 'year';

  /** 全年：图例用「当年/上年」，避免近5年都标成同一对年份 */
  const currentSeriesName = isYearView ? '当年' : `${y}年`;
  const previousSeriesName = isYearView ? '上年' : `${py}年`;

  return {
    title: {
      text: `${metric.label}同比`,
      left: 0,
      top: 0,
      textStyle: { fontSize: 13, fontWeight: 600, color: '#181c1e' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = params as unknown as { axisValue: string; seriesName: string; value: number }[];
        if (!list.length) return '';
        const label = list[0].axisValue;
        const point = metric.points.find((p) => p.label === label);
        if (!point) return label;

        if (isYearView) {
          const yearNum = Number(String(label).replace('年', ''));
          return [
            `<div style="font-weight:600;margin-bottom:4px">${metric.label} · ${label}</div>`,
            `当年（${yearNum}年）：${point.currentRate}%`,
            `上年（${yearNum - 1}年）：${point.previousRate}%`,
            `同比：${formatDelta(point.deltaPp)}`
          ].join('<br/>');
        }

        return [
          `<div style="font-weight:600;margin-bottom:4px">${metric.label} · ${label}</div>`,
          `${y}年：${point.currentRate}%`,
          `${py}年：${point.previousRate}%`,
          `同比：${formatDelta(point.deltaPp)}`
        ].join('<br/>');
      }
    },
    legend: {
      data: [currentSeriesName, previousSeriesName],
      top: 0,
      right: 0,
      textStyle: { fontSize: 11 }
    },
    grid: { left: 42, right: 12, top: 40, bottom: 28 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      name: '%',
      max: 100,
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: currentSeriesName,
        type: 'bar',
        barMaxWidth: 18,
        itemStyle: { color: colors.main },
        data: metric.points.map((p) => p.currentRate)
      },
      {
        name: previousSeriesName,
        type: 'bar',
        barMaxWidth: 18,
        itemStyle: { color: colors.light },
        data: metric.points.map((p) => p.previousRate)
      }
    ],
    animationDuration: 360
  };
}

function ensureChart(key: ProgressYoY2MetricKey) {
  const el = chartEls[key].value;
  if (!el) return null;
  if (!charts[key]) {
    charts[key] = echarts.init(el);
  }
  return charts[key]!;
}

function renderCharts() {
  for (const metric of bundle.value.metrics) {
    const chart = ensureChart(metric.key);
    if (!chart) continue;
    chart.setOption(buildMetricOption(metric), true);
    chart.resize();
  }
}

function handleResize() {
  METRIC_KEYS.forEach((key) => charts[key]?.resize());
}

async function switchPeriod(next: ProgressPeriod) {
  if (next === period.value) return;
  fading.value = true;
  await new Promise((r) => setTimeout(r, 160));
  period.value = next;
  await nextTick();
  renderCharts();
  fading.value = false;
}

onMounted(async () => {
  await nextTick();
  // 等布局完成后再初始化，避免容器宽度为 0
  requestAnimationFrame(() => {
    renderCharts();
  });
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  METRIC_KEYS.forEach((key) => {
    charts[key]?.dispose();
    delete charts[key];
  });
});

watch(
  () => props.data,
  async () => {
    await nextTick();
    renderCharts();
  }
);
</script>

<template>
  <a-card title="进度同比分析2" :bordered="false" class="panel-card yoy2-card">
    <template #extra>
      <div class="yoy2-switch">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          type="button"
          class="yoy2-switch__btn"
          :class="{ 'yoy2-switch__btn--active': period === opt.value }"
          @click="switchPeriod(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </template>

    <div class="yoy2-defs">
      <div v-for="item in PROGRESS_RATE_DEFINITIONS" :key="item.key" class="yoy2-defs__item">
        <span class="yoy2-defs__label">{{ item.label }}</span>
        <span class="yoy2-defs__formula">= {{ item.formula }}</span>
      </div>
      <div class="yoy2-defs__tip">三个指标均为百分比，单位一致，适合放在同一维度下对比。</div>
    </div>

    <div class="yoy2-body" :class="{ 'yoy2-body--fading': fading }">
      <a-row :gutter="[12, 12]" class="yoy2-cards">
        <a-col v-for="metric in bundle.metrics" :key="metric.key" :xs="24" :sm="8">
          <div class="yoy2-card-item" :style="{ borderTopColor: COLOR_MAP[metric.key].main }">
            <div class="yoy2-card-item__label">{{ metric.label }}（当期）</div>
            <div class="yoy2-card-item__value" :style="{ color: COLOR_MAP[metric.key].main }">
              {{ metric.latestCurrentRate }}%
            </div>
            <div
              class="yoy2-card-item__delta"
              :class="{
                'is-up': metric.latestDeltaPp > 0,
                'is-down': metric.latestDeltaPp < 0
              }"
            >
              <ArrowUpOutlined v-if="metric.latestDeltaPp > 0" />
              <ArrowDownOutlined v-else-if="metric.latestDeltaPp < 0" />
              <MinusOutlined v-else />
              <span>同比 {{ formatDelta(metric.latestDeltaPp) }}</span>
              <span class="yoy2-card-item__vs">
                vs {{ bundle.previousYear }}（{{ metric.latestPreviousRate }}%）
              </span>
            </div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="[12, 12]" style="margin-top: 12px">
        <a-col :xs="24" :lg="8">
          <div class="yoy2-chart-panel">
            <div ref="startChartEl" class="yoy2-chart" />
          </div>
        </a-col>
        <a-col :xs="24" :lg="8">
          <div class="yoy2-chart-panel">
            <div ref="warehouseChartEl" class="yoy2-chart" />
          </div>
        </a-col>
        <a-col :xs="24" :lg="8">
          <div class="yoy2-chart-panel">
            <div ref="productionChartEl" class="yoy2-chart" />
          </div>
        </a-col>
      </a-row>

      <div class="yoy2-scope">
        <span class="yoy2-scope__tag">{{ periodOptions.find((o) => o.value === period)?.label }}视图</span>
        {{ scopeDetail }}
      </div>
    </div>
  </a-card>
</template>

<style scoped>
.yoy2-card {
  margin-top: 16px;
}

.yoy2-switch {
  display: inline-flex;
  padding: 2px;
  background: #eef2ff;
  border-radius: 6px;
  gap: 2px;
}

.yoy2-switch__btn {
  border: none;
  background: transparent;
  padding: 4px 14px;
  font-size: 13px;
  color: var(--color-text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.yoy2-switch__btn--active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(19, 75, 234, 0.35);
}

.yoy2-defs {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: var(--color-bg-layout);
  border-radius: 6px;
  border: 1px solid var(--color-border-secondary);
}

.yoy2-defs__item {
  font-size: 13px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.yoy2-defs__label {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-right: 4px;
}

.yoy2-defs__tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.yoy2-body {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.yoy2-body--fading {
  opacity: 0.35;
  transform: translateX(-8px);
}

.yoy2-card-item {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--color-border-secondary);
  border-top: 3px solid var(--color-primary);
  border-radius: 6px;
}

.yoy2-card-item__label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.yoy2-card-item__value {
  margin-top: 4px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.yoy2-card-item__delta {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.yoy2-card-item__delta.is-up {
  color: var(--color-success);
}

.yoy2-card-item__delta.is-down {
  color: var(--color-error);
}

.yoy2-card-item__vs {
  font-weight: 400;
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.yoy2-chart-panel {
  border: 1px solid var(--color-border-secondary);
  border-radius: 6px;
  padding: 8px;
  background: #fff;
}

.yoy2-chart {
  width: 100%;
  height: 260px;
}

.yoy2-scope {
  margin-top: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: #f7fafd;
  border-radius: 6px;
  border: 1px dashed var(--color-border-secondary);
}

.yoy2-scope__tag {
  display: inline-block;
  margin-right: 8px;
  padding: 1px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: 4px;
}
</style>
