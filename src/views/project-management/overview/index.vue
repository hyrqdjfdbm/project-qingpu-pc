<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { overviewApi } from '@/api/supplement-pool';
import type { OverviewStats } from '@/types/overview';

const router = useRouter();
const loading = ref(false);
const stats = ref<OverviewStats | null>(null);

async function loadStats() {
  loading.value = true;
  try {
    stats.value = await overviewApi.getStats();
  } finally {
    loading.value = false;
  }
}

onMounted(loadStats);

const poolRoutes: Record<string, string> = {
  planning: '/project-management/planning-pool',
  supplement: '/project-management/supplement-pool',
  implementation: '/project-management/implementation-pool',
  gov: '/project-management/gov-investment-pool'
};

function goPool(stage: string) {
  const path = poolRoutes[stage];
  if (path) router.push(path);
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">项目概览</h1>
    </div>

    <a-spin :spinning="loading">
      <a-row v-if="stats" :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card" :bordered="false">
            <a-statistic title="项目总数" :value="stats.totalProjects" suffix="个" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card stat-card--warning" :bordered="false">
            <a-statistic title="待审核" :value="stats.pendingAudit" suffix="个" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card stat-card--success" :bordered="false">
            <a-statistic title="实施中" :value="stats.inImplementation" suffix="个" />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card stat-card--primary" :bordered="false">
            <a-statistic
              title="总投资"
              :value="stats.totalInvestment"
              suffix="亿元"
              :precision="2"
            />
          </a-card>
        </a-col>
      </a-row>

      <a-row v-if="stats" :gutter="[16, 16]" style="margin-top: 16px">
        <a-col :xs="24" :lg="12">
          <a-card title="各库项目分布" :bordered="false" class="panel-card">
            <div class="pool-list">
              <div
                v-for="item in stats.byPoolStage"
                :key="item.stage"
                class="pool-item"
                @click="goPool(item.stage)"
              >
                <span class="pool-item__label">{{ item.label }}</span>
                <span class="pool-item__count">{{ item.count }} 个</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-card title="街镇项目 TOP" :bordered="false" class="panel-card">
            <div class="town-list">
              <div v-for="item in stats.byStreetTown" :key="item.name" class="town-item">
                <span class="town-item__name">{{ item.name }}</span>
                <a-progress
                  :percent="Math.round((item.count / (stats.totalProjects || 1)) * 100)"
                  :show-info="false"
                  size="small"
                  stroke-color="var(--color-primary)"
                />
                <span class="town-item__count">{{ item.count }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<style scoped>
.stat-card {
  border-radius: var(--radius-lg);
  border-top: 3px solid var(--color-border-secondary);
}

.stat-card--primary {
  border-top-color: var(--color-primary);
}

.stat-card--success {
  border-top-color: var(--color-success);
}

.stat-card--warning {
  border-top-color: var(--color-warning);
}

.panel-card {
  border-radius: var(--radius-lg);
  min-height: 280px;
}

.pool-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--color-bg-layout);
  cursor: pointer;
  transition: background 0.2s;
}

.pool-item:hover {
  background: var(--color-primary-light);
}

.pool-item__label {
  font-size: 14px;
  color: var(--color-text-primary);
}

.pool-item__count {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
}

.town-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.town-item {
  display: grid;
  grid-template-columns: 80px 1fr 32px;
  align-items: center;
  gap: 12px;
}

.town-item__name {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.town-item__count {
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
