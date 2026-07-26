<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { onMounted, reactive, ref } from 'vue';
import { supplementLibraryApi } from '@/api/supplement-library';
import {
  canManageOwnSupplementApplication,
  canViewAllSupplementApplications,
  getCurrentUser
} from '@/mock/current-user';
import {
  SL_RESPONSIBLE_UNIT_OPTIONS,
  SL_TERRITORY_OPTIONS,
  SUPPLEMENT_LIBRARY_STATUS_LABEL,
  SUPPLEMENT_LIBRARY_STATUS_OPTIONS,
  getSupplementLibraryStatusColor,
  type SupplementLibraryItem,
  type SupplementLibraryStatus
} from '@/types/supplement-library';
import DeclareModal from './components/DeclareModal.vue';
import DetailDrawer from './components/DetailDrawer.vue';
import RevokeModal from './components/RevokeModal.vue';

const loading = ref(false);
const list = ref<SupplementLibraryItem[]>([]);

const filters = reactive({
  keyword: '',
  territory: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined,
  status: undefined as SupplementLibraryStatus | undefined
});

const declareOpen = ref(false);
const editRecord = ref<SupplementLibraryItem | null>(null);
const detailOpen = ref(false);
const detailRecord = ref<SupplementLibraryItem | null>(null);
const revokeOpen = ref(false);
const revokeRecord = ref<SupplementLibraryItem | null>(null);

const columns: TableColumnType<SupplementLibraryItem>[] = [
  { title: '项目名称', key: 'projectName', width: 220, ellipsis: true },
  { title: '项目代码', key: 'projectCode', width: 150 },
  { title: '总投资（万元）', key: 'totalInvestment', width: 120, align: 'right' },
  { title: '项目属地', key: 'territory', width: 110 },
  { title: '责任单位', key: 'responsibleUnits', width: 140, ellipsis: true },
  { title: '申请人', key: 'applicant', width: 90 },
  { title: '申请时间', key: 'submittedAt', width: 160 },
  { title: '申报状态', key: 'status', width: 100 },
  { title: '操作', key: 'operation', width: 220, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    const user = getCurrentUser();
    list.value = await supplementLibraryApi.list({
      keyword: filters.keyword || undefined,
      territory: filters.territory,
      responsibleUnit: filters.responsibleUnit,
      status: filters.status,
      applicantId: canViewAllSupplementApplications(user.role) ? undefined : user.id
    });
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.territory = undefined;
  filters.responsibleUnit = undefined;
  filters.status = undefined;
  loadList();
}

function openCreate() {
  editRecord.value = null;
  declareOpen.value = true;
}

function openEdit(record: SupplementLibraryItem) {
  editRecord.value = record;
  declareOpen.value = true;
}

function openDetail(record: SupplementLibraryItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openRevoke(record: SupplementLibraryItem) {
  revokeRecord.value = record;
  revokeOpen.value = true;
}

function canEdit(record: SupplementLibraryItem) {
  const user = getCurrentUser();
  if (!canManageOwnSupplementApplication(user.role, record.applicantId, user.id) && user.role !== 'admin') {
    return false;
  }
  return record.status === 'pendingReview' || record.status === 'returned';
}

function canRevoke(record: SupplementLibraryItem) {
  const user = getCurrentUser();
  if (!canManageOwnSupplementApplication(user.role, record.applicantId, user.id) && user.role !== 'admin') {
    return false;
  }
  return (
    record.status === 'pendingReview' ||
    record.status === 'reviewing' ||
    record.status === 'returned'
  );
}

onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">项目增补</h2>
        <p class="page-desc">
          项目专员申报退库增补 → 分管领导初审 → 片区专员终审 → 实施库展示。申报字段按业主/建筑/资金/土地信息填写。
        </p>
      </div>
      <a-button type="primary" @click="openCreate">项目申报</a-button>
    </div>

    <a-card class="filter-card" :bordered="false">
      <a-form layout="inline" class="filter-form">
        <a-form-item label="关键字">
          <a-input
            v-model:value="filters.keyword"
            allow-clear
            placeholder="请输入项目代码｜项目名称｜项目简称"
            style="width: 280px"
          />
        </a-form-item>
        <a-form-item label="项目属地">
          <a-select
            v-model:value="filters.territory"
            allow-clear
            placeholder="全部"
            style="width: 140px"
            :options="SL_TERRITORY_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="责任单位">
          <a-select
            v-model:value="filters.responsibleUnit"
            allow-clear
            show-search
            placeholder="全部"
            style="width: 150px"
            :options="SL_RESPONSIBLE_UNIT_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="申报状态">
          <a-select
            v-model:value="filters.status"
            allow-clear
            placeholder="全部"
            style="width: 140px"
            :options="SUPPLEMENT_LIBRARY_STATUS_OPTIONS"
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
          <template v-if="column.key === 'projectName'">
            {{ (row as SupplementLibraryItem).projectName }}
          </template>
          <template v-else-if="column.key === 'projectCode'">
            {{ (row as SupplementLibraryItem).projectCode || '—' }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ (row as SupplementLibraryItem).totalInvestment ?? '—' }}
          </template>
          <template v-else-if="column.key === 'territory'">
            {{ (row as SupplementLibraryItem).territory }}
          </template>
          <template v-else-if="column.key === 'responsibleUnits'">
            {{ (row as SupplementLibraryItem).responsibleUnits.join('、') }}
          </template>
          <template v-else-if="column.key === 'applicant'">
            {{ (row as SupplementLibraryItem).applicant }}
          </template>
          <template v-else-if="column.key === 'submittedAt'">
            {{ (row as SupplementLibraryItem).submittedAt || '—' }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getSupplementLibraryStatusColor((row as SupplementLibraryItem).status)">
              {{ SUPPLEMENT_LIBRARY_STATUS_LABEL[(row as SupplementLibraryItem).status] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as SupplementLibraryItem)">
                详情
              </a-button>
              <a-button
                v-if="canEdit(row as SupplementLibraryItem)"
                type="link"
                size="small"
                @click="openEdit(row as SupplementLibraryItem)"
              >
                修改
              </a-button>
              <a-button
                v-if="canRevoke(row as SupplementLibraryItem)"
                type="link"
                size="small"
                danger
                @click="openRevoke(row as SupplementLibraryItem)"
              >
                撤销申报
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <DeclareModal v-model:open="declareOpen" :record="editRecord" @saved="loadList" />
    <DetailDrawer v-model:open="detailOpen" :record="detailRecord" />
    <RevokeModal v-model:open="revokeOpen" :record="revokeRecord" @saved="loadList" />
  </div>
</template>

<style scoped>
.page {
  padding: 16px 20px 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
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
  max-width: 720px;
}
.filter-card {
  margin-bottom: 12px;
}
.filter-form {
  row-gap: 8px;
}
</style>
