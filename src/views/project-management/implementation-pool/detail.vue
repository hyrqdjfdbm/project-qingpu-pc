<script setup lang="ts">
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { progressFundReportApi } from '@/api/progress-fund-report';
import { projectsApi } from '@/api/supplement-pool';
import {
  canFillProgressFund,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import type { ProgressFundProject } from '@/types/progress-fund-report';
import type { SupplementProjectItem } from '@/types/supplement-pool';
import {
  CONSTRUCTION_NATURE_LABEL,
  POOL_STAGE_LABEL,
  PROJECT_ATTRIBUTE_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROJECT_TYPE_LABEL
} from '@/types/supplement-pool';
import ImageYearModal from '@/views/project-management/progress-fund-report/components/ImageYearModal.vue';
import ImageMonthlyModal from '@/views/project-management/progress-fund-report/components/ImageMonthlyModal.vue';
import ImageWeeklyModal from '@/views/project-management/progress-fund-report/components/ImageWeeklyModal.vue';
import SuperiorYearModal from '@/views/project-management/progress-fund-report/components/SuperiorYearModal.vue';
import SuperiorWeeklyModal from '@/views/project-management/progress-fund-report/components/SuperiorWeeklyModal.vue';
import FundDisbursementPanel from './components/FundDisbursementPanel.vue';
import ImageProgressPanel from './components/ImageProgressPanel.vue';
import { mapProgressToPool } from './map-progress-project';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const pool = ref<SupplementProjectItem | null>(null);
const progress = ref<ProgressFundProject | null>(null);
const activeTab = ref((route.query.tab as string) || 'basic');

const imageYearOpen = ref(false);
const imageMonthlyOpen = ref(false);
const imageWeeklyOpen = ref(false);
const superiorYearOpen = ref(false);
const superiorWeeklyOpen = ref(false);

const canFill = computed(() => {
  currentUserVersion.value;
  return canFillProgressFund(getCurrentUser().role);
});

function enumLabel(map: Record<string, string>, value?: string) {
  if (!value) return '—';
  return map[value] ?? value;
}

async function loadDetail() {
  const id = String(route.params.id);
  loading.value = true;
  try {
    try {
      pool.value = await projectsApi.getById(id);
    } catch {
      pool.value = null;
    }
    try {
      progress.value = await progressFundReportApi.getById(id);
    } catch {
      progress.value = null;
    }
    if (pool.value && !progress.value) {
      progress.value = await progressFundReportApi.ensureFromPool(pool.value);
    }
    if (!pool.value && progress.value) {
      pool.value = mapProgressToPool(progress.value);
    }
    if (!pool.value) {
      message.error('项目不存在');
      router.replace('/project-management/implementation-pool');
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);

function goBack() {
  router.push('/project-management/implementation-pool');
}
</script>

<template>
  <div>
    <div class="page-header page-header--with-action">
      <div>
        <a-button type="link" class="back-btn" @click="goBack">
          <ArrowLeftOutlined /> 返回实施库
        </a-button>
        <h1 class="page-header__title">{{ pool?.projectName || '项目详情' }}</h1>
        <p v-if="pool" class="page-header__desc meta-line">
          项目属地：{{ pool.projectLocation || '—' }}　总投资（亿元）：{{ pool.totalInvestment?.toFixed(2) }}　责任单位：{{
            pool.responsibleUnits.join('、') || '—'
          }}　建设进度：{{ pool.constructionProgress || '—' }}
        </p>
      </div>
      <a-space v-if="canFill" wrap>
        <a-button @click="imageYearOpen = true">项目进度目标填报</a-button>
        <a-button type="primary" @click="superiorYearOpen = true">上级资金下达和使用计划填报</a-button>
      </a-space>
    </div>

    <a-spin :spinning="loading">
      <a-card v-if="pool" :bordered="false">
        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="basic" tab="基本信息">
            <a-descriptions title="基本信息" :column="2" bordered size="small">
              <a-descriptions-item label="项目名称" :span="2">{{ pool.projectName }}</a-descriptions-item>
              <a-descriptions-item label="项目简称">{{ pool.projectAbbr || '—' }}</a-descriptions-item>
              <a-descriptions-item label="项目代码">{{ pool.projectCode }}</a-descriptions-item>
              <a-descriptions-item label="项目类型">
                {{ enumLabel(PROJECT_TYPE_LABEL, pool.projectType) }}
              </a-descriptions-item>
              <a-descriptions-item label="项目属地">{{ pool.projectLocation || '—' }}</a-descriptions-item>
              <a-descriptions-item label="总投资（亿元）">{{ pool.totalInvestment?.toFixed(2) }}</a-descriptions-item>
              <a-descriptions-item label="责任单位" :span="2">
                {{ pool.responsibleUnits.join('、') || '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="所属库">{{ POOL_STAGE_LABEL[pool.poolStage] }}</a-descriptions-item>
              <a-descriptions-item label="投资完成率">
                {{ pool.progressPercent != null ? `${pool.progressPercent}%` : '—' }}
              </a-descriptions-item>
            </a-descriptions>
            <a-descriptions title="业主信息" :column="2" bordered size="small" class="block">
              <a-descriptions-item label="项目单位名称" :span="2">{{ pool.unitName || '—' }}</a-descriptions-item>
              <a-descriptions-item label="项目属性">
                {{ enumLabel(PROJECT_ATTRIBUTE_LABEL, pool.projectAttribute) }}
              </a-descriptions-item>
              <a-descriptions-item label="项目类别">
                {{ enumLabel(PROJECT_CATEGORY_LABEL, pool.projectCategory) }}
              </a-descriptions-item>
            </a-descriptions>
            <a-descriptions title="建筑信息" :column="2" bordered size="small" class="block">
              <a-descriptions-item label="建设地点">{{ pool.constructionSite || '—' }}</a-descriptions-item>
              <a-descriptions-item label="建设性质">
                {{ enumLabel(CONSTRUCTION_NATURE_LABEL, pool.constructionNature) }}
              </a-descriptions-item>
              <a-descriptions-item label="详细建设地址" :span="2">
                {{ pool.constructionAddress || '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="建设规模及内容" :span="2">
                {{ pool.constructionScale || '—' }}
              </a-descriptions-item>
              <a-descriptions-item label="建设进度">{{ pool.constructionProgress || '—' }}</a-descriptions-item>
              <a-descriptions-item label="拟开工时间">{{ pool.proposedStartDate || '—' }}</a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>

          <a-tab-pane key="image" tab="形象进度完成情况">
            <ImageProgressPanel
              v-if="progress"
              :project="progress"
              :can-fill="canFill"
              @fill-monthly="imageMonthlyOpen = true"
              @fill-weekly="imageWeeklyOpen = true"
            />
          </a-tab-pane>

          <a-tab-pane key="fund" tab="资金拨付情况">
            <FundDisbursementPanel
              v-if="progress"
              :project="progress"
              :can-fill="canFill"
              @fill-weekly="superiorWeeklyOpen = true"
            />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </a-spin>

    <ImageYearModal v-model:open="imageYearOpen" :project-id="progress?.id" @saved="loadDetail" />
    <ImageMonthlyModal v-model:open="imageMonthlyOpen" :project-id="progress?.id" @saved="loadDetail" />
    <ImageWeeklyModal v-model:open="imageWeeklyOpen" :project-id="progress?.id" @saved="loadDetail" />
    <SuperiorYearModal v-model:open="superiorYearOpen" :project-id="progress?.id" @saved="loadDetail" />
    <SuperiorWeeklyModal v-model:open="superiorWeeklyOpen" :project-id="progress?.id" @saved="loadDetail" />
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
.meta-line {
  margin-top: 4px;
}
.block {
  margin-top: 16px;
}
</style>
