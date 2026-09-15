<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import type { UnitFixedInvestmentAuditLog } from '@/types/unit-fixed-investment';

defineProps<{
  open: boolean;
  logs: UnitFixedInvestmentAuditLog[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const columns: TableColumnType[] = [
  { title: '时间', dataIndex: 'operatedAt', width: 170 },
  { title: '操作人', dataIndex: 'operator', width: 90 },
  { title: '动作', key: 'action', width: 100 },
  { title: '年份', dataIndex: 'year', width: 72 },
  { title: '月份', dataIndex: 'month', width: 64 },
  { title: '责任单位', dataIndex: 'unitName', width: 120, ellipsis: true },
  { title: '旧值（万元）', key: 'old', width: 120, align: 'right' },
  { title: '新值（万元）', key: 'new', width: 120, align: 'right' }
];

const actionLabel: Record<UnitFixedInvestmentAuditLog['action'], string> = {
  create: '录入',
  update: '修改',
  import_insert: '导入写入',
  import_overwrite: '导入覆盖'
};

function formatWan(v?: number) {
  if (v == null) return '—';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<template>
  <a-drawer
    :open="open"
    title="操作记录"
    :width="720"
    destroy-on-close
    @close="emit('update:open', false)"
  >
    <a-spin :spinning="loading">
      <a-table
        :columns="columns"
        :data-source="logs"
        row-key="id"
        size="small"
        :pagination="{ pageSize: 15, showSizeChanger: true }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            {{ actionLabel[record.action as UnitFixedInvestmentAuditLog['action']] }}
          </template>
          <template v-else-if="column.key === 'old'">
            {{ formatWan(record.oldAmountWan) }}
          </template>
          <template v-else-if="column.key === 'new'">
            {{ formatWan(record.newAmountWan) }}
          </template>
        </template>
      </a-table>
      <a-empty v-if="!loading && !logs.length" description="暂无操作记录" />
    </a-spin>
  </a-drawer>
</template>
