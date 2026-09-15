<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed } from 'vue';
import type { AuditStatus, ProgressFundProject } from '@/types/progress-fund-report';
import { calcRate } from '@/types/progress-fund-report';
import { getWeekLabel } from '@/types/image-progress-completion';
import AuditStatusCell from './AuditStatusCell.vue';

const props = defineProps<{
  project: ProgressFundProject;
  canFill: boolean;
}>();

const emit = defineEmits<{
  fillMonthly: [];
  fillWeekly: [];
}>();

const year = new Date().getFullYear();

function tagStatus(status?: AuditStatus): AuditStatus {
  return status ?? 'none';
}

const yearTarget = computed(() => props.project.imageYearTarget);
const yearCompleted = computed(() => {
  const months = props.project.imageMonthlyFunds.filter((row) => row.year === year);
  if (!months.length) return undefined;
  return months.reduce((max, row) => Math.max(max, row.cumulativeAmount), 0);
});
const yearRate = computed(() => calcRate(yearCompleted.value, yearTarget.value?.fundTarget));

const monthlyRows = computed(() => {
  const targets = yearTarget.value?.monthlyTargets ?? [];
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const target = targets.find((item) => item.month === month);
    const fund = props.project.imageMonthlyFunds.find((row) => row.year === year && row.month === month);
    return {
      month,
      fundTarget: target?.fundTarget,
      imageTarget: target?.imageProgressTarget,
      completed: fund?.completedAmount,
      cumulative: fund?.cumulativeAmount,
      rate: calcRate(fund?.completedAmount, target?.fundTarget),
      status: tagStatus(fund?.status),
      comment: fund?.auditComment
    };
  });
});

const sortedWeeks = computed(() =>
  [...props.project.imageWeeklyReports].sort((a, b) => b.week - a.week)
);

const monthColumns: TableColumnType[] = [
  { title: '时间', key: 'month', width: 90 },
  { title: '目标（万元）', key: 'fundTarget', width: 120, align: 'right' },
  { title: '完成（万元）', key: 'completed', width: 120, align: 'right' },
  { title: '完成率', key: 'rate', width: 90, align: 'right' },
  { title: '形象进度', key: 'image', ellipsis: true },
  { title: '审核状态', key: 'status', width: 220 }
];

const weekColumns: TableColumnType[] = [
  { title: '周次', key: 'week', width: 220 },
  { title: '完成情况', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '完成比例', key: 'pct', width: 100, align: 'right' },
  { title: '填报人', dataIndex: 'submittedBy', key: 'submittedBy', width: 90 },
  { title: '审核状态', key: 'status', width: 220 }
];
</script>

<template>
  <div>
    <div class="panel-toolbar">
      <span class="panel-title">年度投资进度情况</span>
      <a-button v-if="canFill" @click="emit('fillMonthly')">月度资金完成</a-button>
    </div>
    <a-table
      :pagination="false"
      size="middle"
      row-key="year"
      :data-source="[{ year }]"
      :columns="[
        { title: '年度', dataIndex: 'year', width: 90 },
        { title: '年度计划投资（万元）', key: 'plan', align: 'right' },
        { title: '年度完成投资（万元）', key: 'done', align: 'right' },
        { title: '当前投资完成率', key: 'rate', align: 'right' },
        { title: '年度形象进度目标', key: 'image' },
        { title: '审核状态', key: 'status', width: 220 }
      ]"
    >
      <template #bodyCell="{ column }">
        <template v-if="column.key === 'plan'">
          {{ yearTarget?.fundTarget != null ? yearTarget.fundTarget.toLocaleString() : '—' }}
        </template>
        <template v-else-if="column.key === 'done'">
          {{ yearCompleted != null ? yearCompleted.toLocaleString() : '—' }}
        </template>
        <template v-else-if="column.key === 'rate'">
          {{ yearRate != null ? `${yearRate}%` : '—' }}
        </template>
        <template v-else-if="column.key === 'image'">
          {{ yearTarget?.imageProgressTarget || '—' }}
        </template>
        <template v-else-if="column.key === 'status'">
          <AuditStatusCell :status="yearTarget?.status" :comment="yearTarget?.auditComment" />
        </template>
      </template>
    </a-table>

    <div class="panel-toolbar" style="margin-top: 24px">
      <span class="panel-title">月度完成情况</span>
    </div>
    <a-table :columns="monthColumns" :data-source="monthlyRows" row-key="month" :pagination="false" size="middle">
      <template #bodyCell="{ column, record: row }">
        <template v-if="column.key === 'month'">{{ row.month }}月</template>
        <template v-else-if="column.key === 'fundTarget'">
          {{ row.fundTarget != null ? row.fundTarget.toLocaleString() : '—' }}
        </template>
        <template v-else-if="column.key === 'completed'">
          {{ row.completed != null ? row.completed.toLocaleString() : '—' }}
        </template>
        <template v-else-if="column.key === 'rate'">
          {{ row.rate != null ? `${row.rate}%` : '—' }}
        </template>
        <template v-else-if="column.key === 'image'">
          {{ row.imageTarget || '—' }}
        </template>
        <template v-else-if="column.key === 'status'">
          <AuditStatusCell :status="row.status" :comment="row.comment" />
        </template>
      </template>
    </a-table>

    <div class="panel-toolbar" style="margin-top: 24px">
      <span class="panel-title">周形象进度</span>
      <a-button v-if="canFill" @click="emit('fillWeekly')">周进度完成</a-button>
    </div>
    <a-table
      v-if="sortedWeeks.length"
      :columns="weekColumns"
      :data-source="sortedWeeks"
      row-key="id"
      :pagination="false"
      size="middle"
    >
      <template #bodyCell="{ column, record: row }">
        <template v-if="column.key === 'week'">
          {{ getWeekLabel(row.year, row.week, row.weekStart, row.weekEnd) }}
        </template>
        <template v-else-if="column.key === 'pct'">
          {{ row.progressPercent != null ? `${row.progressPercent}%` : '—' }}
        </template>
        <template v-else-if="column.key === 'status'">
          <AuditStatusCell :status="row.status" :comment="row.auditComment" />
        </template>
      </template>
    </a-table>
    <a-empty v-else description="暂无周进度填报" />
  </div>
</template>

<style scoped>
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
