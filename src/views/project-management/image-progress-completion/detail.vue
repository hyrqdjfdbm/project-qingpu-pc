<script setup lang="ts">
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FundOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import type { TableColumnType } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { imageProgressCompletionApi } from '@/api/image-progress-completion';
import type { ImageProgressProject } from '@/types/image-progress-completion';
import {
  calcFundRate,
  createEmptyMonthlyTargets,
  getMonthLabel,
  getWeekLabel,
  getYearFundCompleted,
  getYearFundTargetTotal
} from '@/types/image-progress-completion';
import MonthlyFundModal from './components/MonthlyFundModal.vue';
import TargetReportModal from './components/TargetReportModal.vue';
import WeeklyImageModal from './components/WeeklyImageModal.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const project = ref<ImageProgressProject | null>(null);
const year = ref(Number(route.query.year) || new Date().getFullYear());

const targetOpen = ref(false);
const monthlyOpen = ref(false);
const weeklyOpen = ref(false);

const yearTarget = computed(() => project.value?.yearTarget);

const monthlyRows = computed(() => {
  if (!project.value) return [];
  const months = yearTarget.value?.monthlyTargets?.length
    ? yearTarget.value.monthlyTargets
    : createEmptyMonthlyTargets();

  return months.map((m) => {
    const fund = project.value!.monthlyFundReports.find((r) => r.month === m.month);
    const image = project.value!.monthlyImageReports.find((r) => r.month === m.month);
    return {
      key: m.month,
      monthLabel: getMonthLabel(year.value, m.month),
      fundTarget: m.fundTarget,
      fundCompleted: fund?.completedAmount,
      fundCumulative: fund?.cumulativeAmount,
      fundRate: calcFundRate(fund?.completedAmount, m.fundTarget),
      imageTarget: m.imageProgressTarget,
      imageContent: image?.content,
      imagePercent: image?.progressPercent,
      fundReportedAt: fund?.reportedAt,
      imageReportedAt: image?.reportedAt
    };
  });
});

const monthColumns: TableColumnType[] = [
  { title: '月份', dataIndex: 'monthLabel', key: 'monthLabel', width: 110, fixed: 'left' },
  { title: '资金目标（万元）', dataIndex: 'fundTarget', key: 'fundTarget', width: 130, align: 'right' },
  { title: '资金完成（万元）', dataIndex: 'fundCompleted', key: 'fundCompleted', width: 130, align: 'right' },
  { title: '累计资金（万元）', dataIndex: 'fundCumulative', key: 'fundCumulative', width: 130, align: 'right' },
  { title: '资金完成率', key: 'fundRate', width: 100, align: 'right' },
  { title: '形象进度目标', dataIndex: 'imageTarget', key: 'imageTarget', width: 200, ellipsis: true },
  { title: '形象进度完成情况', dataIndex: 'imageContent', key: 'imageContent', width: 240, ellipsis: true },
  { title: '形象进度完成比例', key: 'imagePercent', width: 130, align: 'right' }
];

const weekColumns: TableColumnType[] = [
  { title: '周次', key: 'week', width: 220 },
  { title: '完成情况', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '完成比例', key: 'pct', width: 100, align: 'right' },
  { title: '填报人', dataIndex: 'reportedBy', key: 'reportedBy', width: 100 },
  { title: '填报时间', dataIndex: 'reportedAt', key: 'reportedAt', width: 170 }
];

const yearFundRate = computed(() =>
  calcFundRate(
    project.value ? getYearFundCompleted(project.value, year.value) : undefined,
    yearTarget.value?.fundTarget
  )
);

const sortedWeeks = computed(() => {
  if (!project.value) return [];
  return [...project.value.weeklyImageReports].sort((a, b) => b.week - a.week);
});

async function loadDetail() {
  const id = String(route.params.id);
  loading.value = true;
  try {
    project.value = await imageProgressCompletionApi.getById(id, year.value);
  } catch {
    message.error('项目不存在');
    router.replace('/project-management/image-progress-completion');
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);

watch(year, () => {
  loadDetail();
});

function goBack() {
  router.push('/project-management/image-progress-completion');
}

async function handleSaved() {
  await loadDetail();
}
</script>

<template>
  <div class="image-progress-detail">
    <div class="page-header page-header--with-action">
      <div>
        <a-button type="link" class="back-btn" @click="goBack">
          <ArrowLeftOutlined /> 返回列表
        </a-button>
        <h1 class="page-header__title">{{ project?.projectName || '形象进度完成情况' }}</h1>
        <p class="page-header__desc">查看本项目年度目标及各月资金、形象进度目标与完成情况</p>
      </div>
      <a-space wrap>
        <a-input-number
          v-model:value="year"
          :min="2020"
          :max="2099"
          :controls="false"
          style="width: 100px"
          addon-after="年"
        />
        <a-button @click="monthlyOpen = true">
          <template #icon><FundOutlined /></template>
          月度资金填报
        </a-button>
        <a-button @click="weeklyOpen = true">
          <template #icon><CalendarOutlined /></template>
          周形象进度填报
        </a-button>
        <a-button type="primary" @click="targetOpen = true">
          <template #icon><PlusOutlined /></template>
          项目进度目标填报
        </a-button>
      </a-space>
    </div>

    <a-spin :spinning="loading">
      <template v-if="project">
        <a-card title="项目基本信息" :bordered="false" class="panel-card">
          <a-descriptions bordered size="small" :column="2">
            <a-descriptions-item label="项目代码">{{ project.projectCode }}</a-descriptions-item>
            <a-descriptions-item label="当前阶段">{{ project.currentStage }}</a-descriptions-item>
            <a-descriptions-item label="责任单位">{{ project.responsibleUnit }}</a-descriptions-item>
            <a-descriptions-item label="施工单位">{{ project.constructionUnit }}</a-descriptions-item>
            <a-descriptions-item label="总投资（亿元）">{{ project.totalInvestment }}</a-descriptions-item>
            <a-descriptions-item label="统计年度">{{ year }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-row :gutter="[16, 16]" style="margin-top: 16px">
          <a-col :xs="24" :sm="8">
            <a-card :bordered="false" class="stat-card">
              <a-statistic
                title="年度资金目标（万元）"
                :value="yearTarget?.fundTarget ?? 0"
                :precision="0"
              />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-card :bordered="false" class="stat-card">
              <a-statistic
                title="累计资金完成（万元）"
                :value="getYearFundCompleted(project, year)"
                :precision="0"
              />
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="8">
            <a-card :bordered="false" class="stat-card">
              <a-statistic
                title="年度资金完成率"
                :value="yearFundRate ?? 0"
                suffix="%"
                :precision="1"
              />
            </a-card>
          </a-col>
        </a-row>

        <a-card
          title="年度目标"
          :bordered="false"
          class="panel-card"
          style="margin-top: 16px"
        >
          <template #extra>
            <span v-if="yearTarget?.submittedAt" class="meta-text">
              {{ yearTarget.submittedBy }} · {{ yearTarget.submittedAt }}
            </span>
            <a-tag v-else color="warning">待填报</a-tag>
          </template>

          <template v-if="yearTarget">
            <a-descriptions bordered size="small" :column="1">
              <a-descriptions-item label="年度资金目标（万元）">
                {{ yearTarget.fundTarget.toLocaleString() }}
                <span class="meta-text" style="margin-left: 12px">
                  月度资金目标合计：{{ getYearFundTargetTotal(yearTarget).toLocaleString() }}
                </span>
              </a-descriptions-item>
              <a-descriptions-item label="年度形象进度目标">
                {{ yearTarget.imageProgressTarget }}
              </a-descriptions-item>
            </a-descriptions>
          </template>
          <div v-else class="empty-tip">尚未填报年度目标，请点击右上角「项目进度目标填报」</div>
        </a-card>

        <a-card
          title="各月目标与完成情况"
          :bordered="false"
          class="panel-card"
          style="margin-top: 16px"
        >
          <a-table
            :columns="monthColumns"
            :data-source="monthlyRows"
            row-key="key"
            :pagination="false"
            size="middle"
            :scroll="{ x: 1200 }"
          >
            <template #bodyCell="{ column, record: row }">
              <template v-if="column.key === 'fundTarget'">
                {{ row.fundTarget != null ? row.fundTarget.toLocaleString() : '—' }}
              </template>
              <template v-else-if="column.key === 'fundCompleted'">
                {{ row.fundCompleted != null ? row.fundCompleted.toLocaleString() : '—' }}
              </template>
              <template v-else-if="column.key === 'fundCumulative'">
                {{ row.fundCumulative != null ? row.fundCumulative.toLocaleString() : '—' }}
              </template>
              <template v-else-if="column.key === 'fundRate'">
                <span v-if="row.fundRate != null">{{ row.fundRate }}%</span>
                <span v-else class="empty-tip">—</span>
              </template>
              <template v-else-if="column.key === 'imageTarget'">
                {{ row.imageTarget || '—' }}
              </template>
              <template v-else-if="column.key === 'imageContent'">
                {{ row.imageContent || '—' }}
              </template>
              <template v-else-if="column.key === 'imagePercent'">
                <span v-if="row.imagePercent != null">{{ row.imagePercent }}%</span>
                <span v-else class="empty-tip">—</span>
              </template>
            </template>
          </a-table>
        </a-card>

        <a-card
          title="周形象进度明细"
          :bordered="false"
          class="panel-card"
          style="margin-top: 16px"
        >
          <a-table
            v-if="sortedWeeks.length"
            :columns="weekColumns"
            :data-source="sortedWeeks"
            row-key="id"
            :pagination="false"
            size="middle"
          >
            <template #bodyCell="{ column, record: row }">
              <template v-if="column.key === 'week'">
                {{ getWeekLabel(row.year, row.week, row.weekStart, row.weekEnd) }}
              </template>
              <template v-else-if="column.key === 'pct'">
                {{ row.progressPercent != null ? `${row.progressPercent}%` : '—' }}
              </template>
            </template>
          </a-table>
          <div v-else class="empty-tip">暂无周形象进度填报记录</div>
        </a-card>
      </template>
    </a-spin>

    <TargetReportModal
      v-model:open="targetOpen"
      :project-id="project?.id"
      :year="year"
      @saved="handleSaved"
    />
    <MonthlyFundModal
      v-model:open="monthlyOpen"
      :project-id="project?.id"
      @saved="handleSaved"
    />
    <WeeklyImageModal
      v-model:open="weeklyOpen"
      :project-id="project?.id"
      @saved="handleSaved"
    />
  </div>
</template>

<style scoped>
.page-header--with-action {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.back-btn {
  padding-left: 0;
  margin-bottom: 4px;
}

.panel-card {
  box-shadow: var(--shadow-1, 0 1px 2px rgba(0, 0, 0, 0.03));
}

.stat-card {
  text-align: center;
}

.meta-text {
  font-size: 12px;
  color: var(--color-text-secondary, #8c8c8c);
}

.empty-tip {
  font-size: 13px;
  color: var(--color-text-secondary, #8c8c8c);
}
</style>
