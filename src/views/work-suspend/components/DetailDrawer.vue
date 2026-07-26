<script setup lang="ts">
import { computed } from 'vue';
import { buildDailyStaffTemplate } from '@/mock/work-suspend-store';
import {
  HOLIDAY_TYPE_LABEL,
  type WorkSuspendItem
} from '@/types/work-suspend';

const props = defineProps<{
  open: boolean;
  record: WorkSuspendItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const dailyStaffRows = computed(() => {
  const record = props.record;
  if (!record?.isSuspended) return [];
  if (record.dailyStaff?.length) return record.dailyStaff;
  if (record.suspendStartDate && record.suspendEndDate) {
    return buildDailyStaffTemplate(record.suspendStartDate, record.suspendEndDate);
  }
  return [];
});

const dailyStaffFilled = computed(() => Boolean(props.record?.dailyStaff?.length));

function close() {
  emit('update:open', false);
}

function yn(v: boolean | undefined) {
  if (v === undefined) return '—';
  return v ? '是' : '否';
}
</script>

<template>
  <a-drawer :open="open" title="停复工详情" :width="680" destroy-on-close @close="close">
    <template v-if="record">
      <div style="margin-bottom: 12px; color: rgba(0, 0, 0, 0.65)">
        {{ record.year }}年{{ HOLIDAY_TYPE_LABEL[record.holiday] }}
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

      <div v-if="record.isSuspended" style="margin-top: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">停工期间每日在岗人数</div>
        <a-alert
          v-if="!dailyStaffFilled"
          type="warning"
          show-icon
          style="margin-bottom: 8px"
          message="尚未填报在岗人数"
          description="请在列表操作中点击「填报在岗人数」完成填报；下表为停工期间日期清单。"
        />
        <a-table
          size="small"
          :pagination="false"
          row-key="date"
          :data-source="dailyStaffRows"
          :columns="[
            { title: '日期', dataIndex: 'date', width: 140 },
            { title: '在岗人数', dataIndex: 'count', width: 120 }
          ]"
        >
          <template #bodyCell="{ column, record: row }">
            <template v-if="column.dataIndex === 'count'">
              {{ dailyStaffFilled ? row.count : '—' }}
            </template>
          </template>
        </a-table>
        <div
          v-if="dailyStaffFilled"
          style="margin-top: 8px; color: rgba(0, 0, 0, 0.45); font-size: 12px"
        >
          填报：{{ record.dailyReportedBy || '—' }} · {{ record.dailyReportedAt || '—' }}
        </div>
      </div>

      <a-descriptions
        v-if="record.isSuspended"
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
