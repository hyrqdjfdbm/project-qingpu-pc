<script setup lang="ts">
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { keyProjectApi } from '@/api/key-project-overview';
import type { KeyProjectItem } from '@/types/key-project-overview';
import {
  calcCompletionRate,
  getMonthLabel,
  getYearActualTotal,
  getYearTargetTotal
} from '@/types/key-project-overview';
import ImageProgressTargetModal from './components/ImageProgressTargetModal.vue';
import MonthlyCompletionModal from './components/MonthlyCompletionModal.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const project = ref<KeyProjectItem | null>(null);
const targetOpen = ref(false);
const completionOpen = ref(false);

const progress = computed(() => project.value?.imageProgress);

const monthlyRows = computed(() => {
  if (!progress.value) return [];
  const year = progress.value.year;
  return progress.value.monthlyTargets.map((item) => ({
    key: item.month,
    monthLabel: getMonthLabel(year, item.month),
    targetAmount: item.targetAmount,
    actualAmount: item.actualAmount,
    rate: calcCompletionRate(item.actualAmount, item.targetAmount),
    remark: item.remark,
    reportedAt: item.reportedAt
  }));
});

const yearCompletionRate = computed(() => {
  if (!progress.value?.annualTarget) return null;
  return calcCompletionRate(getYearActualTotal(progress.value), progress.value.annualTarget);
});

async function loadDetail() {
  const id = String(route.params.id);
  loading.value = true;
  try {
    project.value = await keyProjectApi.getById(id);
  } catch {
    message.error('项目不存在');
    router.replace('/project-management/key-project-overview');
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);

function goBack() {
  router.push('/project-management/key-project-overview');
}

async function handleSaved() {
  await loadDetail();
}
</script>

<template>
  <div class="key-project-detail">
    <div class="page-header page-header--with-action">
      <div>
        <a-button type="link" class="back-btn" @click="goBack">
          <ArrowLeftOutlined /> 返回列表
        </a-button>
        <h1 class="page-header__title">{{ project?.projectName || '项目详情' }}</h1>
        <p class="page-header__desc">重大办查看代建单位年初填报的目标及月度完成情况</p>
      </div>
    </div>

    <a-spin :spinning="loading">
      <template v-if="project">
        <a-alert
          type="info"
          show-icon
          class="flow-tip"
          message="业务流程：代建单位年初填报形象进度目标 → 每月更新完成情况 → 重大办在此查看目标与完成对比"
        />

        <a-card title="项目基本信息" :bordered="false" class="panel-card">
          <a-descriptions bordered size="small" :column="2">
            <a-descriptions-item label="项目代码">{{ project.projectCode }}</a-descriptions-item>
            <a-descriptions-item label="当前阶段">{{ project.currentStage }}</a-descriptions-item>
            <a-descriptions-item label="责任单位">{{ project.responsibleUnit }}</a-descriptions-item>
            <a-descriptions-item label="代建单位">{{ project.agencyUnit }}</a-descriptions-item>
            <a-descriptions-item label="总投资（亿元）">{{ project.totalInvestment }}</a-descriptions-item>
            <a-descriptions-item label="统计年度">{{ progress?.year }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-row :gutter="[16, 16]" style="margin-top: 16px">
          <a-col :xs="24" :sm="8">
            <a-card :bordered="false" class="stat-card">
              <a-statistic
                title="年度形象进度目标（万元）"
                :value="progress?.annualTarget ?? 0"
                :precision="0"
              />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-card :bordered="false" class="stat-card">
              <a-statistic
                title="累计完成（万元）"
                :value="progress ? getYearActualTotal(progress) : 0"
                :precision="0"
              />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-card :bordered="false" class="stat-card">
              <a-statistic
                title="年度完成率"
                :value="yearCompletionRate ?? 0"
                suffix="%"
                :precision="1"
              />
            </a-card>
          </a-col>
        </a-row>

        <a-card title="年初目标（代建单位填报）" :bordered="false" class="panel-card" style="margin-top: 16px">
          <template #extra>
            <span v-if="progress?.targetSubmittedAt" class="meta-text">
              {{ progress.targetSubmittedBy }} · {{ progress.targetSubmittedAt }}
            </span>
            <a-tag v-else color="warning">待代建单位填报</a-tag>
          </template>

          <a-descriptions bordered size="small" :column="2" style="margin-bottom: 16px">
            <a-descriptions-item label="年度目标（万元）">
              {{ progress?.annualTarget ?? '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="月度目标合计（万元）">
              {{ progress ? getYearTargetTotal(progress) : '—' }}
            </a-descriptions-item>
          </a-descriptions>

          <a-table
            :columns="[
              { title: '月份', dataIndex: 'monthLabel', key: 'monthLabel', width: 120 },
              { title: '月度目标（万元）', dataIndex: 'targetAmount', key: 'targetAmount', align: 'right' }
            ]"
            :data-source="monthlyRows"
            :pagination="false"
            size="small"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'targetAmount'">
                {{ record.targetAmount ?? '—' }}
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card title="月度完成情况（代建单位填报）" :bordered="false" class="panel-card" style="margin-top: 16px">
          <a-table
            :columns="[
              { title: '月份', dataIndex: 'monthLabel', key: 'monthLabel', width: 120 },
              { title: '目标（万元）', dataIndex: 'targetAmount', key: 'targetAmount', align: 'right', width: 120 },
              { title: '完成（万元）', dataIndex: 'actualAmount', key: 'actualAmount', align: 'right', width: 120 },
              { title: '完成率', key: 'rate', width: 90, align: 'right' },
              { title: '完成情况说明', dataIndex: 'remark', key: 'remark', ellipsis: true },
              { title: '更新时间', dataIndex: 'reportedAt', key: 'reportedAt', width: 160 }
            ]"
            :data-source="monthlyRows"
            :pagination="false"
            size="small"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'targetAmount' || column.key === 'actualAmount'">
                {{ record[column.key] ?? '—' }}
              </template>
              <template v-else-if="column.key === 'rate'">
                <span :class="{ 'rate--warn': record.rate != null && record.rate < 100 }">
                  {{ record.rate != null ? `${record.rate}%` : '—' }}
                </span>
              </template>
              <template v-else-if="column.key === 'remark'">
                {{ record.remark || '—' }}
              </template>
              <template v-else-if="column.key === 'reportedAt'">
                {{ record.reportedAt || '—' }}
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card title="代建单位填报入口（演示）" :bordered="false" class="panel-card panel-card--demo" style="margin-top: 16px">
          <p class="demo-desc">以下按钮模拟代建单位操作，重大办账号仅查看上方数据。</p>
          <a-space>
            <a-button type="primary" @click="targetOpen = true">代建单位 · 填报目标</a-button>
            <a-button @click="completionOpen = true">代建单位 · 月度填报</a-button>
          </a-space>
        </a-card>
      </template>
    </a-spin>

    <ImageProgressTargetModal
      v-model:open="targetOpen"
      :project="project"
      @saved="handleSaved"
    />
    <MonthlyCompletionModal
      v-model:open="completionOpen"
      :project="project"
      @saved="handleSaved"
    />
  </div>
</template>

<style scoped>
.back-btn {
  padding-left: 0;
  margin-bottom: 4px;
}

.flow-tip {
  margin-bottom: 16px;
}

.panel-card {
  box-shadow: 0 1px 4px rgba(19, 75, 234, 0.05);
}

.panel-card--demo {
  border: 1px dashed var(--color-border, #d9d9d9);
}

.stat-card {
  box-shadow: 0 1px 4px rgba(19, 75, 234, 0.05);
}

.meta-text {
  font-size: 12px;
  color: var(--color-text-secondary, #8c8c8c);
}

.demo-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--color-text-secondary, #8c8c8c);
}

.rate--warn {
  color: #cf1322;
  font-weight: 600;
}
</style>
