<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ImportPreviewRow } from '@/types/unit-fixed-investment';

const props = defineProps<{
  open: boolean;
  rows: ImportPreviewRow[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'confirm', rows: ImportPreviewRow[]): void;
}>();

const localRows = ref<ImportPreviewRow[]>([]);

watch(
  () => props.rows,
  (rows) => {
    localRows.value = rows.map((r) =>
      r.action === 'overwrite' ? { ...r, action: 'skip' as ImportPreviewRow['action'] } : { ...r }
    );
  },
  { immediate: true, deep: true }
);

const writableCount = computed(() =>
  localRows.value.filter((r) => r.action === 'insert' || r.action === 'overwrite').length
);

const columns = [
  { title: '行号', dataIndex: 'rowNo', width: 64 },
  { title: '年份', dataIndex: 'year', width: 72 },
  { title: '月份', dataIndex: 'month', width: 64 },
  { title: '责任单位', dataIndex: 'unitName', width: 120, ellipsis: true },
  { title: '原值（万元）', key: 'old', width: 120 },
  { title: '新值（万元）', dataIndex: 'newAmountWan', width: 120 },
  { title: '处理', key: 'action', width: 140 }
];

function formatWan(v?: number) {
  if (v == null) return '—';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function actionLabel(row: ImportPreviewRow) {
  if (row.action === 'invalid') return row.error || '校验失败';
  if (row.action === 'insert') return '写入';
  if (row.action === 'overwrite') return '覆盖（可改跳过）';
  return '跳过';
}

function onActionChange(row: ImportPreviewRow, checked: boolean) {
  if (row.oldAmountWan == null) return;
  row.action = checked ? 'overwrite' : 'skip';
}

function onCheckboxChange(row: ImportPreviewRow, e: { target: { checked: boolean } }) {
  onActionChange(row, e.target.checked);
}

function handleOk() {
  emit('confirm', localRows.value);
}

function handleCancel() {
  emit('update:open', false);
}
</script>

<template>
  <a-modal
    :open="open"
    title="导入预览"
    :width="920"
    :confirm-loading="loading"
    ok-text="确认写入"
    cancel-text="取消"
    destroy-on-close
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-alert
      type="info"
      show-icon
      style="margin-bottom: 12px"
      message="冲突行默认跳过；勾选「覆盖」后将替换原值。校验失败行不会写入。"
    />

    <a-table
      :columns="columns"
      :data-source="localRows"
      :pagination="false"
      size="small"
      row-key="rowNo"
      :scroll="{ y: 360 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'old'">
          {{ formatWan(record.oldAmountWan) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <template v-if="record.oldAmountWan != null && record.action !== 'invalid'">
            <a-checkbox
              :checked="record.action === 'overwrite'"
              @change="(e) => onCheckboxChange(record as ImportPreviewRow, e)"
            >
              覆盖
            </a-checkbox>
          </template>
          <span v-else :class="{ 'import-preview__invalid': record.action === 'invalid' }">
            {{ actionLabel(record as ImportPreviewRow) }}
          </span>
        </template>
      </template>
    </a-table>

    <div class="import-preview__summary">可写入 {{ writableCount }} 条</div>
  </a-modal>
</template>

<style scoped>
.import-preview__summary {
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
}

.import-preview__invalid {
  color: #cf1322;
}
</style>
