<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { qingpuRestoreApi } from '@/api/qingpu-restore';
import { canAuditQingpuRestore, currentUserVersion, getCurrentUser } from '@/mock/current-user';
import type { QingpuAuditChannel } from '@/types/qingpu-supplement';
import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_STATISTICAL_BELONGING_OPTIONS,
  type QingpuRestoreItem
} from '@/types/qingpu-restore';
import AuditModal from './components/AuditModal.vue';
import RestoreDetailModal from './components/RestoreDetailModal.vue';

const loading = ref(false);
const list = ref<QingpuRestoreItem[]>([]);
const filters = reactive({
  keyword: '',
  statisticalBelonging: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined
});

const detailOpen = ref(false);
const detailRecord = ref<QingpuRestoreItem | null>(null);
const auditOpen = ref(false);
const auditRecord = ref<QingpuRestoreItem | null>(null);

const roleChannel = computed<QingpuAuditChannel | undefined>(() => {
  void currentUserVersion.value;
  const role = getCurrentUser().role;
  if (role === 'jingweiAuditor') return 'jingwei';
  if (role === 'fagaiAuditor') return 'fagai';
  return undefined;
});

const columns: TableColumnType<QingpuRestoreItem>[] = [
  { title: '项目名称', key: 'projectName', width: 240, ellipsis: true },
  { title: '项目代码', key: 'projectCode', width: 160 },
  { title: '总投资', key: 'totalInvestment', width: 100, align: 'right' },
  { title: '纳统归属', key: 'statisticalBelonging', width: 110 },
  { title: '责任单位', key: 'responsibleUnits', width: 160, ellipsis: true },
  { title: '申请人', key: 'applicant', width: 90 },
  { title: '申请时间', key: 'submittedAt', width: 170 },
  { title: '恢复原因', key: 'restoreReason', width: 200, ellipsis: true },
  { title: '操作', key: 'operation', width: 140, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    const user = getCurrentUser();
    const canSee =
      user.role === 'admin' || user.role === 'jingweiAuditor' || user.role === 'fagaiAuditor';
    if (!canSee) {
      list.value = [];
      return;
    }
    list.value = await qingpuRestoreApi.listAuditTodos({
      keyword: filters.keyword || undefined,
      statisticalBelonging: filters.statisticalBelonging,
      responsibleUnit: filters.responsibleUnit,
      auditChannel: roleChannel.value
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

function canAudit(record: QingpuRestoreItem) {
  return canAuditQingpuRestore(getCurrentUser().role, record.auditChannel);
}

watch(currentUserVersion, loadList);
onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">恢复审核</h2>
        <p class="page-desc">
          社会投资由区经委审核专员审核，政府投资/其他由区发改审核专员审核；通过后项目重新展示在实施库。
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
            {{ (row as QingpuRestoreItem).projectName }}
          </template>
          <template v-else-if="column.key === 'projectCode'">
            {{ (row as QingpuRestoreItem).projectCode }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ (row as QingpuRestoreItem).totalInvestment ?? '—' }}
          </template>
          <template v-else-if="column.key === 'statisticalBelonging'">
            {{ (row as QingpuRestoreItem).statisticalBelonging }}
          </template>
          <template v-else-if="column.key === 'responsibleUnits'">
            {{ (row as QingpuRestoreItem).responsibleUnits.join('、') }}
          </template>
          <template v-else-if="column.key === 'applicant'">
            {{ (row as QingpuRestoreItem).applicant }}
          </template>
          <template v-else-if="column.key === 'submittedAt'">
            {{ (row as QingpuRestoreItem).submittedAt }}
          </template>
          <template v-else-if="column.key === 'restoreReason'">
            {{ (row as QingpuRestoreItem).restoreReason }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="detailRecord = row as QingpuRestoreItem; detailOpen = true">
                详情
              </a-button>
              <a-button
                v-if="canAudit(row as QingpuRestoreItem)"
                type="link"
                size="small"
                @click="auditRecord = row as QingpuRestoreItem; auditOpen = true"
              >
                审核
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <RestoreDetailModal v-model:open="detailOpen" :record="detailRecord" />
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
