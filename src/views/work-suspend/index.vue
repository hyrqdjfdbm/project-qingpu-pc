<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { onMounted, reactive, ref } from 'vue';
import { workSuspendApi } from '@/api/work-suspend';
import { RESPONSIBLE_UNIT_OPTIONS } from '@/types/supplement-pool';
import {
  HOLIDAY_TYPE_LABEL,
  HOLIDAY_TYPE_OPTIONS,
  type HolidayType,
  type WorkSuspendItem
} from '@/types/work-suspend';
import DailyStaffModal from './components/DailyStaffModal.vue';
import DetailDrawer from './components/DetailDrawer.vue';
import ResumeReportModal from './components/ResumeReportModal.vue';
import StopReportModal from './components/StopReportModal.vue';

const loading = ref(false);
const list = ref<WorkSuspendItem[]>([]);

const yesNoOptions = [
  { value: true, label: '是' },
  { value: false, label: '否' }
];

const filters = reactive({
  year: new Date().getFullYear() as number | undefined,
  holiday: undefined as HolidayType | undefined,
  projectName: '',
  responsibleUnit: undefined as string | undefined,
  isSuspended: undefined as boolean | undefined,
  isResumed: undefined as boolean | undefined
});

const detailOpen = ref(false);
const detailRecord = ref<WorkSuspendItem | null>(null);
const stopOpen = ref(false);
const stopRecord = ref<WorkSuspendItem | null>(null);
const dailyOpen = ref(false);
const dailyRecord = ref<WorkSuspendItem | null>(null);
const resumeOpen = ref(false);
const resumeRecord = ref<WorkSuspendItem | null>(null);

const yearOptions = Array.from({ length: 6 }, (_, i) => {
  const y = new Date().getFullYear() - 2 + i;
  return { value: y, label: `${y}年` };
});

const columns: TableColumnType<WorkSuspendItem>[] = [
  { title: '年度', key: 'year', width: 80 },
  { title: '节假日', key: 'holiday', width: 90 },
  { title: '项目名称', key: 'projectName', width: 200, ellipsis: true },
  { title: '项目编码', key: 'projectCode', width: 140 },
  { title: '责任单位', key: 'responsibleUnit', width: 120 },
  { title: '是否停工', key: 'isSuspended', width: 90 },
  { title: '停工时间', key: 'suspendRange', width: 200 },
  { title: '是否复工', key: 'isResumed', width: 90 },
  { title: '复工时间', key: 'resumeDate', width: 120 },
  { title: '操作', key: 'operation', width: 280, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    list.value = await workSuspendApi.list({
      year: filters.year,
      holiday: filters.holiday,
      projectName: filters.projectName || undefined,
      responsibleUnit: filters.responsibleUnit,
      isSuspended: filters.isSuspended,
      isResumed: filters.isResumed
    });
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.year = new Date().getFullYear();
  filters.holiday = undefined;
  filters.projectName = '';
  filters.responsibleUnit = undefined;
  filters.isSuspended = undefined;
  filters.isResumed = undefined;
  loadList();
}

function openDetail(record: WorkSuspendItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openStop(record: WorkSuspendItem) {
  stopRecord.value = record;
  stopOpen.value = true;
}

function openDaily(record: WorkSuspendItem) {
  dailyRecord.value = record;
  dailyOpen.value = true;
}

function openResume(record: WorkSuspendItem) {
  resumeRecord.value = record;
  resumeOpen.value = true;
}

onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">项目停复工情况</h2>
        <p class="page-desc">
          记录每年五一 / 国庆 / 春节期间已开工项目的停复工情况。流程：填报停工情况 →（若停工）填报停工期间每日在岗人数 →
          复工后填报复工情况。
        </p>
      </div>
    </div>

    <a-card class="filter-card" :bordered="false">
      <a-form layout="inline" class="filter-form">
        <a-form-item label="年度">
          <a-select
            v-model:value="filters.year"
            allow-clear
            placeholder="全部"
            style="width: 110px"
            :options="yearOptions"
          />
        </a-form-item>
        <a-form-item label="节假日">
          <a-select
            v-model:value="filters.holiday"
            allow-clear
            placeholder="全部"
            style="width: 110px"
            :options="HOLIDAY_TYPE_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="项目名称">
          <a-input
            v-model:value="filters.projectName"
            allow-clear
            placeholder="项目名称"
            style="width: 180px"
          />
        </a-form-item>
        <a-form-item label="责任单位">
          <a-select
            v-model:value="filters.responsibleUnit"
            allow-clear
            show-search
            placeholder="全部"
            style="width: 150px"
            :options="RESPONSIBLE_UNIT_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="是否停工">
          <a-select
            v-model:value="filters.isSuspended"
            allow-clear
            placeholder="全部"
            style="width: 110px"
            :options="yesNoOptions"
          />
        </a-form-item>
        <a-form-item label="是否复工">
          <a-select
            v-model:value="filters.isResumed"
            allow-clear
            placeholder="全部"
            style="width: 110px"
            :options="yesNoOptions"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="loadList">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false">
      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="list"
        row-key="id"
        :scroll="{ x: 1300 }"
        :pagination="{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条` }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'year'">
            {{ (row as WorkSuspendItem).year }}
          </template>
          <template v-else-if="column.key === 'holiday'">
            {{ HOLIDAY_TYPE_LABEL[(row as WorkSuspendItem).holiday] }}
          </template>
          <template v-else-if="column.key === 'projectName'">
            {{ (row as WorkSuspendItem).projectName }}
          </template>
          <template v-else-if="column.key === 'projectCode'">
            {{ (row as WorkSuspendItem).projectCode }}
          </template>
          <template v-else-if="column.key === 'responsibleUnit'">
            {{ (row as WorkSuspendItem).responsibleUnit }}
          </template>
          <template v-else-if="column.key === 'isSuspended'">
            {{
              (row as WorkSuspendItem).isSuspended === undefined
                ? '—'
                : (row as WorkSuspendItem).isSuspended
                  ? '是'
                  : '否'
            }}
          </template>
          <template v-else-if="column.key === 'suspendRange'">
            {{
              (row as WorkSuspendItem).isSuspended
                ? `${(row as WorkSuspendItem).suspendStartDate || '—'} 至 ${(row as WorkSuspendItem).suspendEndDate || '—'}`
                : '—'
            }}
          </template>
          <template v-else-if="column.key === 'isResumed'">
            {{
              (row as WorkSuspendItem).isResumed === undefined
                ? '—'
                : (row as WorkSuspendItem).isResumed
                  ? '是'
                  : '否'
            }}
          </template>
          <template v-else-if="column.key === 'resumeDate'">
            {{ (row as WorkSuspendItem).resumeDate || '—' }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as WorkSuspendItem)">
                详情
              </a-button>
              <a-button
                v-if="(row as WorkSuspendItem).status === 'pendingStop'"
                type="link"
                size="small"
                @click="openStop(row as WorkSuspendItem)"
              >
                填报停工情况
              </a-button>
              <a-button
                v-if="(row as WorkSuspendItem).status === 'pendingDaily'"
                type="link"
                size="small"
                @click="openDaily(row as WorkSuspendItem)"
              >
                填报在岗人数
              </a-button>
              <a-button
                v-if="(row as WorkSuspendItem).status === 'pendingResume'"
                type="link"
                size="small"
                @click="openResume(row as WorkSuspendItem)"
              >
                填报复工情况
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <DetailDrawer v-model:open="detailOpen" :record="detailRecord" />
    <StopReportModal v-model:open="stopOpen" :record="stopRecord" @saved="loadList" />
    <DailyStaffModal v-model:open="dailyOpen" :record="dailyRecord" @saved="loadList" />
    <ResumeReportModal v-model:open="resumeOpen" :record="resumeRecord" @saved="loadList" />
  </div>
</template>

<style scoped>
.page {
  padding: 16px 20px 24px;
}
.page-header {
  margin-bottom: 12px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.page-desc {
  margin: 6px 0 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  max-width: 860px;
}
.filter-card {
  margin-bottom: 12px;
}
.filter-form {
  row-gap: 8px;
}
</style>
