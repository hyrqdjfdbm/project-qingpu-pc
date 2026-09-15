<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { progressFundReportApi } from '@/api/progress-fund-report';
import {
  canAuditProgressFund,
  canFillProgressFund,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import type { AuditStatus, ProgressFundProject, SuperiorPolicyKey } from '@/types/progress-fund-report';
import {
  AUDIT_STATUS_COLOR,
  AUDIT_STATUS_LABEL,
  getWeekInfo,
  latestWeekly,
  monthFund
} from '@/types/progress-fund-report';

const router = useRouter();
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const thisWeek = getWeekInfo();

const activeTab = ref<'image' | 'superior'>('image');
const loading = ref(false);
const tableData = ref<ProgressFundProject[]>([]);
const searchForm = reactive({ keyword: '' });
const pagination = reactive({ current: 1, pageSize: 10 });

const canFill = computed(() => {
  currentUserVersion.value;
  return canFillProgressFund(getCurrentUser().role);
});
const canAudit = computed(() => {
  currentUserVersion.value;
  return canAuditProgressFund(getCurrentUser().role);
});

const imageColumns: TableColumnType[] = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 240, ellipsis: true },
  { title: '项目代码', dataIndex: 'projectCode', key: 'projectCode', width: 150 },
  { title: '责任单位', dataIndex: 'responsibleUnit', key: 'responsibleUnit', width: 160, ellipsis: true },
  { title: '年度目标', key: 'yearStatus', width: 110 },
  { title: '本月资金', key: 'monthStatus', width: 110 },
  { title: '本周进度', key: 'weekStatus', width: 110 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'operation', width: 100, fixed: 'right' }
];

const superiorColumns: TableColumnType[] = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 240, ellipsis: true },
  { title: '项目代码', dataIndex: 'projectCode', key: 'projectCode', width: 150 },
  { title: '责任单位', dataIndex: 'responsibleUnit', key: 'responsibleUnit', width: 160, ellipsis: true },
  { title: '专项债年度', key: 'bondYear', width: 120 },
  { title: '专项债本周', key: 'bondWeek', width: 120 },
  { title: '两重年度', key: 'budgetYear', width: 110 },
  { title: '两重本周', key: 'budgetWeek', width: 110 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'operation', width: 100, fixed: 'right' }
];

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return tableData.value.slice(start, start + pagination.pageSize);
});

function statusOf(status?: AuditStatus): AuditStatus {
  return status ?? 'none';
}

function imageYearStatus(row: ProgressFundProject): AuditStatus {
  return row.imageYearTarget?.year === currentYear ? statusOf(row.imageYearTarget?.status) : 'none';
}

function imageMonthStatus(row: ProgressFundProject): AuditStatus {
  return statusOf(monthFund(row.imageMonthlyFunds, currentYear, currentMonth)?.status);
}

function imageWeekStatus(row: ProgressFundProject): AuditStatus {
  const rowWeek = latestWeekly(row.imageWeeklyReports, thisWeek.year);
  if (!rowWeek || rowWeek.week !== thisWeek.week) return 'none';
  return statusOf(rowWeek.status);
}

function superiorYearStatus(row: ProgressFundProject, policy: SuperiorPolicyKey): AuditStatus {
  return statusOf(row.superior[policy].yearTarget?.status);
}

function superiorWeekStatus(row: ProgressFundProject, policy: SuperiorPolicyKey): AuditStatus {
  const rowWeek = latestWeekly(row.superior[policy].weeklyReports, thisWeek.year);
  if (!rowWeek || rowWeek.week !== thisWeek.week) return 'none';
  return statusOf(rowWeek.status);
}

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await progressFundReportApi.list({
      keyword: searchForm.keyword || undefined,
      year: currentYear
    });
  } finally {
    loading.value = false;
  }
}

onMounted(loadList);

function handleSearch() {
  pagination.current = 1;
  loadList();
}

function handleReset() {
  searchForm.keyword = '';
  handleSearch();
}

function goDetail(record: ProgressFundProject) {
  router.push({
    path: `/project-management/progress-fund-report/${record.id}`,
    query: { tab: activeTab.value }
  });
}

function onTabChange() {
  pagination.current = 1;
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">形象进度与上级资金</h1>
      <p class="page-header__desc">
        形象进度：年初填资金和进度目标，每月填资金完成，每周填进度完成，均需审核。上级资金：年初填资金目标，每周填资金完成，均需审核。
      </p>
    </div>

    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="项目名称 / 代码 / 责任单位"
            allow-clear
            style="width: 240px"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <p v-if="canFill || canAudit" class="hint">
        <span v-if="canFill">项目专员可填报并提交审核。</span>
        <span v-if="canAudit">分管领导 / 投管科可在详情页审核待审记录。</span>
      </p>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-tabs v-model:activeKey="activeTab" @change="onTabChange">
        <a-tab-pane key="image" tab="形象进度" />
        <a-tab-pane key="superior" tab="上级资金" />
      </a-tabs>
      <a-table
        :columns="activeTab === 'image' ? imageColumns : superiorColumns"
        :data-source="pagedData"
        :loading="loading"
        row-key="id"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: tableData.length,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条`
        }"
        :scroll="{ x: activeTab === 'image' ? 1200 : 1400 }"
        @change="
          (pag) => {
            pagination.current = pag.current ?? 1;
            pagination.pageSize = pag.pageSize ?? 10;
          }
        "
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'yearStatus'">
            <a-tag :color="AUDIT_STATUS_COLOR[imageYearStatus(row as ProgressFundProject)]">
              {{ AUDIT_STATUS_LABEL[imageYearStatus(row as ProgressFundProject)] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'monthStatus'">
            <a-tag :color="AUDIT_STATUS_COLOR[imageMonthStatus(row as ProgressFundProject)]">
              {{ AUDIT_STATUS_LABEL[imageMonthStatus(row as ProgressFundProject)] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'weekStatus'">
            <a-tag :color="AUDIT_STATUS_COLOR[imageWeekStatus(row as ProgressFundProject)]">
              {{ AUDIT_STATUS_LABEL[imageWeekStatus(row as ProgressFundProject)] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'bondYear'">
            <a-tag :color="AUDIT_STATUS_COLOR[superiorYearStatus(row as ProgressFundProject, 'specialBond')]">
              {{ AUDIT_STATUS_LABEL[superiorYearStatus(row as ProgressFundProject, 'specialBond')] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'bondWeek'">
            <a-tag :color="AUDIT_STATUS_COLOR[superiorWeekStatus(row as ProgressFundProject, 'specialBond')]">
              {{ AUDIT_STATUS_LABEL[superiorWeekStatus(row as ProgressFundProject, 'specialBond')] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'budgetYear'">
            <a-tag :color="AUDIT_STATUS_COLOR[superiorYearStatus(row as ProgressFundProject, 'twoHeavy')]">
              {{ AUDIT_STATUS_LABEL[superiorYearStatus(row as ProgressFundProject, 'twoHeavy')] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'budgetWeek'">
            <a-tag :color="AUDIT_STATUS_COLOR[superiorWeekStatus(row as ProgressFundProject, 'twoHeavy')]">
              {{ AUDIT_STATUS_LABEL[superiorWeekStatus(row as ProgressFundProject, 'twoHeavy')] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-button type="link" size="small" @click="goDetail(row as ProgressFundProject)">填报 / 审核</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.search-card :deep(.ant-card-body) {
  padding-bottom: 8px;
}
.hint {
  margin: 8px 0 0;
  color: var(--color-text-secondary, #8c8c8c);
  font-size: 13px;
}
</style>
