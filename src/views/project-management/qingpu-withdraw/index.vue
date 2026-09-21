<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { qingpuWithdrawApi } from '@/api/qingpu-withdraw';
import {
  canDeclareQingpuWithdraw,
  canManageOwnSupplementApplication,
  canViewAllQingpuWithdraw,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_STATISTICAL_BELONGING_OPTIONS,
  QINGPU_WITHDRAW_STATUS_LABEL,
  QINGPU_WITHDRAW_STATUS_OPTIONS,
  getQingpuWithdrawStatusColor,
  type QingpuWithdrawItem,
  type QingpuWithdrawStatus
} from '@/types/qingpu-withdraw';
import DeclareModal from './components/DeclareModal.vue';
import DetailModal from './components/DetailModal.vue';
import RevokeModal from './components/RevokeModal.vue';

const loading = ref(false);
const list = ref<QingpuWithdrawItem[]>([]);
const filters = reactive({
  keyword: '',
  statisticalBelonging: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined,
  status: undefined as QingpuWithdrawStatus | undefined
});

const declareOpen = ref(false);
const editRecord = ref<QingpuWithdrawItem | null>(null);
const detailOpen = ref(false);
const detailRecord = ref<QingpuWithdrawItem | null>(null);
const revokeOpen = ref(false);
const revokeRecord = ref<QingpuWithdrawItem | null>(null);

const canDeclare = computed(() => {
  void currentUserVersion.value;
  return canDeclareQingpuWithdraw(getCurrentUser().role);
});

const columns: TableColumnType<QingpuWithdrawItem>[] = [
  { title: '项目名称', key: 'projectName', width: 220, ellipsis: true },
  { title: '项目代码', key: 'projectCode', width: 160 },
  { title: '总投资', key: 'totalInvestment', width: 100, align: 'right' },
  { title: '纳统归属', key: 'statisticalBelonging', width: 110 },
  { title: '责任单位', key: 'responsibleUnits', width: 150, ellipsis: true },
  { title: '申请人', key: 'applicant', width: 90 },
  { title: '申请时间', key: 'submittedAt', width: 170 },
  { title: '退库原因', key: 'reason', width: 200, ellipsis: true },
  { title: '退库状态', key: 'status', width: 100 },
  { title: '操作', key: 'operation', width: 200, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    const user = getCurrentUser();
    const channel =
      user.role === 'jingweiAuditor' ? 'jingwei' : user.role === 'fagaiAuditor' ? 'fagai' : undefined;
    list.value = await qingpuWithdrawApi.list({
      keyword: filters.keyword || undefined,
      statisticalBelonging: filters.statisticalBelonging,
      responsibleUnit: filters.responsibleUnit,
      status: filters.status,
      applicantId: canViewAllQingpuWithdraw(user.role) || user.role === 'supervisor' ? undefined : user.id,
      supervisorId: user.role === 'supervisor' ? user.id : undefined,
      auditChannel: channel
    });
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.statisticalBelonging = undefined;
  filters.responsibleUnit = undefined;
  filters.status = undefined;
  loadList();
}

function openCreate() {
  editRecord.value = null;
  declareOpen.value = true;
}

function openEdit(record: QingpuWithdrawItem) {
  editRecord.value = record;
  declareOpen.value = true;
}

function openDetail(record: QingpuWithdrawItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openRevoke(record: QingpuWithdrawItem) {
  revokeRecord.value = record;
  revokeOpen.value = true;
}

function canEdit(record: QingpuWithdrawItem) {
  const user = getCurrentUser();
  if (user.role !== 'admin' && !canManageOwnSupplementApplication(user.role, record.applicantId, user.id)) {
    return false;
  }
  return record.status === 'pendingReview' || record.status === 'returned';
}

function canRevoke(record: QingpuWithdrawItem) {
  const user = getCurrentUser();
  if (user.role !== 'admin' && !canManageOwnSupplementApplication(user.role, record.applicantId, user.id)) {
    return false;
  }
  return (
    record.status === 'pendingReview' ||
    record.status === 'returned'
  );
}

watch(currentUserVersion, loadList);
onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">项目退库申请</h2>
        <p class="page-desc">
          社会投资由区经委审核专员审核，政府投资/其他由区发改审核专员审核；通过后项目进入青浦退库项目库。
        </p>
      </div>
      <a-button v-if="canDeclare" type="primary" @click="openCreate">项目退库</a-button>
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
        <a-form-item label="纳统归属">
          <a-select
            v-model:value="filters.statisticalBelonging"
            allow-clear
            show-search
            placeholder="全部"
            style="width: 140px"
            :options="QP_STATISTICAL_BELONGING_OPTIONS"
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
        <a-form-item label="退库状态">
          <a-select
            v-model:value="filters.status"
            allow-clear
            placeholder="全部"
            style="width: 140px"
            :options="QINGPU_WITHDRAW_STATUS_OPTIONS"
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
        :scroll="{ x: 1500 }"
        :pagination="{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条` }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'projectName'">
            {{ (row as QingpuWithdrawItem).projectName }}
          </template>
          <template v-else-if="column.key === 'projectCode'">
            {{ (row as QingpuWithdrawItem).projectCode }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ (row as QingpuWithdrawItem).totalInvestment ?? '—' }}
          </template>
          <template v-else-if="column.key === 'statisticalBelonging'">
            {{ (row as QingpuWithdrawItem).statisticalBelonging }}
          </template>
          <template v-else-if="column.key === 'responsibleUnits'">
            {{ (row as QingpuWithdrawItem).responsibleUnits.join('、') }}
          </template>
          <template v-else-if="column.key === 'applicant'">
            {{ (row as QingpuWithdrawItem).applicant }}
          </template>
          <template v-else-if="column.key === 'submittedAt'">
            {{ (row as QingpuWithdrawItem).submittedAt }}
          </template>
          <template v-else-if="column.key === 'reason'">
            {{ (row as QingpuWithdrawItem).reason }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getQingpuWithdrawStatusColor((row as QingpuWithdrawItem).status)">
              {{ QINGPU_WITHDRAW_STATUS_LABEL[(row as QingpuWithdrawItem).status] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as QingpuWithdrawItem)">
                详情
              </a-button>
              <a-button
                v-if="canEdit(row as QingpuWithdrawItem)"
                type="link"
                size="small"
                @click="openEdit(row as QingpuWithdrawItem)"
              >
                修改
              </a-button>
              <a-button
                v-if="canRevoke(row as QingpuWithdrawItem)"
                type="link"
                size="small"
                danger
                @click="openRevoke(row as QingpuWithdrawItem)"
              >
                撤销退库
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <DeclareModal v-model:open="declareOpen" :record="editRecord" @saved="loadList" />
    <DetailModal v-model:open="detailOpen" :record="detailRecord" />
    <RevokeModal v-model:open="revokeOpen" :record="revokeRecord" @saved="loadList" />
  </div>
</template>

<style scoped>
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
