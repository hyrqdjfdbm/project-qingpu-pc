<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { workSuspendApi } from '@/api/work-suspend';
import {
  buildDailyStaffTemplate,
  getDailyStaffDateRange
} from '@/mock/work-suspend-store';
import type { DailyStaffRecord, WorkSuspendItem } from '@/types/work-suspend';
import { HOLIDAY_TYPE_LABEL } from '@/types/work-suspend';

const props = defineProps<{
  open: boolean;
  record: WorkSuspendItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const rows = ref<DailyStaffRecord[]>([]);

const columns: TableColumnType[] = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 140 },
  { title: '累计到岗人数', key: 'cumulativeCount', width: 160 },
  { title: '当日到岗人数', key: 'todayCount', width: 160 }
];

const rangeDesc = computed(() => {
  const record = props.record;
  if (!record) return '';
  const range = getDailyStaffDateRange(record);
  if (!range) return '';
  if (record.isSuspended) {
    return `停工期间 ${range[0]} 至 ${range[1]}`;
  }
  return `节假日期间 ${range[0]} 至 ${range[1]}（不停工亦需填报）`;
});

watch(
  () => props.open,
  (open) => {
    if (!open || !props.record) return;
    const range = getDailyStaffDateRange(props.record);
    if (!range) {
      rows.value = [];
      return;
    }
    const template = buildDailyStaffTemplate(range[0], range[1]);
    const existing = new Map((props.record.dailyStaff || []).map((d) => [d.date, d]));
    rows.value = template.map((row) => {
      const hit = existing.get(row.date);
      return hit
        ? {
            date: hit.date,
            cumulativeCount: hit.cumulativeCount,
            todayCount: hit.todayCount
          }
        : row;
    });
  }
);

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (!rows.value.length) {
    message.warning('无可用日期区间，无法填报在岗人数');
    return;
  }
  for (const row of rows.value) {
    if (
      row.cumulativeCount === undefined ||
      row.cumulativeCount === null ||
      Number(row.cumulativeCount) < 0
    ) {
      message.warning(`请填写 ${row.date} 的累计到岗人数`);
      return;
    }
    if (row.todayCount === undefined || row.todayCount === null || Number(row.todayCount) < 0) {
      message.warning(`请填写 ${row.date} 的当日到岗人数`);
      return;
    }
  }
  submitting.value = true;
  try {
    await workSuspendApi.reportDailyStaff(props.record.id, {
      dailyStaff: rows.value.map((r) => ({
        date: r.date,
        cumulativeCount: Number(r.cumulativeCount),
        todayCount: Number(r.todayCount)
      }))
    });
    message.success('在岗人数已填报；未复工前可继续补报，复工后可填报复工情况');
    emit('saved');
    close();
  } catch (e: unknown) {
    message.error(e instanceof Error ? e.message : '填报失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="填报每日在岗人数"
    :width="640"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 12px"
        :message="record.projectName"
        :description="`${record.year}年${HOLIDAY_TYPE_LABEL[record.holiday]} · ${rangeDesc}`"
      />
      <div style="margin-bottom: 8px; color: rgba(0, 0, 0, 0.45); font-size: 12px">
        未复工期间，无论是否停工均需填报：每日填写「累计到岗人数」与「当日到岗人数」。
      </div>
      <a-table
        :columns="columns"
        :data-source="rows"
        :pagination="false"
        size="small"
        row-key="date"
        :scroll="{ y: 360 }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'cumulativeCount'">
            <a-input-number
              :value="(row as DailyStaffRecord).cumulativeCount"
              :min="0"
              :precision="0"
              :controls="false"
              style="width: 120px"
              placeholder="累计"
              @update:value="
                (v) => ((row as DailyStaffRecord).cumulativeCount = Number(v) || 0)
              "
            />
          </template>
          <template v-else-if="column.key === 'todayCount'">
            <a-input-number
              :value="(row as DailyStaffRecord).todayCount"
              :min="0"
              :precision="0"
              :controls="false"
              style="width: 120px"
              placeholder="当日"
              @update:value="(v) => ((row as DailyStaffRecord).todayCount = Number(v) || 0)"
            />
          </template>
        </template>
      </a-table>
    </template>
  </a-modal>
</template>
