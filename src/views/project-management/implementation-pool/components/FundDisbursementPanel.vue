<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, ref } from 'vue';
import type { ProgressFundProject, SuperiorPolicyKey } from '@/types/progress-fund-report';
import {
  calcRate,
  latestWeekly,
  SUPERIOR_POLICY_LABEL
} from '@/types/progress-fund-report';
import { getWeekLabel } from '@/types/image-progress-completion';
import AuditStatusCell from './AuditStatusCell.vue';

const props = defineProps<{
  project: ProgressFundProject;
  canFill: boolean;
}>();

const emit = defineEmits<{
  fillWeekly: [];
}>();

const policyTab = ref<SuperiorPolicyKey>('specialBond');
const year = new Date().getFullYear();

const pack = computed(() => props.project.superior[policyTab.value]);
const yearTarget = computed(() => pack.value.yearTarget);
const latestWeek = computed(() => latestWeekly(pack.value.weeklyReports, year));
const issued = computed(() => yearTarget.value?.annualTarget);
const paid = computed(() => latestWeek.value?.cumulativeAmount);
const payRate = computed(() => calcRate(paid.value, issued.value));

const monthRows = computed(() => {
  const targets = yearTarget.value?.monthlyTargets ?? [];
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      target: targets.find((item) => item.month === month)?.target
    };
  });
});

const weekRows = computed(() => [...pack.value.weeklyReports].sort((a, b) => b.week - a.week));

const monthColumns: TableColumnType[] = [
  { title: '时间', key: 'month', width: 90 },
  { title: '目标（万元）', key: 'target', align: 'right' },
  { title: '完成（万元）', key: 'done', align: 'right' },
  { title: '完成率', key: 'rate', align: 'right' }
];

const weekColumns: TableColumnType[] = [
  { title: '周次', key: 'week', width: 220 },
  { title: '本周完成（万元）', key: 'completed', width: 140, align: 'right' },
  { title: '累计完成（万元）', key: 'cumulative', width: 140, align: 'right' },
  { title: '填报人', dataIndex: 'submittedBy', key: 'submittedBy', width: 90 },
  { title: '审核状态', key: 'status', width: 220 }
];
</script>

<template>
  <div>
    <a-tabs v-model:activeKey="policyTab" size="small">
      <a-tab-pane v-for="(label, key) in SUPERIOR_POLICY_LABEL" :key="key" :tab="label" />
    </a-tabs>

    <a-row :gutter="[12, 12]" class="stat-row">
      <a-col :xs="12" :md="8" :xl="4">
        <a-card size="small" :bordered="false" class="stat-card">
          <a-statistic title="累计下达资金（万元）" :value="issued ?? 0" :precision="0" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="8" :xl="4">
        <a-card size="small" :bordered="false" class="stat-card">
          <a-statistic title="累计支付金额（万元）" :value="paid ?? 0" :precision="0" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="8" :xl="4">
        <a-card size="small" :bordered="false" class="stat-card">
          <a-statistic title="累计支付率" :value="payRate ?? 0" suffix="%" :precision="2" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="8" :xl="4">
        <a-card size="small" :bordered="false" class="stat-card stat-card--year">
          <a-statistic title="当年下达资金（万元）" :value="issued ?? 0" :precision="0" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="8" :xl="4">
        <a-card size="small" :bordered="false" class="stat-card stat-card--year">
          <a-statistic title="当年年度支付金额（万元）" :value="paid ?? 0" :precision="0" />
        </a-card>
      </a-col>
      <a-col :xs="12" :md="8" :xl="4">
        <a-card size="small" :bordered="false" class="stat-card stat-card--year">
          <a-statistic title="当年支付率" :value="payRate ?? 0" suffix="%" :precision="2" />
        </a-card>
      </a-col>
    </a-row>

    <div class="panel-toolbar">
      <span class="panel-title">年度资金支付情况</span>
    </div>
    <a-table
      :pagination="false"
      size="middle"
      row-key="year"
      :data-source="[{ year }]"
      :columns="[
        { title: '年度', key: 'year', width: 110 },
        { title: '年度下达资金（万元）', key: 'issued', align: 'right' },
        { title: '年度完成投资（万元）', key: 'paid', align: 'right' },
        { title: '当年预调完成率', key: 'rate', align: 'right' },
        { title: '审核状态', key: 'status', width: 220 }
      ]"
    >
      <template #bodyCell="{ column }">
        <template v-if="column.key === 'year'">{{ year }}年</template>
        <template v-else-if="column.key === 'issued'">
          {{ issued != null ? issued.toLocaleString() : '—' }}
        </template>
        <template v-else-if="column.key === 'paid'">
          {{ paid != null ? paid.toLocaleString() : '—' }}
        </template>
        <template v-else-if="column.key === 'rate'">
          {{ payRate != null ? `${payRate}%` : '—' }}
        </template>
        <template v-else-if="column.key === 'status'">
          <AuditStatusCell :status="yearTarget?.status" :comment="yearTarget?.auditComment" />
        </template>
      </template>
    </a-table>

    <div class="panel-toolbar" style="margin-top: 24px">
      <span class="panel-title">月度资金支付计划</span>
    </div>
    <a-table :columns="monthColumns" :data-source="monthRows" row-key="month" :pagination="false" size="middle">
      <template #bodyCell="{ column, record: row }">
        <template v-if="column.key === 'month'">{{ row.month }}月</template>
        <template v-else-if="column.key === 'target'">
          {{ row.target != null ? row.target.toLocaleString() : '—' }}
        </template>
        <template v-else-if="column.key === 'done'">—</template>
        <template v-else-if="column.key === 'rate'">—</template>
      </template>
    </a-table>

    <div class="panel-toolbar" style="margin-top: 24px">
      <span class="panel-title">周资金完成</span>
      <a-button v-if="canFill" @click="emit('fillWeekly')">周资金完成</a-button>
    </div>
    <a-table
      v-if="weekRows.length"
      :columns="weekColumns"
      :data-source="weekRows"
      row-key="id"
      :pagination="false"
      size="middle"
    >
      <template #bodyCell="{ column, record: row }">
        <template v-if="column.key === 'week'">
          {{ getWeekLabel(row.year, row.week, row.weekStart, row.weekEnd) }}
        </template>
        <template v-else-if="column.key === 'completed'">
          {{ row.completedAmount.toLocaleString() }}
        </template>
        <template v-else-if="column.key === 'cumulative'">
          {{ row.cumulativeAmount.toLocaleString() }}
        </template>
        <template v-else-if="column.key === 'status'">
          <AuditStatusCell :status="row.status" :comment="row.auditComment" />
        </template>
      </template>
    </a-table>
    <a-empty v-else description="暂无周资金填报" />
  </div>
</template>

<style scoped>
.stat-row {
  margin-bottom: 20px;
}
.stat-card {
  background: var(--color-bg-layout, #f5f5f5);
}
.stat-card--year {
  background: var(--color-primary-bg, #e6f4ff);
}
.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.panel-title {
  font-weight: 600;
}
</style>
