<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { qingpuRestoreApi } from '@/api/qingpu-restore';
import {
  canApplyQingpuRestore,
  canManageOwnSupplementApplication,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_STATISTICAL_BELONGING_OPTIONS,
  QINGPU_POOL_RESTORE_FILTER_OPTIONS,
  QINGPU_RESTORE_STATUS_LABEL,
  getQingpuRestoreStatusColor,
  type QingpuRestoreStatus,
  type QingpuWithdrawnProject
} from '@/types/qingpu-restore';
import DetailModal from './components/DetailModal.vue';
import RestoreModal from './components/RestoreModal.vue';
import RevokeRestoreModal from './components/RevokeRestoreModal.vue';

const loading = ref(false);
const list = ref<QingpuWithdrawnProject[]>([]);
const filters = reactive({
  keyword: '',
  statisticalBelonging: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined,
  restoreStatus: undefined as QingpuRestoreStatus | 'none' | undefined
});

const detailOpen = ref(false);
const detailRecord = ref<QingpuWithdrawnProject | null>(null);
const restoreOpen = ref(false);
const restoreRecord = ref<QingpuWithdrawnProject | null>(null);
const revokeOpen = ref(false);
const revokeRecord = ref<QingpuWithdrawnProject | null>(null);

const canApply = computed(() => {
  void currentUserVersion.value;
  return canApplyQingpuRestore(getCurrentUser().role);
});

const columns: TableColumnType<QingpuWithdrawnProject>[] = [
  { title: '项目名称', key: 'projectName', width: 240, ellipsis: true },
  { title: '项目代码', key: 'projectCode', width: 160 },
  { title: '总投资', key: 'totalInvestment', width: 100, align: 'right' },
  { title: '纳统归属', key: 'statisticalBelonging', width: 110 },
  { title: '责任单位', key: 'responsibleUnits', width: 160, ellipsis: true },
  { title: '退库原因', key: 'withdrawReason', width: 200, ellipsis: true },
  { title: '退库时间', key: 'withdrawnAt', width: 170 },
  { title: '恢复状态', key: 'restoreStatus', width: 100 },
  { title: '操作', key: 'operation', width: 220, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    list.value = await qingpuRestoreApi.listPool({
      keyword: filters.keyword || undefined,
      statisticalBelonging: filters.statisticalBelonging,
      responsibleUnit: filters.responsibleUnit,
      restoreStatus: filters.restoreStatus
    });
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.statisticalBelonging = undefined;
  filters.responsibleUnit = undefined;
  filters.restoreStatus = undefined;
  loadList();
}

function openDetail(record: QingpuWithdrawnProject) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function canApplyRecord(record: QingpuWithdrawnProject) {
  if (!canApply.value) return false;
  return !record.restore || record.restore.status === 'returned' || record.restore.status === 'revoked';
}

function canRevokeRecord(record: QingpuWithdrawnProject) {
  const restore = record.restore;
  if (!restore || (restore.status !== 'pendingReview' && restore.status !== 'returned')) {
    return false;
  }
  const user = getCurrentUser();
  if (user.role === 'admin') return true;
  return canManageOwnSupplementApplication(user.role, restore.applicantId, user.id);
}

function openRestore(record: QingpuWithdrawnProject) {
  restoreRecord.value = record;
  restoreOpen.value = true;
}

function openRevoke(record: QingpuWithdrawnProject) {
  revokeRecord.value = record;
  revokeOpen.value = true;
}

watch(currentUserVersion, loadList);
onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">青浦退库项目库</h2>
        <p class="page-desc">
          展示已退库项目。申请恢复后，社会投资由区经委审核专员审核，政府投资/其他由区发改审核专员审核，通过后重新进入实施库。
        </p>
      </div>
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
        <a-form-item label="恢复状态">
          <a-select
            v-model:value="filters.restoreStatus"
            allow-clear
            placeholder="全部"
            style="width: 140px"
            :options="QINGPU_POOL_RESTORE_FILTER_OPTIONS"
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
        row-key="withdrawId"
        :scroll="{ x: 1480 }"
        :pagination="{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条` }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'projectName'">
            {{ (row as QingpuWithdrawnProject).projectName }}
          </template>
          <template v-else-if="column.key === 'projectCode'">
            {{ (row as QingpuWithdrawnProject).projectCode }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ (row as QingpuWithdrawnProject).totalInvestment ?? '—' }}
          </template>
          <template v-else-if="column.key === 'statisticalBelonging'">
            {{ (row as QingpuWithdrawnProject).statisticalBelonging }}
          </template>
          <template v-else-if="column.key === 'responsibleUnits'">
            {{ (row as QingpuWithdrawnProject).responsibleUnits.join('、') }}
          </template>
          <template v-else-if="column.key === 'withdrawReason'">
            {{ (row as QingpuWithdrawnProject).withdrawReason }}
          </template>
          <template v-else-if="column.key === 'withdrawnAt'">
            {{ (row as QingpuWithdrawnProject).withdrawnAt }}
          </template>
          <template v-else-if="column.key === 'restoreStatus'">
            <a-tag
              v-if="(row as QingpuWithdrawnProject).restore"
              :color="getQingpuRestoreStatusColor((row as QingpuWithdrawnProject).restore!.status)"
            >
              {{ QINGPU_RESTORE_STATUS_LABEL[(row as QingpuWithdrawnProject).restore!.status] }}
            </a-tag>
            <span v-else>—</span>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as QingpuWithdrawnProject)">
                详情
              </a-button>
              <a-button
                v-if="canApplyRecord(row as QingpuWithdrawnProject)"
                type="link"
                size="small"
                @click="openRestore(row as QingpuWithdrawnProject)"
              >
                申请恢复
              </a-button>
              <a-button
                v-if="canRevokeRecord(row as QingpuWithdrawnProject)"
                type="link"
                size="small"
                danger
                @click="openRevoke(row as QingpuWithdrawnProject)"
              >
                撤销恢复
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <DetailModal v-model:open="detailOpen" :record="detailRecord" />
    <RestoreModal v-model:open="restoreOpen" :record="restoreRecord" @saved="loadList" />
    <RevokeRestoreModal v-model:open="revokeOpen" :record="revokeRecord" @saved="loadList" />
  </div>
</template>

<style scoped>
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
  color: var(--color-text-secondary);
  font-size: 13px;
  max-width: 760px;
}
.filter-card {
  margin-bottom: 12px;
}
.filter-form {
  row-gap: 8px;
}
</style>
