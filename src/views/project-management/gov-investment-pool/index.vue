<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { projectsApi } from '@/api/supplement-pool';
import ProjectDetailDrawer from '../supplement-pool/components/ProjectDetailDrawer.vue';
import ResponsibleUnitsCell from '@/components/ResponsibleUnitsCell.vue';
import type {
  ConstructionNature,
  InvestRange,
  ProjectStatus,
  ProjectType,
  SupplementProjectItem
} from '@/types/supplement-pool';
import {
  CONSTRUCTION_NATURE_LABEL,
  INVEST_RANGE_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  RESPONSIBLE_UNIT_OPTIONS,
  STREET_TOWN_OPTIONS
} from '@/types/supplement-pool';

const searchForm = reactive({
  keyword: '',
  projectType: undefined as ProjectType | undefined,
  investRange: undefined as InvestRange | undefined,
  streetTown: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined,
  status: undefined as ProjectStatus | undefined
});

const tableData = ref<SupplementProjectItem[]>([]);
const loading = ref(false);
const pagination = reactive({ current: 1, pageSize: 10 });
const detailOpen = ref(false);
const viewingItem = ref<SupplementProjectItem | null>(null);

const columns: TableColumnType[] = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 220, ellipsis: true },
  { title: '项目代码', dataIndex: 'projectCode', key: 'projectCode', width: 180 },
  { title: '项目类型', dataIndex: 'projectType', key: 'projectType', width: 110 },
  { title: '项目属地', dataIndex: 'projectLocation', key: 'projectLocation', width: 100 },
  { title: '项目性质', dataIndex: 'projectNature', key: 'projectNature', width: 90 },
  { title: '责任单位', dataIndex: 'responsibleUnits', key: 'responsibleUnits', width: 180 },
  { title: '总投资（亿元）', dataIndex: 'totalInvestment', key: 'totalInvestment', width: 130, align: 'right' },
  { title: '投资完成率', dataIndex: 'progressPercent', key: 'progressPercent', width: 120 },
  { title: '操作', key: 'operation', width: 100, fixed: 'right' }
];

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return tableData.value.slice(start, start + pagination.pageSize);
});

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await projectsApi.getList({
      poolStage: 'gov',
      keyword: searchForm.keyword || undefined,
      projectType: searchForm.projectType,
      investRange: searchForm.investRange,
      streetTown: searchForm.streetTown,
      responsibleUnit: searchForm.responsibleUnit,
      status: searchForm.status
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
  Object.assign(searchForm, {
    keyword: '',
    projectType: undefined,
    investRange: undefined,
    streetTown: undefined,
    responsibleUnit: undefined,
    status: undefined
  });
  pagination.current = 1;
  loadList();
}

async function openDetail(record: SupplementProjectItem) {
  viewingItem.value = await projectsApi.getById(record.id);
  detailOpen.value = true;
}

function onTableChange(pag: { current?: number; pageSize?: number }) {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">政府投资项目库</h1>
      <p class="page-header__desc">政府投资类项目专项管理</p>
    </div>

    <div class="table-wrap">
      <das-search-bar class="search-bar" :model="searchForm" :columns="3" @search="handleSearch" @reset="handleReset">
        <a-form-item label="关键字" name="keyword">
          <a-input v-model:value="searchForm.keyword" placeholder="项目名称/项目代码" allow-clear />
        </a-form-item>
        <a-form-item label="项目类型" name="projectType">
          <a-select v-model:value="searchForm.projectType" allow-clear placeholder="全部" :options="Object.entries(PROJECT_TYPE_LABEL).map(([v,l])=>({value:v,label:l}))" />
        </a-form-item>
        <a-form-item label="投资额" name="investRange">
          <a-select v-model:value="searchForm.investRange" allow-clear placeholder="全部" :options="Object.entries(INVEST_RANGE_LABEL).map(([v,l])=>({value:v,label:l}))" />
        </a-form-item>
        <a-form-item label="所属街镇" name="streetTown">
          <a-select v-model:value="searchForm.streetTown" allow-clear placeholder="全部" :options="STREET_TOWN_OPTIONS" />
        </a-form-item>
        <a-form-item label="责任单位" name="responsibleUnit">
          <a-select v-model:value="searchForm.responsibleUnit" allow-clear placeholder="全部" :options="RESPONSIBLE_UNIT_OPTIONS" />
        </a-form-item>
        <a-form-item label="项目状态" name="status">
          <a-select v-model:value="searchForm.status" allow-clear placeholder="全部" :options="Object.entries(PROJECT_STATUS_LABEL).map(([v,l])=>({value:v,label:l}))" />
        </a-form-item>
      </das-search-bar>

      <das-table
        :columns="columns"
        :data-source="pagedData"
        row-key="id"
        :selection="false"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="tableData.length"
        :loading="loading"
        :scroll="{ x: 1300 }"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'projectType'">
            {{ PROJECT_TYPE_LABEL[record.projectType as ProjectType] }}
          </template>
          <template v-else-if="column.key === 'projectNature'">
            {{ CONSTRUCTION_NATURE_LABEL[record.projectNature as ConstructionNature] }}
          </template>
          <template v-else-if="column.key === 'responsibleUnits'">
            <ResponsibleUnitsCell :units="record.responsibleUnits" />
          </template>
          <template v-else-if="column.key === 'progressPercent'">
            <a-progress v-if="record.progressPercent != null" :percent="record.progressPercent" size="small" />
            <span v-else>—</span>
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ record.totalInvestment?.toFixed(2) }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-button type="link" @click="openDetail(record)">查看详情</a-button>
          </template>
        </template>
        <template #emptyText>
          <a-empty description="暂无政府投资项目" />
        </template>
      </das-table>
    </div>

    <ProjectDetailDrawer v-model:open="detailOpen" :record="viewingItem" />
  </div>
</template>
