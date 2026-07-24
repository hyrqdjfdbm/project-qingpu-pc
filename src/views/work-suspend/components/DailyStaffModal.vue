<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { ref, watch } from 'vue';
import { workSuspendApi } from '@/api/work-suspend';
import { buildDailyStaffTemplate } from '@/mock/work-suspend-store';
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
  { title: '日期', dataIndex: 'date', key: 'date', width: 160 },
  { title: '在岗人数', key: 'count', width: 180 }
];

watch(
  () => props.open,
  (open) => {
    if (!open || !props.record) return;
    if (props.record.dailyStaff?.length) {
      rows.value = props.record.dailyStaff.map((d) => ({ ...d }));
    } else if (props.record.suspendStartDate && props.record.suspendEndDate) {
      rows.value = buildDailyStaffTemplate(
        props.record.suspendStartDate,
        props.record.suspendEndDate
      );
    } else {
      rows.value = [];
    }
  }
);

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (!rows.value.length) {
    message.warning('无停工日期区间，无法填报在岗人数');
    return;
  }
  for (const row of rows.value) {
    if (row.count === undefined || row.count === null || Number(row.count) < 0) {
      message.warning(`请填写 ${row.date} 的在岗人数`);
      return;
    }
  }
  submitting.value = true;
  try {
    await workSuspendApi.reportDailyStaff(props.record.id, {
      dailyStaff: rows.value.map((r) => ({ date: r.date, count: Number(r.count) }))
    });
    message.success('每日在岗人数已填报，请在复工后填报复工情况');
    emit('saved');
    close();
  } catch (e: any) {
    message.error(e?.message || '填报失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="填报停工期间每日在岗人数"
    :width="560"
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
        :description="`${record.year}年${HOLIDAY_TYPE_LABEL[record.holiday]} · 停工 ${record.suspendStartDate} 至 ${record.suspendEndDate}`"
      />
      <a-table
        :columns="columns"
        :data-source="rows"
        :pagination="false"
        size="small"
        row-key="date"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'count'">
            <a-input-number
              :value="(row as DailyStaffRecord).count"
              :min="0"
              :precision="0"
              :controls="false"
              style="width: 120px"
              placeholder="人数"
              @update:value="(v) => ((row as DailyStaffRecord).count = Number(v) || 0)"
            />
          </template>
        </template>
      </a-table>
    </template>
  </a-modal>
</template>
