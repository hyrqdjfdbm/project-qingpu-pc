<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { projectsApi } from '@/api/supplement-pool';
import ProjectDetailDrawer from '../supplement-pool/components/ProjectDetailDrawer.vue';
import type {
  InvestRange,
  ProjectStatus,
  ProjectType,
  SupplementProjectItem
} from '@/types/supplement-pool';
import {
  getProjectStatusTagColor,
  INVEST_RANGE_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  RESPONSIBLE_UNIT_OPTIONS,
  STREET_TOWN_OPTIONS
} from '@/types/supplement-pool';

type SortOrder = 'ascend' | 'descend' | null;

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
const sortState = reactive<{ field?: string; order: SortOrder }>({
  order: null
});

const sortableFields = [
  'projectName',
  'projectCode',
  'projectType',
  'projectLocation',
  'totalInvestment',
  'status'
] as const;

type SortableField = (typeof sortableFields)[number];

const columns = computed<TableColumnType<SupplementProjectItem>[]>(() => [
  {
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
    width: 220,
    ellipsis: true,
    sorter: true,
    sortOrder: sortState.field === 'projectName' ? sortState.order : null
  },
  {
    title: '项目代码',
    dataIndex: 'projectCode',
    key: 'projectCode',
    width: 180,
    sorter: true,
    sortOrder: sortState.field === 'projectCode' ? sortState.order : null
  },
  {
    title: '项目类型',
    dataIndex: 'projectType',
    key: 'projectType',
    width: 110,
    sorter: true,
    sortOrder: sortState.field === 'projectType' ? sortState.order : null
  },
  {
    title: '项目属地',
    dataIndex: 'projectLocation',
    key: 'projectLocation',
    width: 100,
    sorter: true,
    sortOrder: sortState.field === 'projectLocation' ? sortState.order : null
  },
  {
    title: '总投资（亿元）',
    dataIndex: 'totalInvestment',
    key: 'totalInvestment',
    width: 130,
    align: 'right',
    sorter: true,
    sortOrder: sortState.field === 'totalInvestment' ? sortState.order : null
  },
  {
    title: '项目状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    sorter: true,
    sortOrder: sortState.field === 'status' ? sortState.order : null
  },
  { title: '操作', key: 'operation', width: 160, fixed: 'right' }
]);

function compareValues(a: SupplementProjectItem, b: SupplementProjectItem, field: SortableField) {
  switch (field) {
    case 'projectName':
    case 'projectCode':
    case 'projectLocation':
      return String(a[field] ?? '').localeCompare(String(b[field] ?? ''), 'zh-CN');
    case 'projectType':
      return PROJECT_TYPE_LABEL[a.projectType].localeCompare(
        PROJECT_TYPE_LABEL[b.projectType],
        'zh-CN'
      );
    case 'totalInvestment':
      return (a.totalInvestment ?? 0) - (b.totalInvestment ?? 0);
    case 'status':
      return PROJECT_STATUS_LABEL[a.status].localeCompare(PROJECT_STATUS_LABEL[b.status], 'zh-CN');
    default:
      return 0;
  }
}

const sortedData = computed(() => {
  const list = [...tableData.value];
  const field = sortState.field as SortableField | undefined;
  if (!field || !sortState.order || !sortableFields.includes(field)) return list;
  list.sort((a, b) => {
    const result = compareValues(a, b, field);
    return sortState.order === 'ascend' ? result : -result;
  });
  return list;
});

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return sortedData.value.slice(start, start + pagination.pageSize);
});

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await projectsApi.getList({
      poolStage: 'planning',
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
  sortState.field = undefined;
  sortState.order = null;
  pagination.current = 1;
  loadList();
}

async function openDetail(record: SupplementProjectItem) {
  viewingItem.value = await projectsApi.getById(record.id);
  detailOpen.value = true;
}

async function transferToSupplement(record: SupplementProjectItem) {
  await projectsApi.transfer(record.id, 'supplement');
  message.success('已转入增补库');
  await loadList();
}

function statusTagColor(status: ProjectStatus) {
  return getProjectStatusTagColor(status);
}

function onTableChange(
  pag: { current?: number; pageSize?: number },
  _filters: unknown,
  sorter:
    | { field?: string | number; columnKey?: string | number; order?: SortOrder }
    | Array<{ field?: string | number; columnKey?: string | number; order?: SortOrder }>
) {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
  const current = Array.isArray(sorter) ? sorter[0] : sorter;
  const field = current?.field ?? current?.columnKey;
  sortState.field = field != null ? String(field) : undefined;
  sortState.order = current?.order ?? null;
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">谋划库</h1>
      <p class="page-header__desc">处于谋划阶段的项目，可转入增补库进行正式申报</p>
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
        :scroll="{ x: 1200 }"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'projectType'">
            {{ PROJECT_TYPE_LABEL[record.projectType as ProjectType] }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ record.totalInvestment?.toFixed(2) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="statusTagColor(record.status)">
              {{ PROJECT_STATUS_LABEL[record.status as ProjectStatus] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-button type="link" @click="openDetail(record)">查看详情</a-button>
            <a-button type="link" @click="transferToSupplement(record)">转增补库</a-button>
          </template>
        </template>
        <template #emptyText>
          <a-empty description="暂无谋划项目" />
        </template>
      </das-table>
    </div>

    <ProjectDetailDrawer v-model:open="detailOpen" :record="viewingItem" />
  </div>
</template>
