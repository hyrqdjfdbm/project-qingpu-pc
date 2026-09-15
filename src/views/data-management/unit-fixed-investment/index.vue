<script setup lang="ts">
import { HistoryOutlined } from '@ant-design/icons-vue';
import type { TableColumnType } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, ref, watch } from 'vue';
import { unitFixedInvestmentApi } from '@/api/unit-fixed-investment';
import {
  getCurrentUser,
  isInvestmentMgmtRole
} from '@/mock/current-user';
import {
  isMonthEditable,
  validateAmountWan
} from '@/mock/unit-fixed-investment-store';
import type {
  UnitFixedInvestmentAuditLog,
  UnitFixedInvestmentMatrixRow
} from '@/types/unit-fixed-investment';
import AuditLogDrawer from './components/AuditLogDrawer.vue';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const forbidden = computed(() => !isInvestmentMgmtRole(getCurrentUser().role));

const loading = ref(false);
const savingKey = ref('');
const year = ref(currentYear);
const yearOptions = ref<number[]>([]);
const keyword = ref('');
const matrix = ref<UnitFixedInvestmentMatrixRow[]>([]);

const logOpen = ref(false);
const logLoading = ref(false);
const logs = ref<UnitFixedInvestmentAuditLog[]>([]);

/** 编辑中的单元格 draft */
const drafts = ref<Record<string, string>>({});

function cellKey(unitName: string, month: number) {
  return `${unitName}|${month}`;
}

function formatWan(v?: number) {
  if (v == null) return '';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const monthLabels = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  title: `${i + 1}月`
}));

const filteredMatrix = computed(() => {
  const kw = keyword.value.trim();
  if (!kw) return matrix.value;
  return matrix.value.filter((row) => row.unitName.includes(kw));
});

const tableData = computed(() => {
  const summaryMonths: Record<number, number> = {};
  for (let m = 1; m <= 12; m += 1) summaryMonths[m] = 0;

  filteredMatrix.value.forEach((row) => {
    for (let m = 1; m <= 12; m += 1) {
      summaryMonths[m] += row.months[m] ?? 0;
    }
  });

  const summaryRow: UnitFixedInvestmentMatrixRow & { isSummary?: boolean; unitName: string } = {
    unitName: '合计',
    isSummary: true,
    months: summaryMonths
  };

  return [...filteredMatrix.value, summaryRow];
});

const columns = computed<TableColumnType[]>(() => [
  { title: '责任单位', dataIndex: 'unitName', key: 'unitName', fixed: 'left', width: 140 },
  ...monthLabels.map(({ month, title }) => ({
    title,
    key: `m-${month}`,
    width: 112,
    align: 'right' as const
  }))
]);

type MatrixTableRow = UnitFixedInvestmentMatrixRow & { isSummary?: boolean };

function matrixRow(record: unknown): MatrixTableRow {
  return record as MatrixTableRow;
}

function isSummaryRow(record: MatrixTableRow) {
  return Boolean(record.isSummary);
}

function monthLocked(month: number) {
  return !isMonthEditable(year.value, month);
}

async function loadMatrix() {
  loading.value = true;
  try {
    matrix.value = await unitFixedInvestmentApi.getMatrix(year.value);
    drafts.value = {};
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadYears() {
  yearOptions.value = await unitFixedInvestmentApi.getAllowedYears();
  if (!yearOptions.value.includes(year.value)) {
    year.value = yearOptions.value[0] ?? currentYear;
  }
}

function getDraft(unitName: string, month: number, value?: number) {
  const key = cellKey(unitName, month);
  if (drafts.value[key] != null) return drafts.value[key];
  return value == null ? '' : String(value);
}

function setDraft(unitName: string, month: number, val: string) {
  drafts.value[cellKey(unitName, month)] = val;
}

async function saveCell(unitName: string, month: number, raw: string, prev?: number) {
  const trimmed = raw.trim();
  if (trimmed === '') {
    message.warning('不能删除数据，请填写金额或保留原值');
    drafts.value[cellKey(unitName, month)] = prev == null ? '' : String(prev);
    return;
  }

  const check = validateAmountWan(trimmed);
  if (!check.ok) {
    message.warning(check.message);
    drafts.value[cellKey(unitName, month)] = prev == null ? '' : String(prev);
    return;
  }

  if (prev != null && month > 1) {
    const prevMonthVal = matrix.value.find((r) => r.unitName === unitName)?.months[month - 1];
    if (prevMonthVal != null && check.value < prevMonthVal) {
      message.warning('该月累计小于上月，请确认是否填报有误');
    }
  }

  const key = cellKey(unitName, month);
  savingKey.value = key;
  try {
    await unitFixedInvestmentApi.saveCell(year.value, month, unitName, check.value);
    message.success('已保存');
    await loadMatrix();
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '保存失败');
  } finally {
    savingKey.value = '';
  }
}

async function openLogs() {
  logOpen.value = true;
  logLoading.value = true;
  try {
    logs.value = await unitFixedInvestmentApi.listAuditLogs();
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '加载操作记录失败');
  } finally {
    logLoading.value = false;
  }
}

watch(year, () => {
  loadMatrix();
});

onMounted(async () => {
  if (forbidden.value) return;
  await loadYears();
  await loadMatrix();
});
</script>

<template>
  <div v-if="forbidden" class="forbidden-wrap">
    <a-result status="403" title="无访问权限" sub-title="责任单位固投仅投管科可维护。请切换为投管科角色后重试。" />
  </div>

  <div v-else class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">责任单位固投</h2>
        <p class="page-desc">填写当年 1 月至该月的累计完成固投（万元），保存即生效；未填单位在图表中按 0 展示。</p>
      </div>
    </div>

    <a-card :bordered="false" class="toolbar-card">
      <a-space wrap>
        <span>年份</span>
        <a-select v-model:value="year" style="width: 120px">
          <a-select-option v-for="y in yearOptions" :key="y" :value="y">{{ y }} 年</a-select-option>
        </a-select>
        <a-input
          v-model:value="keyword"
          allow-clear
          placeholder="定位责任单位"
          style="width: 180px"
        />
        <a-button @click="openLogs">
          <template #icon><HistoryOutlined /></template>
          操作记录
        </a-button>
      </a-space>
      <div class="toolbar-hint">不可删除数据，只能修改；当年晚于 {{ currentMonth }} 月的列不可编辑。</div>
    </a-card>

    <a-card :bordered="false" class="table-card">
      <a-spin :spinning="loading">
        <a-table
          :columns="columns"
          :data-source="tableData"
          :pagination="false"
          size="small"
          row-key="unitName"
          :scroll="{ x: 1600, y: 520 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'unitName'">
              <span :class="{ 'cell-summary': isSummaryRow(matrixRow(record)) }">{{ record.unitName }}</span>
            </template>
            <template v-else-if="String(column.key).startsWith('m-')">
              <template v-if="isSummaryRow(matrixRow(record))">
                <span class="cell-summary">
                  {{ formatWan(record.months[Number(String(column.key).slice(2))]) }}
                </span>
              </template>
              <template v-else>
                <template v-if="monthLocked(Number(String(column.key).slice(2)))">
                  <span class="cell-locked">—</span>
                </template>
                <a-input
                  v-else
                  :value="getDraft(record.unitName, Number(String(column.key).slice(2)), record.months[Number(String(column.key).slice(2))])"
                  size="small"
                  :disabled="savingKey === cellKey(record.unitName, Number(String(column.key).slice(2)))"
                  placeholder="—"
                  @update:value="(v: string) => setDraft(record.unitName, Number(String(column.key).slice(2)), v)"
                  @blur="
                    saveCell(
                      record.unitName,
                      Number(String(column.key).slice(2)),
                      getDraft(record.unitName, Number(String(column.key).slice(2)), record.months[Number(String(column.key).slice(2))]),
                      record.months[Number(String(column.key).slice(2))]
                    )
                  "
                />
              </template>
            </template>
          </template>
        </a-table>
      </a-spin>
    </a-card>

    <AuditLogDrawer v-model:open="logOpen" :logs="logs" :loading="logLoading" />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-desc {
  margin: 8px 0 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.toolbar-card {
  margin-bottom: 16px;
}

.toolbar-hint {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.table-card :deep(.ant-input) {
  text-align: right;
}

.cell-summary {
  font-weight: 600;
}

.cell-locked {
  color: rgba(0, 0, 0, 0.25);
}

.forbidden-wrap {
  padding: 48px 0;
}
</style>
