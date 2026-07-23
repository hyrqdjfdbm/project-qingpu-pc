<script setup lang="ts">
import { DownloadOutlined, EyeOutlined, PaperClipOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { computed, ref } from 'vue';
import type { DrawAttachmentMeta } from '@/types/budget-draw';
import { DRAW_ATTACHMENT_CATEGORIES, getDrawAttachmentDisplayLabel } from '@/types/budget-draw';
import {
  canPreviewAttachment,
  downloadAttachment,
  formatAttachmentSize,
  getAttachmentPreviewUrl,
  isImageAttachment,
  isPdfAttachment,
  shouldRevokePreviewUrl
} from '@/utils/draw-attachment';

const props = withDefaults(
  defineProps<{
    attachments: DrawAttachmentMeta[];
    compact?: boolean;
  }>(),
  { compact: false }
);

const previewOpen = ref(false);
const previewFile = ref<DrawAttachmentMeta | null>(null);
const previewUrl = ref('');

interface AttachmentRow extends DrawAttachmentMeta {
  rowKey: string;
  index: number;
  categoryLabel: string;
}

const tableRows = computed<AttachmentRow[]>(() => {
  const rows: AttachmentRow[] = [];
  let index = 1;

  for (const category of DRAW_ATTACHMENT_CATEGORIES) {
    const files = props.attachments.filter((file) => file.category === category.key);
    for (const file of files) {
      rows.push({
        ...file,
        rowKey: `${category.key}-${file.name}-${index}`,
        index: index++,
        categoryLabel: getDrawAttachmentDisplayLabel(category.key)
      });
    }
  }

  return rows;
});

const columns = computed<TableColumnType[]>(() => {
  const base: TableColumnType[] = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 64, align: 'center' },
    { title: '资料类型', dataIndex: 'categoryLabel', key: 'categoryLabel', ellipsis: true },
    { title: '文件名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '大小', dataIndex: 'size', key: 'size', width: 90, align: 'right' },
    { title: '操作', key: 'action', width: 120, align: 'center' }
  ];

  if (props.compact) {
    return base.filter((col) => col.key !== 'categoryLabel');
  }
  return base;
});

function handlePreview(file: DrawAttachmentMeta) {
  if (!canPreviewAttachment(file)) {
    message.info('该文件暂不支持在线预览，请下载后查看');
    return;
  }

  previewFile.value = file;
  previewUrl.value = getAttachmentPreviewUrl(file);
  previewOpen.value = true;
}

function handleDownload(file: DrawAttachmentMeta) {
  downloadAttachment(file);
}

function closePreview() {
  if (previewFile.value && previewUrl.value && shouldRevokePreviewUrl(previewFile.value)) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewOpen.value = false;
  previewFile.value = null;
  previewUrl.value = '';
}
</script>

<template>
  <div class="attachment-list" :class="{ 'attachment-list--compact': compact }">
    <a-table
      v-if="tableRows.length"
      :columns="columns"
      :data-source="tableRows"
      row-key="rowKey"
      :pagination="false"
      size="small"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span class="attachment-list__name">
            <PaperClipOutlined />
            {{ record.name }}
          </span>
        </template>
        <template v-else-if="column.key === 'size'">
          {{ formatAttachmentSize(record.size) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :size="4">
            <a-button
              type="link"
              size="small"
              :disabled="!canPreviewAttachment(record as AttachmentRow)"
              @click="handlePreview(record as AttachmentRow)"
            >
              <EyeOutlined /> 预览
            </a-button>
            <a-button type="link" size="small" @click="handleDownload(record as AttachmentRow)">
              <DownloadOutlined /> 下载
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    <a-empty v-else description="暂无附件" :image-style="{ height: '48px' }" />

    <a-modal
      :open="previewOpen"
      :title="previewFile?.name || '附件预览'"
      width="860px"
      :footer="null"
      destroy-on-close
      @cancel="closePreview"
    >
      <div v-if="previewFile && previewUrl" class="attachment-preview">
        <img
          v-if="isImageAttachment(previewFile.name)"
          :src="previewUrl"
          :alt="previewFile.name"
          class="attachment-preview__image"
        />
        <iframe
          v-else-if="isPdfAttachment(previewFile.name)"
          :src="previewUrl"
          class="attachment-preview__iframe"
          title="附件预览"
        />
        <div v-else class="attachment-preview__fallback">
          暂不支持该文件在线预览，请下载后查看。
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.attachment-list__name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.attachment-list :deep(.ant-table) {
  font-size: 13px;
}

.attachment-list--compact :deep(.ant-table-thead > tr > th),
.attachment-list--compact :deep(.ant-table-tbody > tr > td) {
  padding: 6px 8px;
}

.attachment-preview {
  min-height: 420px;
}

.attachment-preview__image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
}

.attachment-preview__iframe {
  width: 100%;
  height: 70vh;
  border: none;
}

.attachment-preview__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  color: var(--color-text-secondary, #8c8c8c);
}
</style>
