<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import CockpitMap from './components/CockpitMap.vue';
import CockpitPanel from './components/CockpitPanel.vue';
import KeyTaskMatrix from './components/KeyTaskMatrix.vue';
import {
  economicKpis,
  keyTaskData,
  lagItems,
  progressFilters,
  progressStages
} from '@/mock/cockpit-data';

const now = ref('');
const progressFilter = ref(progressFilters[0]);
let timer: ReturnType<typeof setInterval> | undefined;

function updateTime() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  now.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}  ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="cockpit">
    <header class="cockpit-header">
      <div class="cockpit-header__side cockpit-header__side--left">
        <span class="cockpit-header__location">青浦区</span>
        <span class="cockpit-header__weather">晴 18°C</span>
      </div>

      <div class="cockpit-header__center">
        <div class="cockpit-header__decor cockpit-header__decor--left" />
        <h1 class="cockpit-header__title">青浦区提质增效全生命周期管理系统</h1>
        <div class="cockpit-header__decor cockpit-header__decor--right" />
      </div>

      <div class="cockpit-header__side cockpit-header__side--right">
        <span class="cockpit-header__time">{{ now }}</span>
      </div>
    </header>

    <div class="cockpit-body">
      <aside class="cockpit-col cockpit-col--left">
        <CockpitPanel title="项目主要经济指标" class="cockpit-panel--kpi">
          <div class="kpi-grid">
            <div v-for="item in economicKpis" :key="item.label" class="kpi-card">
              <div class="kpi-card__value">
                {{ item.value }}<span class="kpi-card__unit">{{ item.unit }}</span>
              </div>
              <div class="kpi-card__label">{{ item.label }}</div>
            </div>
          </div>
        </CockpitPanel>

        <CockpitPanel title="进展分析" class="cockpit-panel--progress">
          <template #extra>
            <a-select
              v-model:value="progressFilter"
              size="small"
              class="cockpit-select"
              :bordered="false"
              :options="progressFilters.map((v) => ({ value: v, label: v }))"
            />
          </template>
          <div class="progress-list">
            <div v-for="stage in progressStages" :key="stage.name" class="progress-item">
              <div class="progress-item__head">
                <span class="progress-item__name">{{ stage.name }}</span>
                <span class="progress-item__meta">
                  完成率 <em>{{ stage.rate }}%</em> · {{ stage.count }} 个
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" :style="{ width: `${stage.rate}%` }" />
              </div>
            </div>
          </div>
        </CockpitPanel>
      </aside>

      <main class="cockpit-col cockpit-col--center">
        <CockpitMap />
      </main>

      <aside class="cockpit-col cockpit-col--right">
        <CockpitPanel title="滞后分析" class="cockpit-panel--lag">
          <template #extra>
            <span class="cockpit-tag">节点情况</span>
          </template>
          <div class="lag-list">
            <div v-for="item in lagItems" :key="item.rank" class="lag-item">
              <span class="lag-item__rank" :class="{ 'lag-item__rank--top': item.rank <= 3 }">
                {{ item.rank }}
              </span>
              <span class="lag-item__name">{{ item.name }}</span>
              <div class="lag-item__bar-wrap">
                <div class="lag-item__bar" :style="{ width: `${item.rate * 4}%` }" />
              </div>
              <span class="lag-item__rate">{{ item.rate }}%</span>
            </div>
          </div>
        </CockpitPanel>

        <CockpitPanel title="攻坚任务" class="cockpit-panel--coord">
          <KeyTaskMatrix :data="keyTaskData" />
        </CockpitPanel>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.cockpit {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height));
  min-height: 720px;
  padding: 12px 16px 16px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(0, 80, 160, 0.25) 0%, transparent 55%),
    linear-gradient(180deg, #020810 0%, #061428 40%, #040d1a 100%);
  overflow: hidden;
}

.cockpit-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 180, 255, 0.2);
}

.cockpit-header__side {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: rgba(180, 210, 240, 0.75);
}

.cockpit-header__side--right {
  justify-content: flex-end;
}

.cockpit-header__location {
  padding-left: 10px;
  border-left: 2px solid #00d4ff;
  color: #00d4ff;
}

.cockpit-header__time {
  font-family: 'DIN Alternate', 'Roboto Mono', monospace;
  color: #e8f4ff;
}

.cockpit-header__center {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cockpit-header__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
  white-space: nowrap;
  background: linear-gradient(180deg, #ffffff 0%, #7dd3fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(0, 180, 255, 0.3);
}

.cockpit-header__decor {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
}

.cockpit-body {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.cockpit-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.cockpit-col--left .cockpit-panel--kpi {
  flex: 0 0 auto;
}

.cockpit-col--left .cockpit-panel--progress {
  flex: 1;
  min-height: 0;
}

.cockpit-col--center {
  padding: 8px;
  background: rgba(0, 40, 80, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.12);
  border-radius: 4px;
}

.cockpit-col--right .cockpit-panel--lag {
  flex: 0 0 42%;
  min-height: 0;
}

.cockpit-col--right .cockpit-panel--coord {
  flex: 1;
  min-height: 0;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.kpi-card {
  padding: 10px 8px;
  text-align: center;
  background: rgba(0, 60, 120, 0.25);
  border: 1px solid rgba(0, 180, 255, 0.12);
  transition: border-color 0.2s;
}

.kpi-card:hover {
  border-color: rgba(0, 212, 255, 0.35);
}

.kpi-card__value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  color: #ffd54f;
  text-shadow: 0 0 10px rgba(255, 213, 79, 0.3);
}

.kpi-card__unit {
  margin-left: 2px;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 213, 79, 0.7);
}

.kpi-card__label {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(180, 210, 240, 0.75);
}

/* Progress list */
.progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.progress-item__name {
  color: #e8f4ff;
}

.progress-item__meta {
  color: rgba(180, 210, 240, 0.65);
}

.progress-item__meta em {
  font-style: normal;
  font-weight: 600;
  color: #00d4ff;
}

.progress-bar {
  height: 8px;
  background: rgba(0, 40, 80, 0.6);
  border: 1px solid rgba(0, 180, 255, 0.15);
}

.progress-bar__fill {
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #0088cc 0,
    #0088cc 4px,
    #00d4ff 4px,
    #00d4ff 8px
  );
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
  transition: width 0.6s ease;
}

/* Lag list */
.lag-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lag-item {
  display: grid;
  grid-template-columns: 24px 72px 1fr 36px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.lag-item__rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(180, 210, 240, 0.6);
  background: rgba(0, 60, 120, 0.4);
  border-radius: 2px;
}

.lag-item__rank--top {
  color: #040d1a;
  background: linear-gradient(135deg, #ffd54f, #ff9800);
}

.lag-item__name {
  color: #e8f4ff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lag-item__bar-wrap {
  height: 6px;
  background: rgba(0, 40, 80, 0.6);
}

.lag-item__bar {
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #ffd54f);
}

.lag-item__rate {
  text-align: right;
  font-weight: 600;
  color: #ffd54f;
}

.cockpit-col--right .cockpit-panel--coord :deep(.cockpit-panel__body) {
  display: flex;
  flex-direction: column;
}

/* Lag list ends above */

.cockpit-tag {
  padding: 2px 8px;
  font-size: 11px;
  color: #00d4ff;
  border: 1px solid rgba(0, 212, 255, 0.35);
  border-radius: 2px;
}

:deep(.cockpit-select) {
  width: 110px;
}

:deep(.cockpit-select .ant-select-selector) {
  color: #00d4ff !important;
  background: rgba(0, 60, 120, 0.5) !important;
  border-color: rgba(0, 180, 255, 0.3) !important;
}

@media (max-width: 1400px) {
  .cockpit-body {
    grid-template-columns: 240px 1fr 260px;
  }

  .cockpit-header__title {
    font-size: 18px;
  }
}
</style>
