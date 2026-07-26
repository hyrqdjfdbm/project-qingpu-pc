<script setup lang="ts">
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { assessmentScoreApi } from '@/api/assessment-score';
import type { AssessmentDocument } from '@/types/assessment-score';
import {
  downloadAssessmentDoc,
  formatAssessmentFileSize
} from '@/utils/assessment-download';

const loading = ref(false);
const tableData = ref<AssessmentDocument[]>([]);
const yearFilter = ref<number | undefined>();
/** 月份：1–12 */
const monthFilter = ref<number | undefined>();
const pagination = reactive({ current: 1, pageSize: 10 });

const columns: TableColumnType[] = [
  { title: '考核周期', dataIndex: 'periodLabel', key: 'periodLabel', width: 140 },
  { title: '文档名称', key: 'fileName', ellipsis: true },
  { title: '文件大小', key: 'fileSize', width: 110 },
  { title: '生成时间', dataIndex: 'generatedAt', key: 'generatedAt', width: 180 },
  { title: '操作', key: 'operation', width: 100, fixed: 'right' }
];

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = new Set(tableData.value.map((d) => d.year));
  years.add(currentYear);
  return [...years].sort((a, b) => b - a).map((y) => ({ label: `${y}年`, value: y }));
});

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}月`,
  value: i + 1
}));

const filteredData = computed(() => {
  let list = tableData.value;
  if (yearFilter.value != null) {
    list = list.filter((d) => d.year === yearFilter.value);
  }
  if (monthFilter.value != null) {
    list = list.filter((d) => d.month === monthFilter.value);
  }
  return list;
});

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return filteredData.value.slice(start, start + pagination.pageSize);
});

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await assessmentScoreApi.list({ type: 'red_yellow_flag' });
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
}

function handleReset() {
  yearFilter.value = undefined;
  monthFilter.value = undefined;
  pagination.current = 1;
}

function handleDownload(doc: AssessmentDocument) {
  downloadAssessmentDoc(doc);
  message.success(`已开始下载「${doc.fileName}」`);
}

onMounted(loadList);
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">红黄旗评分</h1>
    </div>

    <a-card :bordered="false" class="search-card">
      <a-form layout="inline">
        <a-form-item label="年份">
          <a-select
            v-model:value="yearFilter"
            allow-clear
            placeholder="全部年份"
            style="width: 140px"
            :options="yearOptions"
            @change="handleSearch"
          />
        </a-form-item>
        <a-form-item label="月份">
          <a-select
            v-model:value="monthFilter"
            allow-clear
            placeholder="全部月份"
            style="width: 140px"
            :options="monthOptions"
            @change="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-table
        :columns="columns"
        :data-source="pagedData"
        :loading="loading"
        row-key="id"
        :pagination="{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 份文档`
        }"
        :scroll="{ x: 960 }"
        @change="
          (pag) => {
            pagination.current = pag.current ?? 1;
            pagination.pageSize = pag.pageSize ?? 10;
          }
        "
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'fileName'">
            <div class="file-cell">
              <FilePdfOutlined class="file-cell__icon" />
              <span class="file-cell__name">{{ (record as AssessmentDocument).fileName }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'fileSize'">
            {{ formatAssessmentFileSize((record as AssessmentDocument).fileSize) }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-button type="link" size="small" @click="handleDownload(record as AssessmentDocument)">
              <DownloadOutlined /> 下载
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.page-header__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary, rgba(0, 0, 0, 0.88));
}

.search-card :deep(.ant-form-item) {
  margin-bottom: 0;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.file-cell__icon {
  color: var(--color-error);
  flex-shrink: 0;
}

.file-cell__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
