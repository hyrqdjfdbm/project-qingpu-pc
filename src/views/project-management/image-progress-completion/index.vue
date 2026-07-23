<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { imageProgressCompletionApi } from '@/api/image-progress-completion';
import type { ImageProgressProject } from '@/types/image-progress-completion';

const router = useRouter();
const currentYear = new Date().getFullYear();

const loading = ref(false);
const tableData = ref<ImageProgressProject[]>([]);
const searchForm = reactive({
  keyword: '',
  year: currentYear
});
const pagination = reactive({ current: 1, pageSize: 10 });

const columns: TableColumnType[] = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 240, ellipsis: true },
  { title: '项目代码', dataIndex: 'projectCode', key: 'projectCode', width: 150 },
  { title: '责任单位', dataIndex: 'responsibleUnit', key: 'responsibleUnit', width: 160, ellipsis: true },
  { title: '施工单位', dataIndex: 'constructionUnit', key: 'constructionUnit', width: 180, ellipsis: true },
  { title: '当前阶段', dataIndex: 'currentStage', key: 'currentStage', width: 120 },
  { title: '年度目标', key: 'targetStatus', width: 110 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'operation', width: 120, fixed: 'right' }
];

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return tableData.value.slice(start, start + pagination.pageSize);
});

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await imageProgressCompletionApi.list({
      keyword: searchForm.keyword || undefined,
      year: searchForm.year
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

function handleReset() {
  searchForm.keyword = '';
  searchForm.year = currentYear;
  handleSearch();
}

function goDetail(record: ImageProgressProject) {
  router.push({
    path: `/project-management/image-progress-completion/${record.id}`,
    query: { year: String(searchForm.year) }
  });
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">形象进度完成情况</h1>
      <p class="page-header__desc">选择项目查看年度及各月资金、形象进度目标与完成情况</p>
    </div>

    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="项目名称 / 代码 / 责任单位"
            allow-clear
            style="width: 240px"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="年度">
          <a-input-number
            v-model:value="searchForm.year"
            :min="2020"
            :max="2099"
            :controls="false"
            style="width: 100px"
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
          total: tableData.length,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条`
        }"
        :scroll="{ x: 1200 }"
        @change="
          (pag) => {
            pagination.current = pag.current ?? 1;
            pagination.pageSize = pag.pageSize ?? 10;
          }
        "
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'targetStatus'">
            <a-tag v-if="(row as ImageProgressProject).yearTarget" color="success">已填报</a-tag>
            <a-tag v-else color="warning">未填报</a-tag>
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-button type="link" size="small" @click="goDetail(row as ImageProgressProject)">
              查看详情
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.search-card :deep(.ant-card-body) {
  padding-bottom: 8px;
}
</style>
