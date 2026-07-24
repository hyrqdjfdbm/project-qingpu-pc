<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { reservePoolApi } from '@/api/reserve-pool';
import {
  DEPT_CATEGORY_LABEL,
  DEPT_CATEGORY_OPTIONS,
  INVEST_TYPE_LABEL,
  POLICY_CATEGORY_LABEL,
  POLICY_CATEGORY_OPTIONS,
  RESERVE_DOMAIN_LABEL,
  RESERVE_DOMAIN_OPTIONS,
  RESERVE_FLOW_FILTER_OPTIONS,
  RESERVE_FLOW_STATUS_LABEL,
  RESERVE_MODULE_LABEL,
  RESERVE_UNIT_OPTIONS,
  SIX_NET_LABEL,
  getLatestProgress,
  getReserveProjectName,
  getReserveResponsibleUnit,
  getReserveStatusColor,
  getReserveTotalInvestment,
  type DeptProjectCategory,
  type PolicyCategory,
  type ReserveDomain,
  type ReserveFlowStatus,
  type ReserveModule,
  type ReserveProjectItem
} from '@/types/reserve-pool';
import DeclareModal from './DeclareModal.vue';
import DetailDrawer from './DetailDrawer.vue';
import ProgressHistoryDrawer from './ProgressHistoryDrawer.vue';
import ProgressReportModal from './ProgressReportModal.vue';
import RevokeModal from './RevokeModal.vue';

const props = defineProps<{
  module: ReserveModule;
}>();

const loading = ref(false);
const list = ref<ReserveProjectItem[]>([]);

const filters = reactive({
  projectName: '',
  responsibleUnit: undefined as string | undefined,
  status: undefined as ReserveFlowStatus | undefined,
  domain: undefined as ReserveDomain | undefined,
  leadUnit: undefined as string | undefined,
  projectCategory: undefined as DeptProjectCategory | undefined,
  policyCategory: undefined as PolicyCategory | undefined,
  isSixNet: undefined as number | undefined,
  hasStarted: undefined as number | undefined
});

const declareOpen = ref(false);
const declareMode = ref<'create' | 'edit'>('create');
const editing = ref<ReserveProjectItem | null>(null);
const detailOpen = ref(false);
const detailRecord = ref<ReserveProjectItem | null>(null);
const progressOpen = ref(false);
const progressRecord = ref<ReserveProjectItem | null>(null);
const historyOpen = ref(false);
const historyRecord = ref<ReserveProjectItem | null>(null);
const revokeOpen = ref(false);
const revokeRecord = ref<ReserveProjectItem | null>(null);

const moduleTitle = computed(() => RESERVE_MODULE_LABEL[props.module]);
const statusOptions = RESERVE_FLOW_FILTER_OPTIONS;

const columns = computed<TableColumnType<ReserveProjectItem>[]>(() => {
  const m = props.module;
  const cols: TableColumnType<ReserveProjectItem>[] = [];

  if (m === 'partySchool') {
    cols.push(
      { title: '牵头单位', key: 'leadUnit', width: 120 },
      { title: '责任单位', key: 'responsibleUnit', width: 120 },
      { title: '领域', key: 'domain', width: 90 },
      { title: '项目名称', key: 'projectName', width: 180, ellipsis: true },
      { title: '建设地点', key: 'location', width: 140, ellipsis: true },
      { title: '起止年限', key: 'yearRange', width: 110 },
      { title: '总投资（亿元）', key: 'totalInvestment', width: 120, align: 'right' },
      { title: '2027计划投资', key: 'planInvest', width: 120, align: 'right' },
      { title: '计划开工', key: 'plannedStart', width: 100 },
      { title: '投资类型', key: 'investType', width: 130 }
    );
  } else if (m === 'department') {
    cols.push(
      { title: '责任单位', key: 'responsibleUnit', width: 120 },
      { title: '项目类别', key: 'projectCategory', width: 120 },
      { title: '项目名称', key: 'projectName', width: 180, ellipsis: true },
      { title: '项目内容', key: 'content', width: 180, ellipsis: true },
      { title: '预计开工', key: 'plannedStart', width: 100 },
      { title: '总投资（亿元）', key: 'totalInvestment', width: 120, align: 'right' },
      { title: '2027计划投资', key: 'planInvest', width: 120, align: 'right' }
    );
  } else if (m === 'township') {
    cols.push(
      { title: '责任单位', key: 'responsibleUnit', width: 120 },
      { title: '项目名称', key: 'projectName', width: 180, ellipsis: true },
      { title: '建设内容', key: 'content', width: 180, ellipsis: true },
      { title: '总投资（亿元）', key: 'totalInvestment', width: 120, align: 'right' },
      { title: '2027计划投资', key: 'planInvest', width: 120, align: 'right' },
      { title: '计划开工时间', key: 'plannedStart', width: 110 },
      { title: '资金拼盘情况', key: 'fundMix', width: 140, ellipsis: true },
      { title: '运营模式', key: 'operationMode', width: 110 },
      { title: '用地情况', key: 'landStatus', width: 140, ellipsis: true },
      { title: '备注', key: 'remark', width: 120, ellipsis: true }
    );
  } else if (m === 'arena') {
    cols.push(
      { title: '责任单位', key: 'responsibleUnit', width: 120 },
      { title: '项目名称', key: 'projectName', width: 180, ellipsis: true },
      { title: '建设内容', key: 'content', width: 180, ellipsis: true },
      { title: '总投资（亿元）', key: 'totalInvestment', width: 120, align: 'right' },
      { title: '2026计划投资', key: 'planInvest', width: 120, align: 'right' },
      { title: '计划开工时间', key: 'plannedStart', width: 110 },
      { title: '是否已开工', key: 'hasStarted', width: 100 },
      { title: '开工时间', key: 'actualStart', width: 110 }
    );
  } else {
    cols.push(
      { title: '责任单位', key: 'responsibleUnit', width: 120 },
      { title: '项目名称', key: 'projectName', width: 180, ellipsis: true },
      { title: '建设内容', key: 'content', width: 180, ellipsis: true },
      { title: '总投资（亿元）', key: 'totalInvestment', width: 120, align: 'right' },
      { title: '政策类别', key: 'policy', width: 130 },
      { title: '六网项目', key: 'sixNet', width: 140, ellipsis: true },
      { title: '要素资金（亿元）', key: 'elementFund', width: 130, align: 'right' }
    );
  }

  cols.push(
    { title: '当前进度', key: 'currentProgress', width: 160, ellipsis: true },
    { title: '下步计划', key: 'nextPlan', width: 160, ellipsis: true },
    { title: '流程状态', key: 'status', width: 100 },
    { title: '操作', key: 'operation', width: 300, fixed: 'right' }
  );
  return cols;
});

function sixNetText(item: ReserveProjectItem) {
  const el = item.element;
  if (!el) return '—';
  if (!el.isSixNet) return '否';
  return el.sixNetTypes.map((t) => SIX_NET_LABEL[t]).join('、') || '是';
}

function policyText(item: ReserveProjectItem) {
  const el = item.element;
  if (!el) return '—';
  if (el.policyCategory === 'other') return el.policyCategoryOther || '其他';
  return POLICY_CATEGORY_LABEL[el.policyCategory];
}

function categoryText(item: ReserveProjectItem) {
  const d = item.department;
  if (!d) return '—';
  if (d.projectCategory === 'other') return d.projectCategoryOther || '其他';
  return DEPT_CATEGORY_LABEL[d.projectCategory];
}

function investTypeText(item: ReserveProjectItem) {
  const p = item.partySchool;
  if (!p) return '—';
  if (p.investType === 'other') return p.investTypeOther || '其他';
  return INVEST_TYPE_LABEL[p.investType];
}

async function loadList() {
  loading.value = true;
  try {
    list.value = await reservePoolApi.list({
      module: props.module,
      projectName: filters.projectName || undefined,
      responsibleUnit: filters.responsibleUnit,
      status: filters.status,
      domain: filters.domain,
      leadUnit: filters.leadUnit,
      projectCategory: filters.projectCategory,
      policyCategory: filters.policyCategory,
      isSixNet: filters.isSixNet === undefined ? undefined : filters.isSixNet === 1,
      hasStarted: filters.hasStarted === undefined ? undefined : filters.hasStarted === 1
    });
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.projectName = '';
  filters.responsibleUnit = undefined;
  filters.status = undefined;
  filters.domain = undefined;
  filters.leadUnit = undefined;
  filters.projectCategory = undefined;
  filters.policyCategory = undefined;
  filters.isSixNet = undefined;
  filters.hasStarted = undefined;
  loadList();
}

function openCreate() {
  declareMode.value = 'create';
  editing.value = null;
  declareOpen.value = true;
}

function openEdit(record: ReserveProjectItem) {
  declareMode.value = 'edit';
  editing.value = record;
  declareOpen.value = true;
}

function openDetail(record: ReserveProjectItem) {
  detailRecord.value = record;
  detailOpen.value = true;
}

function openProgress(record: ReserveProjectItem) {
  progressRecord.value = record;
  progressOpen.value = true;
}

function openHistory(record: ReserveProjectItem) {
  historyRecord.value = record;
  historyOpen.value = true;
}

function openRevoke(record: ReserveProjectItem) {
  revokeRecord.value = record;
  revokeOpen.value = true;
}

function canEdit(record: ReserveProjectItem) {
  return record.status === 'pendingReview' || record.status === 'returned';
}

function canRevoke(record: ReserveProjectItem) {
  return record.status === 'pendingReview';
}

function canReportProgress(record: ReserveProjectItem) {
  return record.status === 'delisted';
}

watch(
  () => props.module,
  () => resetFilters()
);

onMounted(loadList);
</script>

<template>
  <div class="reserve-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">{{ moduleTitle }}</h2>
        <p class="page-desc">
          操作按状态展示：详情（全部）；修改（待审核、退回）；撤销申请（待审核）；填报进度 / 进度历史（已入库）。审批请前往「储备库审核」。
        </p>
      </div>
      <a-button type="primary" @click="openCreate">项目申报</a-button>
    </div>

    <a-card class="filter-card" :bordered="false">
      <a-form layout="inline" class="filter-form">
        <a-form-item v-if="module === 'partySchool'" label="牵头单位">
          <a-select
            v-model:value="filters.leadUnit"
            allow-clear
            show-search
            placeholder="全部"
            style="width: 150px"
            :options="RESERVE_UNIT_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="责任单位">
          <a-select
            v-model:value="filters.responsibleUnit"
            allow-clear
            show-search
            placeholder="全部"
            style="width: 150px"
            :options="RESERVE_UNIT_OPTIONS"
          />
        </a-form-item>
        <a-form-item label="项目名称">
          <a-input v-model:value="filters.projectName" allow-clear placeholder="项目名称" style="width: 160px" />
        </a-form-item>
        <a-form-item v-if="module === 'partySchool'" label="领域">
          <a-select
            v-model:value="filters.domain"
            allow-clear
            placeholder="全部"
            style="width: 120px"
            :options="RESERVE_DOMAIN_OPTIONS"
          />
        </a-form-item>
        <a-form-item v-if="module === 'department'" label="项目类别">
          <a-select
            v-model:value="filters.projectCategory"
            allow-clear
            show-search
            placeholder="全部"
            style="width: 150px"
            :options="DEPT_CATEGORY_OPTIONS"
          />
        </a-form-item>
        <a-form-item v-if="module === 'element'" label="政策类别">
          <a-select
            v-model:value="filters.policyCategory"
            allow-clear
            placeholder="全部"
            style="width: 150px"
            :options="POLICY_CATEGORY_OPTIONS"
          />
        </a-form-item>
        <a-form-item v-if="module === 'element'" label="是否六网">
          <a-select
            v-model:value="filters.isSixNet"
            allow-clear
            placeholder="全部"
            style="width: 100px"
            :options="[
              { value: 1, label: '是' },
              { value: 0, label: '否' }
            ]"
          />
        </a-form-item>
        <a-form-item v-if="module === 'arena'" label="是否已开工">
          <a-select
            v-model:value="filters.hasStarted"
            allow-clear
            placeholder="全部"
            style="width: 100px"
            :options="[
              { value: 1, label: '是' },
              { value: 0, label: '否' }
            ]"
          />
        </a-form-item>
        <a-form-item label="流程状态">
          <a-select
            v-model:value="filters.status"
            allow-clear
            placeholder="全部"
            style="width: 120px"
            :options="statusOptions"
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
          <template v-if="column.key === 'leadUnit'">
            {{ (row as ReserveProjectItem).partySchool?.leadUnit || '—' }}
          </template>
          <template v-else-if="column.key === 'responsibleUnit'">
            {{ getReserveResponsibleUnit(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'domain'">
            {{
              (row as ReserveProjectItem).partySchool
                ? RESERVE_DOMAIN_LABEL[(row as ReserveProjectItem).partySchool!.domain]
                : '—'
            }}
          </template>
          <template v-else-if="column.key === 'projectName'">
            {{ getReserveProjectName(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'location'">
            {{ (row as ReserveProjectItem).partySchool?.location || '—' }}
          </template>
          <template v-else-if="column.key === 'yearRange'">
            {{
              (row as ReserveProjectItem).partySchool
                ? `${(row as ReserveProjectItem).partySchool!.startYear}-${(row as ReserveProjectItem).partySchool!.endYear}`
                : '—'
            }}
          </template>
          <template v-else-if="column.key === 'totalInvestment'">
            {{ getReserveTotalInvestment(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'planInvest'">
            {{
              (row as ReserveProjectItem).partySchool?.planInvest2027 ??
              (row as ReserveProjectItem).department?.planInvest2027 ??
              (row as ReserveProjectItem).township?.planInvest2027 ??
              (row as ReserveProjectItem).arena?.planInvest2026 ??
              '—'
            }}
          </template>
          <template v-else-if="column.key === 'plannedStart'">
            {{
              (row as ReserveProjectItem).partySchool?.plannedStartDate ||
              (row as ReserveProjectItem).department?.plannedStartDate ||
              (row as ReserveProjectItem).township?.plannedStartDate ||
              (row as ReserveProjectItem).arena?.plannedStartDate ||
              '—'
            }}
          </template>
          <template v-else-if="column.key === 'investType'">
            {{ investTypeText(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'projectCategory'">
            {{ categoryText(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'content'">
            {{
              (row as ReserveProjectItem).department?.projectContent ||
              (row as ReserveProjectItem).township?.constructionContent ||
              (row as ReserveProjectItem).arena?.constructionContent ||
              (row as ReserveProjectItem).element?.constructionContent ||
              '—'
            }}
          </template>
          <template v-else-if="column.key === 'fundMix'">
            {{ (row as ReserveProjectItem).township?.fundMix || '—' }}
          </template>
          <template v-else-if="column.key === 'operationMode'">
            {{ (row as ReserveProjectItem).township?.operationMode || '—' }}
          </template>
          <template v-else-if="column.key === 'landStatus'">
            {{ (row as ReserveProjectItem).township?.landStatus || '—' }}
          </template>
          <template v-else-if="column.key === 'remark'">
            {{
              (row as ReserveProjectItem).township?.remark ||
              (row as ReserveProjectItem).partySchool?.remark ||
              (row as ReserveProjectItem).department?.remark ||
              (row as ReserveProjectItem).arena?.remark ||
              (row as ReserveProjectItem).element?.remark ||
              '—'
            }}
          </template>
          <template v-else-if="column.key === 'hasStarted'">
            {{ (row as ReserveProjectItem).arena?.hasStarted ? '是' : '否' }}
          </template>
          <template v-else-if="column.key === 'actualStart'">
            {{ (row as ReserveProjectItem).arena?.actualStartDate || '—' }}
          </template>
          <template v-else-if="column.key === 'policy'">
            {{ policyText(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'sixNet'">
            {{ sixNetText(row as ReserveProjectItem) }}
          </template>
          <template v-else-if="column.key === 'elementFund'">
            {{ (row as ReserveProjectItem).element?.elementFund ?? '—' }}
          </template>
          <template v-else-if="column.key === 'currentProgress'">
            {{ getLatestProgress(row as ReserveProjectItem)?.currentProgress || '—' }}
          </template>
          <template v-else-if="column.key === 'nextPlan'">
            {{ getLatestProgress(row as ReserveProjectItem)?.nextPlan || '—' }}
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getReserveStatusColor((row as ReserveProjectItem).status)">
              {{ RESERVE_FLOW_STATUS_LABEL[(row as ReserveProjectItem).status] }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space>
              <a-button type="link" size="small" @click="openDetail(row as ReserveProjectItem)">详情</a-button>
              <a-button
                v-if="canEdit(row as ReserveProjectItem)"
                type="link"
                size="small"
                @click="openEdit(row as ReserveProjectItem)"
              >
                修改
              </a-button>
              <a-button
                v-if="canRevoke(row as ReserveProjectItem)"
                type="link"
                size="small"
                danger
                @click="openRevoke(row as ReserveProjectItem)"
              >
                撤销申请
              </a-button>
              <a-button
                v-if="canReportProgress(row as ReserveProjectItem)"
                type="link"
                size="small"
                @click="openProgress(row as ReserveProjectItem)"
              >
                填报进度
              </a-button>
              <a-button
                v-if="canReportProgress(row as ReserveProjectItem)"
                type="link"
                size="small"
                @click="openHistory(row as ReserveProjectItem)"
              >
                进度历史
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <DeclareModal
      v-model:open="declareOpen"
      :module="module"
      :mode="declareMode"
      :record="editing"
      @saved="loadList"
    />
    <DetailDrawer v-model:open="detailOpen" :record="detailRecord" />
    <ProgressReportModal v-model:open="progressOpen" :record="progressRecord" @saved="loadList" />
    <ProgressHistoryDrawer v-model:open="historyOpen" :record="historyRecord" />
    <RevokeModal v-model:open="revokeOpen" :record="revokeRecord" @saved="loadList" />
  </div>
</template>

<style scoped>
.reserve-page {
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
