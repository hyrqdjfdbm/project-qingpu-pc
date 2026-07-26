<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { supplementLibraryApi } from '@/api/supplement-library';
import {
  canFinalAuditAll,
  canFirstAuditAll,
  getCurrentUser,
  switchRole,
  type AppRole
} from '@/mock/current-user';
import {
  SL_RESPONSIBLE_UNIT_OPTIONS,
  SL_TERRITORY_OPTIONS,
  type SupplementLibraryItem
} from '@/types/supplement-library';
import DetailDrawer from '../components/DetailDrawer.vue';
import FinalAuditModal from '../components/FinalAuditModal.vue';
import FirstAuditModal from '../components/FirstAuditModal.vue';

const props = defineProps<{
  stage: 'first' | 'final';
}>();

const loading = ref(false);
const list = ref<SupplementLibraryItem[]>([]);

const filters = reactive({
  keyword: '',
  territory: undefined as string | undefined,
  responsibleUnit: undefined as string | undefined
});

const detailOpen = ref(false);
const detailRecord = ref<SupplementLibraryItem | null>(null);
const firstOpen = ref(false);
const finalOpen = ref(false);
const auditRecord = ref<SupplementLibraryItem | null>(null);

const isFirst = computed(() => props.stage === 'first');
const pageTitle = computed(() => (isFirst.value ? '增补初审' : '增补终审'));
const pageDesc = computed(() =>
  isFirst.value
    ? '分管领导审核本人待审的增补申报：同意后进入审核中，驳回则退回申请人。'
    : '片区专员终审全部待终审申报：准予纳入后项目进入实施库展示。'
);
const actionLabel = computed(() => (isFirst.value ? '审核' : '审核'));

const columns: TableColumnType<SupplementLibraryItem>[] = [
  { title: '项目名称', key: 'projectName', width: 220, ellipsis: true },
  { title: '项目代码', key: 'projectCode', width: 150 },
  { title: '总投资（万元）', key: 'totalInvestment', width: 120, align: 'right' },
  { title: '项目属地', key: 'territory', width: 110 },
  { title: '责任单位', key: 'responsibleUnits', width: 140, ellipsis: true },
  { title: '申请人', key: 'applicant', width: 90 },
  { title: '申请时间', key: 'submittedAt', width: 160 },
  { title: '操作', key: 'operation', width: 160, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    const user = getCurrentUser();
    const base = {
      keyword: filters.keyword || undefined,
      territory: filters.territory,
      responsibleUnit: filters.responsibleUnit
    };
    if (isFirst.value) {
      list.value = await supplementLibraryApi.listAuditTodos('pendingReview', {
        ...base,
        supervisorId: canFirstAuditAll(user.role) ? undefined : user.id
      });
    } else if (!canFinalAuditAll(user.role)) {
      list.value = [];
    } else {
      list.value = await supplementLibraryApi.listAuditTodos('reviewing', base);
    }
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

const emptyHint = computed(() => {
  if (loading.value || list.value.length) return '';
  if (isFirst.value) {
    return '暂无待初审数据。可先在「项目增补」提交一条新申报后再来审核。';
  }
  return '暂无待终审数据。请先完成一条初审通过（状态变为审核中）的记录。';
});

function openDetail(record: SupplementLibraryItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openAudit(record: SupplementLibraryItem) {
  auditRecord.value = record;
  if (isFirst.value) firstOpen.value = true;
  else finalOpen.value = true;
}

onMounted(() => {
  const target: AppRole = isFirst.value ? 'supervisor' : 'districtSpecialist';
  switchRole(target);
  loadList();
});
</script>

<template>
  <div class="audit-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ pageTitle }}</h2>
        <p class="page-desc">{{ pageDesc }}</p>
      </div>
    </div>

    <a-card :bordered="false">
      <a-form layout="inline" class="filter-form" style="margin-bottom: 12px">
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
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="loadList">查询</a-button>
            <a-button @click="resetFilters">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-alert
        v-if="emptyHint"
        type="info"
        show-icon
        style="margin-bottom: 12px"
        :message="emptyHint"
      />

      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="list"
        row-key="id"
        :scroll="{ x: 1100 }"
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
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as SupplementLibraryItem)">
                详情
              </a-button>
              <a-button type="link" size="small" @click="openAudit(row as SupplementLibraryItem)">
                {{ actionLabel }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <DetailDrawer v-model:open="detailOpen" :record="detailRecord" />
    <FirstAuditModal v-model:open="firstOpen" :record="auditRecord" @done="loadList" />
    <FinalAuditModal v-model:open="finalOpen" :record="auditRecord" @done="loadList" />
  </div>
</template>

<style scoped>
.audit-page {
  padding: 16px 20px 24px;
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
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  max-width: 760px;
}
</style>
