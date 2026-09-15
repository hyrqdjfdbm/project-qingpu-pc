<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { qingpuSupplementApi } from '@/api/qingpu-supplement';
import {
  canDeclareQingpuSupplement,
  canManageOwnSupplementApplication,
  canViewAllQingpuSupplement,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_TERRITORY_OPTIONS,
  QINGPU_SUPPLEMENT_STATUS_LABEL,
  QINGPU_SUPPLEMENT_STATUS_OPTIONS,
  getQingpuSupplementStatusColor,
  type QingpuSupplementItem,
  type QingpuSupplementStatus
} from '@/types/qingpu-supplement';
import DeclareModal from './components/DeclareModal.vue';
import DetailDrawer from './components/DetailDrawer.vue';
import RevokeModal from './components/RevokeModal.vue';

const loading = ref(false);
const list = ref<QingpuSupplementItem[]>([]);
const filters = reactive({
  keyword: '',
  territory: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined,
  status: undefined as QingpuSupplementStatus | undefined
});

const declareOpen = ref(false);
const editRecord = ref<QingpuSupplementItem | null>(null);
const detailOpen = ref(false);
const detailRecord = ref<QingpuSupplementItem | null>(null);
const revokeOpen = ref(false);
const revokeRecord = ref<QingpuSupplementItem | null>(null);

const canDeclare = computed(() => {
  void currentUserVersion.value;
  return canDeclareQingpuSupplement(getCurrentUser().role);
});

const columns: TableColumnType<QingpuSupplementItem>[] = [
  { title: '项目名称', key: 'projectName', width: 240, ellipsis: true },
  { title: '总投资（万元）', key: 'totalInvestment', width: 130, align: 'right' },
  { title: '项目属地', key: 'territory', width: 110 },
  { title: '责任单位', key: 'responsibleUnits', width: 160, ellipsis: true },
  { title: '申请人', key: 'applicant', width: 90 },
  { title: '申请时间', key: 'submittedAt', width: 170 },
  { title: '申报状态', key: 'status', width: 100 },
  { title: '操作', key: 'operation', width: 200, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    const user = getCurrentUser();
    const channel =
      user.role === 'jingweiAuditor' ? 'jingwei' : user.role === 'fagaiAuditor' ? 'fagai' : undefined;
    list.value = await qingpuSupplementApi.list({
      keyword: filters.keyword || undefined,
      territory: filters.territory,
      responsibleUnit: filters.responsibleUnit,
      status: filters.status,
      applicantId: canViewAllQingpuSupplement(user.role) ? undefined : user.id,
      auditChannel: channel
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

function openEdit(record: QingpuSupplementItem) {
  editRecord.value = record;
  declareOpen.value = true;
}

function openDetail(record: QingpuSupplementItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openRevoke(record: QingpuSupplementItem) {
  revokeRecord.value = record;
  revokeOpen.value = true;
}

function canEdit(record: QingpuSupplementItem) {
  const user = getCurrentUser();
  if (user.role !== 'admin' && !canManageOwnSupplementApplication(user.role, record.applicantId, user.id)) {
    return false;
  }
  return record.status === 'pendingReview' || record.status === 'returned';
}

function canRevoke(record: QingpuSupplementItem) {
  const user = getCurrentUser();
  if (user.role !== 'admin' && !canManageOwnSupplementApplication(user.role, record.applicantId, user.id)) {
    return false;
  }
  return record.status === 'pendingReview' || record.status === 'returned';
}

watch(currentUserVersion, loadList);
onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">项目增补列表</h2>
        <p class="page-desc">
          社会投资由区经委审核专员审核，政府投资/其他由区发改审核专员审核，通过后进入实施库。
        </p>
      </div>
      <a-button v-if="canDeclare" type="primary" @click="openCreate">项目申报</a-button>
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
            show-search
            placeholder="全部"
            style="width: 140px"
            :options="QP_TERRITORY_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="责任单位">
          <a-select
            v-model:value="filters.responsibleUnit"
            allow-clear
            show-search
            placeholder="全部"
            style="width: 160px"
            :options="QP_RESPONSIBLE_UNIT_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="申报状态">
          <a-select
            v-model:value="filters.status"
            allow-clear
            placeholder="全部"
            style="width: 140px"
            :options="QINGPU_SUPPLEMENT_STATUS_OPTIONS"
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
        :scroll="{ x: 1200 }"
        :pagination="{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条` }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'projectName'">
            {{ (row as QingpuSupplementItem).projectName }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ (row as QingpuSupplementItem).totalInvestment ?? '—' }}
          </template>
          <template v-else-if="column.key === 'territory'">
            {{ (row as QingpuSupplementItem).territory }}
          </template>
          <template v-else-if="column.key === 'responsibleUnits'">
            {{ (row as QingpuSupplementItem).responsibleUnits.join('、') }}
          </template>
          <template v-else-if="column.key === 'applicant'">
            {{ (row as QingpuSupplementItem).applicant }}
          </template>
          <template v-else-if="column.key === 'submittedAt'">
            {{ (row as QingpuSupplementItem).submittedAt || '—' }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getQingpuSupplementStatusColor((row as QingpuSupplementItem).status)">
              {{ QINGPU_SUPPLEMENT_STATUS_LABEL[(row as QingpuSupplementItem).status] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as QingpuSupplementItem)">
                详情
              </a-button>
              <a-button
                v-if="canEdit(row as QingpuSupplementItem)"
                type="link"
                size="small"
                @click="openEdit(row as QingpuSupplementItem)"
              >
                修改
              </a-button>
              <a-button
                v-if="canRevoke(row as QingpuSupplementItem)"
                type="link"
                size="small"
                danger
                @click="openRevoke(row as QingpuSupplementItem)"
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
  padding: 0;
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
  color: var(--color-text-secondary);
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
