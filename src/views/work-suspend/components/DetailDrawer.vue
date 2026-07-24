<script setup lang="ts">
import {
  HOLIDAY_TYPE_LABEL,
  WORK_SUSPEND_STATUS_LABEL,
  getWorkSuspendStatusColor,
  type WorkSuspendItem
} from '@/types/work-suspend';

defineProps<{
  open: boolean;
  record: WorkSuspendItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

function close() {
  emit('update:open', false);
}
</script>

<template>
  <a-drawer :open="open" title="停复工详情" :width="680" destroy-on-close @close="close">
    <template v-if="record">
      <a-space style="margin-bottom: 12px">
        <a-tag :color="getWorkSuspendStatusColor(record.status)">
          {{ WORK_SUSPEND_STATUS_LABEL[record.status] }}
        </a-tag>
        <span>{{ record.year }}年{{ HOLIDAY_TYPE_LABEL[record.holiday] }}</span>
      </a-space>

      <a-descriptions title="项目信息" bordered size="small" :column="2">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目编码">{{ record.projectCode }}</a-descriptions-item>
        <a-descriptions-item label="责任单位">{{ record.responsibleUnit }}</a-descriptions-item>
        <a-descriptions-item label="建设地点" :span="2">{{ record.location }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="停工情况" bordered size="small" :column="2" style="margin-top: 16px">
        <a-descriptions-item label="是否停工">
          {{
            record.isSuspended === undefined ? '—' : record.isSuspended ? '是' : '否'
          }}
        </a-descriptions-item>
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

      <div v-if="record.dailyStaff?.length" style="margin-top: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">停工期间每日在岗人数</div>
        <a-table
          size="small"
          :pagination="false"
          row-key="date"
          :data-source="record.dailyStaff"
          :columns="[
            { title: '日期', dataIndex: 'date', width: 140 },
            { title: '在岗人数', dataIndex: 'count', width: 120 }
          ]"
        />
        <div style="margin-top: 8px; color: rgba(0, 0, 0, 0.45); font-size: 12px">
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
        <a-descriptions-item label="是否复工">
          {{ record.isResumed === undefined ? '—' : record.isResumed ? '是' : '否' }}
        </a-descriptions-item>
        <a-descriptions-item label="复工时间">{{ record.resumeDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="填报人">{{ record.resumeReportedBy || '—' }}</a-descriptions-item>
        <a-descriptions-item label="填报时间">{{ record.resumeReportedAt || '—' }}</a-descriptions-item>
      </a-descriptions>
    </template>
  </a-drawer>
</template>
