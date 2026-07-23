<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { projectsApi } from '@/api/supplement-pool';
import type {
  ConstructionNature,
  InvestRange,
  ProjectStatus,
  ProjectType,
  SupplementProjectForm,
  SupplementProjectItem
} from '@/types/supplement-pool';
import {
  CONSTRUCTION_NATURE_LABEL,
  getProjectStatusTagColor,
  INVEST_RANGE_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  RESPONSIBLE_UNIT_OPTIONS,
  STREET_TOWN_OPTIONS
} from '@/types/supplement-pool';
import ProjectAuditModal from './components/ProjectAuditModal.vue';
import ProjectDeclareModal from './components/ProjectDeclareModal.vue';
import ProjectDetailDrawer from './components/ProjectDetailDrawer.vue';
import ResponsibleUnitsCell from '@/components/ResponsibleUnitsCell.vue';

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

const declareOpen = ref(false);
const detailOpen = ref(false);
const auditOpen = ref(false);
const editingItem = ref<SupplementProjectItem | null>(null);
const viewingItem = ref<SupplementProjectItem | null>(null);
const auditingItem = ref<SupplementProjectItem | null>(null);

const columns: TableColumnType[] = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 220, ellipsis: true },
  { title: '项目代码', dataIndex: 'projectCode', key: 'projectCode', width: 180 },
  { title: '项目类型', dataIndex: 'projectType', key: 'projectType', width: 110 },
  { title: '项目属地', dataIndex: 'projectLocation', key: 'projectLocation', width: 100 },
  { title: '项目性质', dataIndex: 'projectNature', key: 'projectNature', width: 90 },
  { title: '责任单位', dataIndex: 'responsibleUnits', key: 'responsibleUnits', width: 180 },
  { title: '总投资（亿元）', dataIndex: 'totalInvestment', key: 'totalInvestment', width: 130, align: 'right' },
  { title: '项目状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'operation', width: 200, fixed: 'right' }
];

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return tableData.value.slice(start, start + pagination.pageSize);
});

const projectTypeOptions = Object.entries(PROJECT_TYPE_LABEL).map(([value, label]) => ({
  value,
  label
}));

const investRangeOptions = Object.entries(INVEST_RANGE_LABEL).map(([value, label]) => ({
  value,
  label
}));

const statusOptions = Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({
  value,
  label
}));

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await projectsApi.getList({
      poolStage: 'supplement',
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
  searchForm.keyword = '';
  searchForm.projectType = undefined;
  searchForm.investRange = undefined;
  searchForm.streetTown = undefined;
  searchForm.responsibleUnit = undefined;
  searchForm.status = undefined;
  pagination.current = 1;
  loadList();
}

function openDeclare() {
  editingItem.value = null;
  declareOpen.value = true;
}

function canEditProject(record: SupplementProjectItem) {
  return record.status !== 'stored';
}

function openEdit(record: SupplementProjectItem) {
  if (!canEditProject(record)) {
    message.warning('已入库项目不可修改');
    return;
  }
  editingItem.value = { ...record };
  declareOpen.value = true;
}

async function openDetail(record: SupplementProjectItem) {
  viewingItem.value = await projectsApi.getById(record.id);
  detailOpen.value = true;
}

function openAudit(record: SupplementProjectItem) {
  if (record.status !== 'pending') {
    message.warning('仅待审核状态的项目可进行审核');
    return;
  }
  auditingItem.value = record;
  auditOpen.value = true;
}

async function handleDeclareSubmit(payload: SupplementProjectForm) {
  if (editingItem.value) {
    await projectsApi.update(editingItem.value.id, payload);
    message.success('修改成功');
  } else {
    await projectsApi.create(payload);
    message.success('申报成功，已进入待审核');
  }
  declareOpen.value = false;
  await loadList();
}

async function handleAuditSubmit(payload: { approved: boolean; remark?: string }) {
  if (!auditingItem.value) return;
  await projectsApi.audit(auditingItem.value.id, payload);
  message.success(payload.approved ? '审核通过，项目已入库' : '已退回');
  auditOpen.value = false;
  await loadList();
}

function statusTagColor(status: ProjectStatus) {
  return getProjectStatusTagColor(status);
}

function onTableChange(pag: { current?: number; pageSize?: number }) {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">增补库</h1>
    </div>

    <div class="table-wrap">
      <das-search-bar
        class="search-bar"
        :model="searchForm"
        :columns="3"
        @search="handleSearch"
        @reset="handleReset"
      >
        <a-form-item label="关键字" name="keyword">
          <a-input v-model:value="searchForm.keyword" placeholder="项目名称/项目代码" allow-clear />
        </a-form-item>
        <a-form-item label="项目类型" name="projectType">
          <a-select
            v-model:value="searchForm.projectType"
            allow-clear
            placeholder="全部"
            :options="projectTypeOptions"
          />
        </a-form-item>
        <a-form-item label="投资额" name="investRange">
          <a-select
            v-model:value="searchForm.investRange"
            allow-clear
            placeholder="全部"
            :options="investRangeOptions"
          />
        </a-form-item>
        <a-form-item label="所属街镇" name="streetTown">
          <a-select
            v-model:value="searchForm.streetTown"
            allow-clear
            placeholder="全部"
            :options="STREET_TOWN_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="责任单位" name="responsibleUnit">
          <a-select
            v-model:value="searchForm.responsibleUnit"
            allow-clear
            placeholder="全部"
            :options="RESPONSIBLE_UNIT_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="项目状态" name="status">
          <a-select
            v-model:value="searchForm.status"
            allow-clear
            placeholder="全部"
            :options="statusOptions"
          />
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
        :scroll="{ x: 1400 }"
        @change="onTableChange"
      >
        <template #operate>
          <a-button type="primary" @click="openDeclare">
            <template #icon><PlusOutlined /></template>
            项目申报
          </a-button>
        </template>

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
            <a-button type="link" :disabled="!canEditProject(record)" @click="openEdit(record)">修改</a-button>
            <a-button
              type="link"
              :disabled="record.status !== 'pending'"
              @click="openAudit(record)"
            >
              审核
            </a-button>
          </template>
        </template>

        <template #emptyText>
          <a-empty description="暂无申报项目，点击「项目申报」新建" />
        </template>
      </das-table>
    </div>

    <ProjectDeclareModal
      v-model:open="declareOpen"
      :record="editingItem"
      @submit="handleDeclareSubmit"
    />

    <ProjectDetailDrawer v-model:open="detailOpen" :record="viewingItem" />

    <ProjectAuditModal
      v-model:open="auditOpen"
      :record="auditingItem"
      @submit="handleAuditSubmit"
    />
  </div>
</template>
