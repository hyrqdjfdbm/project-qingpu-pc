<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { qingpuWithdrawApi } from '@/api/qingpu-withdraw';
import {
  canAuditQingpuWithdraw,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_STATISTICAL_BELONGING_OPTIONS,
  QINGPU_WITHDRAW_STATUS_LABEL,
  getQingpuWithdrawStatusColor,
  type QingpuWithdrawItem
} from '@/types/qingpu-withdraw';
import type { QingpuAuditChannel } from '@/types/qingpu-supplement';
import AuditModal from './components/AuditModal.vue';

const loading = ref(false);
const list = ref<QingpuWithdrawItem[]>([]);
const filters = reactive({
  keyword: '',
  statisticalBelonging: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined
});

const auditOpen = ref(false);
const auditRecord = ref<QingpuWithdrawItem | null>(null);

const roleChannel = computed<QingpuAuditChannel | undefined>(() => {
  void currentUserVersion.value;
  const role = getCurrentUser().role;
  if (role === 'jingweiAuditor') return 'jingwei';
  if (role === 'fagaiAuditor') return 'fagai';
  return undefined;
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
  { title: '操作', key: 'operation', width: 90, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    const user = getCurrentUser();
    const canSee =
      user.role === 'admin' ||
      user.role === 'jingweiAuditor' ||
      user.role === 'fagaiAuditor' ||
      user.role === 'supervisor';
    if (!canSee) {
      list.value = [];
      return;
    }
    list.value = await qingpuWithdrawApi.listAuditTodos({
      keyword: filters.keyword || undefined,
      statisticalBelonging: filters.statisticalBelonging,
      responsibleUnit: filters.responsibleUnit,
      auditChannel: roleChannel.value,
      supervisorId: user.role === 'supervisor' ? user.id : undefined
    });
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.statisticalBelonging = undefined;
  filters.responsibleUnit = undefined;
  loadList();
}

function openAudit(record: QingpuWithdrawItem) {
  auditRecord.value = record;
  auditOpen.value = true;
}

function canAudit(record: QingpuWithdrawItem) {
  const user = getCurrentUser();
  return canAuditQingpuWithdraw(user.role, record.auditChannel, record.supervisorId, user.id);
}

watch(currentUserVersion, loadList);
onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">退库审核</h2>
        <p class="page-desc">
          区经委审核专员审社会投资项目，区发改审核专员审政府投资/其他项目；分管领导仅看待自己审核的申请。
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
        :scroll="{ x: 1480 }"
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
            <a-button
              v-if="canAudit(row as QingpuWithdrawItem)"
              type="link"
              size="small"
              @click="openAudit(row as QingpuWithdrawItem)"
            >
              审核
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <AuditModal v-model:open="auditOpen" :record="auditRecord" @done="loadList" />
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
  max-width: 720px;
}
.filter-card {
  margin-bottom: 12px;
}
.filter-form {
  row-gap: 8px;
}
</style>
