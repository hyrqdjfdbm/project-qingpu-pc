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
import { routePlanningApi } from '@/api/route-planning';
import type {
  ActivityProjectLink,
  RouteActivityFile,
  RouteActivityKind,
  RouteActivityRecord,
  RouteRelateProject
} from '@/types/route-planning';
import {
  LEADER_LEVEL_LABEL,
  ROUTE_ACTIVITY_KIND_LABEL
} from '@/types/route-planning';
import ActivityFormModal from './ActivityFormModal.vue';

/** 列表展平行：一个关联项目一行 */
interface FlatActivityRow {
  rowKey: string;
  record: RouteActivityRecord;
  project: ActivityProjectLink | null;
  /** 活动信息列合并行数；非首行置 0 */
  activityRowSpan: number;
}

const props = defineProps<{
  kind: RouteActivityKind;
  description: string;
}>();

const loading = ref(false);
const tableData = ref<RouteActivityRecord[]>([]);
const relateProjects = ref<RouteRelateProject[]>([]);
const keyword = ref('');
const pagination = reactive({ current: 1, pageSize: 10 });

const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit' | 'view'>('create');
const activeRecord = ref<RouteActivityRecord | null>(null);

const title = computed(() => ROUTE_ACTIVITY_KIND_LABEL[props.kind]);
const activityNameLabel = computed(() =>
  props.kind === 'saturday' ? '活动主题名称' : '活动名称'
);

function activityCell(row: FlatActivityRow) {
  return { rowSpan: row.activityRowSpan };
}

const columns = computed<TableColumnType[]>(() => {
  const cols: TableColumnType[] = [
    {
      title: activityNameLabel.value,
      key: 'activityName',
      width: 200,
      ellipsis: true,
      customCell: activityCell
    },
    {
      title: '走访时间',
      key: 'visitTime',
      width: 170,
      customCell: activityCell
    },
    {
      title: '方案',
      key: 'scheme',
      width: 220,
      customCell: activityCell
    },
    { title: '关联项目', key: 'project', width: 200, ellipsis: true },
    { title: '难题事项', key: 'problems', width: 260 },
    { title: '交办事项', key: 'tasks', width: 260 },
    {
      title: '更新时间',
      key: 'updatedAt',
      width: 170,
      customCell: activityCell
    }
  ];
  if (props.kind === 'cityLeader') {
    cols.splice(2, 0, {
      title: '领导层级',
      key: 'leaderLevel',
      width: 100,
      customCell: activityCell
    });
  }
  if (props.kind === 'projectOffice') {
    cols.splice(-1, 0, {
      title: '现场图片',
      key: 'siteImages',
      width: 100,
      customCell: activityCell
    });
  }
  cols.push({
    title: '操作',
    key: 'operation',
    width: 200,
    fixed: 'right',
    customCell: activityCell
  });
  return cols;
});

const flatRows = computed(() => {
  const rows: FlatActivityRow[] = [];
  for (const record of tableData.value) {
    const projects = record.projects;
    if (!projects.length) {
      rows.push({
        rowKey: `${record.id}-empty`,
        record,
        project: null,
        activityRowSpan: 1
      });
      continue;
    }
    projects.forEach((project, index) => {
      rows.push({
        rowKey: `${record.id}-${project.projectId}-${index}`,
        record,
        project,
        activityRowSpan: index === 0 ? projects.length : 0
      });
    });
  }
  return rows;
});

const pagedData = computed(() => {
  // 按活动分页，再展平，避免同一活动拆到两页
  const start = (pagination.current - 1) * pagination.pageSize;
  const pageRecords = tableData.value.slice(start, start + pagination.pageSize);
  const idSet = new Set(pageRecords.map((r) => r.id));
  return flatRows.value.filter((row) => idSet.has(row.record.id));
});

function getProjectMeta(projectId: string) {
  return relateProjects.value.find((p) => p.id === projectId);
}

function problemContents(link: ActivityProjectLink | null) {
  if (!link) return [];
  const meta = getProjectMeta(link.projectId);
  if (!meta) return [];
  return meta.problems
    .filter((p) => link.selectedProblemIds.includes(p.id))
    .map((p) => p.coordinateContent);
}

function taskContents(link: ActivityProjectLink | null) {
  if (!link) return [];
  const meta = getProjectMeta(link.projectId);
  if (!meta) return [];
  return meta.tasks
    .filter((t) => link.selectedTaskIds.includes(t.id))
    .map((t) => t.assignContent);
}

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await routePlanningApi.list({
      kind: props.kind,
      keyword: keyword.value || undefined
    });
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  relateProjects.value = await routePlanningApi.listRelateProjects();
  await loadList();
});

function handleSearch() {
  pagination.current = 1;
  loadList();
}

function openCreate() {
  activeRecord.value = null;
  modalMode.value = 'create';
  modalOpen.value = true;
}

function openView(record: RouteActivityRecord) {
  activeRecord.value = record;
  modalMode.value = 'view';
  modalOpen.value = true;
}

function openEdit(record: RouteActivityRecord) {
  activeRecord.value = record;
  modalMode.value = 'edit';
  modalOpen.value = true;
}

function handleDelete(record: RouteActivityRecord) {
  Modal.confirm({
    title: '确认删除',
    content: `确定删除该条${title.value}活动记录吗？删除后不可恢复。`,
    okType: 'danger',
    async onOk() {
      await routePlanningApi.remove(record.id);
      message.success('已删除');
      await loadList();
    }
  });
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadSchemeFile(file: RouteActivityFile) {
  const url =
    file.url ||
    URL.createObjectURL(new Blob([`活动方案：${file.name}`], { type: 'application/octet-stream' }));
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
</script>

<template>
  <div>
    <div class="page-header page-header--with-action">
      <div>
        <h1 class="page-header__title">{{ title }}</h1>
        <p class="page-header__desc">{{ description }}</p>
      </div>
      <a-button type="primary" @click="openCreate">
        <template #icon><PlusOutlined /></template>
        新增活动
      </a-button>
    </div>

    <a-card :bordered="false" class="search-card">
      <a-form layout="inline">
        <a-form-item label="关键词">
          <a-input
            v-model:value="keyword"
            :placeholder="`${activityNameLabel} / 项目名称 / 方案 / 时间`"
            allow-clear
            style="width: 240px"
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
          showTotal: (total: number) => `共 ${total} 条活动`
        }"
        :scroll="{ x: 1400 }"
        @change="
          (pag) => {
            pagination.current = pag.current ?? 1;
            pagination.pageSize = pag.pageSize ?? 10;
          }
        "
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'activityName'">
            {{ (row as FlatActivityRow).record.activityName }}
          </template>
          <template v-else-if="column.key === 'visitTime'">
            {{ (row as FlatActivityRow).record.visitTime }}
          </template>
          <template v-else-if="column.key === 'leaderLevel'">
            {{
              (row as FlatActivityRow).record.leaderLevel
                ? LEADER_LEVEL_LABEL[(row as FlatActivityRow).record.leaderLevel!]
                : '—'
            }}
          </template>
          <template v-else-if="column.key === 'scheme'">
            <div
              v-if="(row as FlatActivityRow).record.schemeFiles.length"
              class="scheme-files"
            >
              <div
                v-for="(file, idx) in (row as FlatActivityRow).record.schemeFiles"
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
          <template v-else-if="column.key === 'project'">
            {{ (row as FlatActivityRow).project?.projectName || '—' }}
          </template>
          <template v-else-if="column.key === 'problems'">
            <div
              v-if="problemContents((row as FlatActivityRow).project).length"
              class="issue-list"
            >
              <a-tooltip
                v-for="(text, idx) in problemContents((row as FlatActivityRow).project)"
                :key="idx"
                :title="text"
              >
                <div class="issue-list__item">{{ text }}</div>
              </a-tooltip>
            </div>
            <span v-else class="empty-cell">—</span>
          </template>
          <template v-else-if="column.key === 'tasks'">
            <div
              v-if="taskContents((row as FlatActivityRow).project).length"
              class="issue-list"
            >
              <a-tooltip
                v-for="(text, idx) in taskContents((row as FlatActivityRow).project)"
                :key="idx"
                :title="text"
              >
                <div class="issue-list__item">{{ text }}</div>
              </a-tooltip>
            </div>
            <span v-else class="empty-cell">—</span>
          </template>
          <template v-else-if="column.key === 'siteImages'">
            {{ (row as FlatActivityRow).record.siteImages?.length ?? 0 }} 张
          </template>
          <template v-else-if="column.key === 'updatedAt'">
            {{ (row as FlatActivityRow).record.updatedAt }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-space :size="0">
              <a-button
                type="link"
                size="small"
                @click="openView((row as FlatActivityRow).record)"
              >
                <EyeOutlined /> 查看
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="openEdit((row as FlatActivityRow).record)"
              >
                <EditOutlined /> 编辑
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="handleDelete((row as FlatActivityRow).record)"
              >
                <DeleteOutlined /> 删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <ActivityFormModal
      v-model:open="modalOpen"
      :kind="kind"
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

.issue-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
}

.issue-list__item {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-primary, #1f1f1f);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 8px;
  border-left: 2px solid var(--color-primary, #2f54eb);
}

.empty-cell {
  color: var(--color-text-secondary, #8c8c8c);
}
</style>
