<script setup lang="ts">
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PaperClipOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { meetingCoordinationApi } from '@/api/meeting-coordination';
import type {
  MeetingCoordinationRecord,
  MeetingSchemeFile,
  MeetingTaskItem
} from '@/types/meeting-coordination';
import MeetingFormModal from './components/MeetingFormModal.vue';

/** 列表展平行：一个交办事项一行 */
interface FlatMeetingRow {
  rowKey: string;
  record: MeetingCoordinationRecord;
  projectName: string;
  task: MeetingTaskItem | null;
  /** 会议信息列合并行数；非首行置 0 */
  meetingRowSpan: number;
}

const loading = ref(false);
const tableData = ref<MeetingCoordinationRecord[]>([]);
const keyword = ref('');
const pagination = reactive({ current: 1, pageSize: 10 });

const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit' | 'view'>('create');
const activeRecord = ref<MeetingCoordinationRecord | null>(null);

const columns: TableColumnType[] = [
  {
    title: '会议内容',
    key: 'meetingContent',
    width: 200,
    ellipsis: true,
    customCell: (row: FlatMeetingRow) => ({ rowSpan: row.meetingRowSpan })
  },
  {
    title: '会议时间',
    key: 'meetingTime',
    width: 170,
    customCell: (row: FlatMeetingRow) => ({ rowSpan: row.meetingRowSpan })
  },
  {
    title: '方案',
    key: 'scheme',
    width: 220,
    customCell: (row: FlatMeetingRow) => ({ rowSpan: row.meetingRowSpan })
  },
  {
    title: '协调层级',
    key: 'coordinationLevel',
    width: 140,
    ellipsis: true,
    customCell: (row: FlatMeetingRow) => ({ rowSpan: row.meetingRowSpan })
  },
  { title: '关联项目', key: 'project', width: 200, ellipsis: true },
  { title: '项目交办事项', key: 'task', width: 260 },
  { title: '目前进展', key: 'progress', width: 220 },
  { title: '预计完成时间', key: 'expectedTime', width: 140 },
  { title: '实际完成时间', key: 'actualTime', width: 140 },
  {
    title: '操作',
    key: 'operation',
    width: 200,
    fixed: 'right',
    customCell: (row: FlatMeetingRow) => ({ rowSpan: row.meetingRowSpan })
  }
];

const flatRows = computed(() => {
  const rows: FlatMeetingRow[] = [];
  for (const record of tableData.value) {
    const taskEntries = record.projects.flatMap((p) =>
      p.tasks.map((task) => ({ projectName: p.projectName, task }))
    );
    if (!taskEntries.length) {
      rows.push({
        rowKey: `${record.id}-empty`,
        record,
        projectName: record.projects.map((p) => p.projectName).join('、') || '—',
        task: null,
        meetingRowSpan: 1
      });
      continue;
    }
    taskEntries.forEach((entry, index) => {
      rows.push({
        rowKey: `${record.id}-${entry.task.taskId}-${index}`,
        record,
        projectName: entry.projectName,
        task: entry.task,
        meetingRowSpan: index === 0 ? taskEntries.length : 0
      });
    });
  }
  return rows;
});

const pagedData = computed(() => {
  // 按会议分页，再展平，避免同一会议被拆到两页
  const start = (pagination.current - 1) * pagination.pageSize;
  const pageRecords = tableData.value.slice(start, start + pagination.pageSize);
  const idSet = new Set(pageRecords.map((r) => r.id));
  return flatRows.value.filter((row) => idSet.has(row.record.id));
});

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadSchemeFile(file: MeetingSchemeFile) {
  const url =
    file.url ||
    URL.createObjectURL(new Blob([`会议方案：${file.name}`], { type: 'application/octet-stream' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  if (!file.url) URL.revokeObjectURL(url);
  message.success(`已开始下载「${file.name}」`);
}

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await meetingCoordinationApi.list({
      keyword: keyword.value || undefined
    });
  } finally {
    loading.value = false;
  }
}

onMounted(loadList);

function handleSearch() {
  pagination.current = 1;
  loadList();
}

function openCreate() {
  activeRecord.value = null;
  modalMode.value = 'create';
  modalOpen.value = true;
}

function openView(record: MeetingCoordinationRecord) {
  activeRecord.value = record;
  modalMode.value = 'view';
  modalOpen.value = true;
}

function openEdit(record: MeetingCoordinationRecord) {
  activeRecord.value = record;
  modalMode.value = 'edit';
  modalOpen.value = true;
}

function handleDelete(record: MeetingCoordinationRecord) {
  Modal.confirm({
    title: '确认删除',
    content: `确定删除会议「${record.meetingContent}」吗？删除后不可恢复。`,
    okType: 'danger',
    async onOk() {
      await meetingCoordinationApi.remove(record.id);
      message.success('已删除');
      await loadList();
    }
  });
}
</script>

<template>
  <div>
    <div class="page-header page-header--with-action">
      <div>
        <h1 class="page-header__title">会议协调事项</h1>
        <p class="page-header__desc">
          记录会议协调情况：上传方案，逐个关联项目并勾选交办事项，跟踪进展与完成时间
        </p>
      </div>
      <a-button type="primary" @click="openCreate">
        <template #icon><PlusOutlined /></template>
        新增
      </a-button>
    </div>

    <a-card :bordered="false" class="search-card">
      <a-form layout="inline">
        <a-form-item label="关键词">
          <a-input
            v-model:value="keyword"
            placeholder="会议内容 / 协调层级 / 项目 / 交办内容"
            allow-clear
            style="width: 280px"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button
              @click="
                keyword = '';
                handleSearch();
              "
            >
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="pagedData"
        :loading="loading"
        row-key="rowKey"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: tableData.length,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条会议`
        }"
        :scroll="{ x: 1800 }"
        @change="
          (pag) => {
            pagination.current = pag.current ?? 1;
            pagination.pageSize = pag.pageSize ?? 10;
          }
        "
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'meetingContent'">
            {{ (row as FlatMeetingRow).record.meetingContent }}
          </template>
          <template v-else-if="column.key === 'meetingTime'">
            {{ (row as FlatMeetingRow).record.meetingTime }}
          </template>
          <template v-else-if="column.key === 'scheme'">
            <div
              v-if="(row as FlatMeetingRow).record.schemeFiles.length"
              class="scheme-files"
            >
              <div
                v-for="(file, idx) in (row as FlatMeetingRow).record.schemeFiles"
                :key="`${file.name}-${idx}`"
                class="scheme-file"
              >
                <PaperClipOutlined class="scheme-file__icon" />
                <a-tooltip :title="`${file.name}（${formatFileSize(file.size)}）`">
                  <span class="scheme-file__name">{{ file.name }}</span>
                </a-tooltip>
                <a-button
                  type="link"
                  size="small"
                  class="scheme-file__btn"
                  @click="downloadSchemeFile(file)"
                >
                  <DownloadOutlined />
                </a-button>
              </div>
            </div>
            <span v-else class="empty-cell">—</span>
          </template>
          <template v-else-if="column.key === 'coordinationLevel'">
            {{ (row as FlatMeetingRow).record.coordinationLevel }}
          </template>
          <template v-else-if="column.key === 'project'">
            {{ (row as FlatMeetingRow).projectName || '—' }}
          </template>
          <template v-else-if="column.key === 'task'">
            <a-tooltip
              v-if="(row as FlatMeetingRow).task"
              :title="(row as FlatMeetingRow).task!.assignContent"
            >
              <span class="cell-text">{{ (row as FlatMeetingRow).task!.assignContent }}</span>
            </a-tooltip>
            <span v-else class="empty-cell">—</span>
          </template>
          <template v-else-if="column.key === 'progress'">
            <a-tooltip
              v-if="(row as FlatMeetingRow).task"
              :title="(row as FlatMeetingRow).task!.progress || '—'"
            >
              <span class="cell-text">
                {{ (row as FlatMeetingRow).task!.progress?.trim() || '—' }}
              </span>
            </a-tooltip>
            <span v-else class="empty-cell">—</span>
          </template>
          <template v-else-if="column.key === 'expectedTime'">
            {{ (row as FlatMeetingRow).task?.expectedCompleteTime || '—' }}
          </template>
          <template v-else-if="column.key === 'actualTime'">
            {{ (row as FlatMeetingRow).task?.actualCompleteTime || '—' }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space :size="0">
              <a-button
                type="link"
                size="small"
                @click="openView((row as FlatMeetingRow).record)"
              >
                <EyeOutlined /> 查看
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="openEdit((row as FlatMeetingRow).record)"
              >
                <EditOutlined /> 编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleDelete((row as FlatMeetingRow).record)"
              >
                <DeleteOutlined /> 删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <MeetingFormModal
      v-model:open="modalOpen"
      :mode="modalMode"
      :record="activeRecord"
      @saved="loadList"
    />
  </div>
</template>

<style scoped>
.page-header--with-action {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.search-card :deep(.ant-card-body) {
  padding-bottom: 8px;
}

.scheme-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scheme-file {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 2px 0;
}

.scheme-file__icon {
  flex-shrink: 0;
  color: var(--color-primary, #2f54eb);
}

.scheme-file__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--color-text-primary, #1f1f1f);
}

.scheme-file__btn {
  flex-shrink: 0;
  padding: 0 4px;
  height: auto;
}

.cell-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  word-break: break-word;
  line-height: 1.5;
}

.empty-cell {
  color: var(--color-text-secondary, #8c8c8c);
}
</style>
