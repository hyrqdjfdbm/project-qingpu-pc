<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, ref } from 'vue';
import { reservePoolApi } from '@/api/reserve-pool';
import {
  RESERVE_FLOW_STATUS_LABEL,
  RESERVE_MODULE_LABEL,
  getReserveProjectName,
  getReserveResponsibleUnit,
  getReserveStatusColor,
  getReserveTotalInvestment,
  type ReserveProjectItem
} from '@/types/reserve-pool';
import DetailDrawer from '../components/DetailDrawer.vue';
import FinalAuditModal from '../components/FinalAuditModal.vue';
import FirstAuditModal from '../components/FirstAuditModal.vue';

const props = defineProps<{
  /** first=初审（待审核） final=终审（审核中） */
  stage: 'first' | 'final';
}>();

const loading = ref(false);
const list = ref<ReserveProjectItem[]>([]);
const keyword = ref('');
const moduleFilter = ref<string | undefined>();

const detailOpen = ref(false);
const detailRecord = ref<ReserveProjectItem | null>(null);
const firstOpen = ref(false);
const finalOpen = ref(false);
const auditRecord = ref<ReserveProjectItem | null>(null);

const isFirst = computed(() => props.stage === 'first');
const pageTitle = computed(() => (isFirst.value ? '储备库初审' : '储备库终审'));
const pageDesc = computed(() =>
  isFirst.value
    ? '分管领导审核：处理状态为「待审核」的申报单据。同意后进入审核中，驳回则退回申请人。'
    : '片区专员终审：处理状态为「审核中」的申报单据。准予纳入后项目归入对应模块清单。'
);
const actionLabel = computed(() => (isFirst.value ? '初审' : '终审'));

const moduleOptions = Object.entries(RESERVE_MODULE_LABEL).map(([value, label]) => ({
  value,
  label
}));

const filteredList = computed(() => {
  const kw = keyword.value.trim();
  return list.value.filter((item) => {
    if (moduleFilter.value && item.module !== moduleFilter.value) return false;
    if (!kw) return true;
    const name = getReserveProjectName(item);
    const unit = getReserveResponsibleUnit(item);
    return (
      name.includes(kw) ||
      unit.includes(kw) ||
      item.applicant.includes(kw) ||
      item.applicantUnit.includes(kw)
    );
  });
});

const columns: TableColumnType<ReserveProjectItem>[] = [
  { title: '所属模块', key: 'module', width: 160 },
  { title: '责任单位', key: 'responsibleUnit', width: 130 },
  { title: '项目名称', key: 'projectName', width: 200, ellipsis: true },
  { title: '总投资（亿元）', key: 'totalInvestment', width: 120, align: 'right' },
  { title: '申报人', key: 'applicant', width: 90 },
  { title: '申报时间', key: 'submittedAt', width: 160 },
  { title: '流程状态', key: 'status', width: 100 },
  { title: '操作', key: 'operation', width: 180, fixed: 'right' }
];

async function loadList() {
  loading.value = true;
  try {
    list.value = await reservePoolApi.listAuditTodos(
      isFirst.value ? 'pendingReview' : 'reviewing'
    );
  } finally {
    loading.value = false;
  }
}

function openDetail(record: ReserveProjectItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openAudit(record: ReserveProjectItem) {
  auditRecord.value = record;
  if (isFirst.value) {
    firstOpen.value = true;
  } else {
    finalOpen.value = true;
  }
}

onMounted(loadList);
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
        <a-form-item label="所属模块">
          <a-select
            v-model:value="moduleFilter"
            allow-clear
            placeholder="全部模块"
            style="width: 200px"
            :options="moduleOptions"
          />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input
            v-model:value="keyword"
            allow-clear
            placeholder="项目名称 / 责任单位 / 申报人"
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="loadList">刷新</a-button>
        </a-form-item>
      </a-form>

      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="filteredList"
        row-key="id"
        :scroll="{ x: 1100 }"
        :pagination="{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条` }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'module'">
            {{ RESERVE_MODULE_LABEL[(row as ReserveProjectItem).module] }}
          </template>
          <template v-else-if="column.key === 'responsibleUnit'">
            {{ getReserveResponsibleUnit(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'projectName'">
            {{ getReserveProjectName(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ getReserveTotalInvestment(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'applicant'">
            {{ (row as ReserveProjectItem).applicant }}
          </template>
          <template v-else-if="column.key === 'submittedAt'">
            {{ (row as ReserveProjectItem).submittedAt || '—' }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getReserveStatusColor((row as ReserveProjectItem).status)">
              {{ RESERVE_FLOW_STATUS_LABEL[(row as ReserveProjectItem).status] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as ReserveProjectItem)">
                查看详情
              </a-button>
              <a-button type="link" size="small" @click="openAudit(row as ReserveProjectItem)">
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
}
.filter-form {
  row-gap: 8px;
}
</style>
