<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { qingpuSupplementApi } from '@/api/qingpu-supplement';
import {
  canAuditQingpuSupplement,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import {
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_TERRITORY_OPTIONS,
  type QingpuAuditChannel,
  type QingpuSupplementItem
} from '@/types/qingpu-supplement';
import AuditModal from './components/AuditModal.vue';
import DetailDrawer from './components/DetailDrawer.vue';

const loading = ref(false);
const list = ref<QingpuSupplementItem[]>([]);
const filters = reactive({
  keyword: '',
  territory: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined
});

const detailOpen = ref(false);
const detailRecord = ref<QingpuSupplementItem | null>(null);
const auditOpen = ref(false);
const auditRecord = ref<QingpuSupplementItem | null>(null);

const roleChannel = computed<QingpuAuditChannel | undefined>(() => {
  void currentUserVersion.value;
  const role = getCurrentUser().role;
  if (role === 'jingweiAuditor') return 'jingwei';
  if (role === 'fagaiAuditor') return 'fagai';
  return undefined;
});

const columns: TableColumnType<QingpuSupplementItem>[] = [
  { title: '项目名称', key: 'projectName', width: 240, ellipsis: true },
  { title: '项目代码', key: 'projectCode', width: 150 },
  { title: '总投资（万元）', key: 'totalInvestment', width: 130, align: 'right' },
  { title: '项目属地', key: 'territory', width: 110 },
  { title: '责任单位', key: 'responsibleUnits', width: 160, ellipsis: true },
  { title: '申请人', key: 'applicant', width: 90 },
  { title: '申请时间', key: 'submittedAt', width: 170 },
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
    list.value = await qingpuSupplementApi.listAuditTodos({
      keyword: filters.keyword || undefined,
      territory: filters.territory,
      responsibleUnit: filters.responsibleUnit,
      auditChannel: roleChannel.value
    });
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.territory = undefined;
  filters.responsibleUnit = undefined;
  loadList();
}

function openDetail(record: QingpuSupplementItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openAudit(record: QingpuSupplementItem) {
  auditRecord.value = record;
  auditOpen.value = true;
}

function canAudit(record: QingpuSupplementItem) {
  const user = getCurrentUser();
  return canAuditQingpuSupplement(user.role, record.auditChannel);
}

watch(currentUserVersion, loadList);
onMounted(loadList);
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">增补审核</h2>
        <p class="page-desc">
          区经委审核专员审社会投资项目，区发改审核专员审政府投资/其他项目；通过后项目进入实施库展示。
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
        :scroll="{ x: 1260 }"
        :pagination="{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条` }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'projectName'">
            {{ (row as QingpuSupplementItem).projectName }}
          </template>
          <template v-else-if="column.key === 'projectCode'">
            {{ (row as QingpuSupplementItem).projectCode || '—' }}
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
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as QingpuSupplementItem)">
                详情
              </a-button>
              <a-button
                v-if="canAudit(row as QingpuSupplementItem)"
                type="link"
                size="small"
                @click="openAudit(row as QingpuSupplementItem)"
              >
                审核
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <DetailDrawer v-model:open="detailOpen" :record="detailRecord" />
    <AuditModal v-model:open="auditOpen" :record="auditRecord" @done="loadList" />
  </div>
</template>

<style scoped>
.page {
  padding: 0;
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
