<script setup lang="ts">
import { computed } from 'vue';
import { getDailyStaffDateRange } from '@/mock/work-suspend-store';
import {
  HOLIDAY_TYPE_LABEL,
  WORK_SUSPEND_STATUS_LABEL,
  type WorkSuspendItem
} from '@/types/work-suspend';

const props = defineProps<{
  open: boolean;
  record: WorkSuspendItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const historyRows = computed(() => {
  const record = props.record;
  if (!record) return [];
  if (record.dailyStaff?.length) {
    return [...record.dailyStaff].sort((a, b) => a.date.localeCompare(b.date));
  }
  return [];
});

const expectedRange = computed(() => {
  if (!props.record) return null;
  return getDailyStaffDateRange(props.record);
});

function close() {
  emit('update:open', false);
}

function yn(v: boolean | undefined) {
  if (v === undefined) return '—';
  return v ? '是' : '否';
}
</script>

<template>
  <a-drawer :open="open" title="停复工详情" :width="720" destroy-on-close @close="close">
    <template v-if="record">
      <div style="margin-bottom: 12px; color: rgba(0, 0, 0, 0.65)">
        {{ record.year }}年{{ HOLIDAY_TYPE_LABEL[record.holiday] }} ·
        {{ WORK_SUSPEND_STATUS_LABEL[record.status] }}
      </div>

      <a-descriptions title="项目信息" bordered size="small" :column="2">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目编码">{{ record.projectCode }}</a-descriptions-item>
        <a-descriptions-item label="责任单位">{{ record.responsibleUnit }}</a-descriptions-item>
        <a-descriptions-item label="建设地点" :span="2">{{ record.location }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="停工情况" bordered size="small" :column="2" style="margin-top: 16px">
        <a-descriptions-item label="是否停工">{{ yn(record.isSuspended) }}</a-descriptions-item>
        <a-descriptions-item label="停工时间">
          {{
            record.isSuspended
              ? `${record.suspendStartDate || '—'} 至 ${record.suspendEndDate || '—'}`
              : '—'
          }}
        </a-descriptions-item>
        <a-descriptions-item label="填报人">{{ record.stopReportedBy || '—' }}</a-descriptions-item>
        <a-descriptions-item label="填报时间">{{ record.stopReportedAt || '—' }}</a-descriptions-item>
      </a-descriptions>

      <div style="margin-top: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">每日在岗人数历史记录</div>
        <a-alert
          v-if="!historyRows.length"
          type="warning"
          show-icon
          style="margin-bottom: 8px"
          message="暂无在岗人数历史"
          :description="
            expectedRange
              ? `未复工前需填报在岗人数（区间 ${expectedRange[0]} 至 ${expectedRange[1]}）。请在列表点击「填报在岗人数」。`
              : '请先完成停工情况填报。'
          "
        />
        <a-table
          v-else
          size="small"
          :pagination="false"
          row-key="date"
          :data-source="historyRows"
          :columns="[
            { title: '日期', dataIndex: 'date', width: 140 },
            { title: '累计到岗人数', dataIndex: 'cumulativeCount', width: 140 },
            { title: '当日到岗人数', dataIndex: 'todayCount', width: 140 }
          ]"
        />
        <div
          v-if="historyRows.length"
          style="margin-top: 8px; color: rgba(0, 0, 0, 0.45); font-size: 12px"
        >
          最近填报：{{ record.dailyReportedBy || '—' }} · {{ record.dailyReportedAt || '—' }}
        </div>
      </div>

      <a-descriptions
        v-if="record.isSuspended !== undefined"
        title="复工情况"
        bordered
        size="small"
        :column="2"
        style="margin-top: 16px"
      >
        <a-descriptions-item label="是否复工">{{ yn(record.isResumed) }}</a-descriptions-item>
        <a-descriptions-item label="复工时间">{{ record.resumeDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="填报人">{{ record.resumeReportedBy || '—' }}</a-descriptions-item>
        <a-descriptions-item label="填报时间">{{ record.resumeReportedAt || '—' }}</a-descriptions-item>
      </a-descriptions>
    </template>
  </a-drawer>
</template>
