<script setup lang="ts">
import type { TableColumnType } from 'ant-design-vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { keyProjectApi } from '@/api/key-project-overview';
import type { KeyProjectItem } from '@/types/key-project-overview';
import { calcCompletionRate } from '@/types/key-project-overview';

const router = useRouter();

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const searchForm = reactive({
  keyword: '',
  year: currentYear
});

const tableData = ref<KeyProjectItem[]>([]);
const loading = ref(false);
const pagination = reactive({ current: 1, pageSize: 10 });

const columns: TableColumnType[] = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 240, ellipsis: true },
  { title: '项目代码', dataIndex: 'projectCode', key: 'projectCode', width: 160 },
  { title: '代建单位', dataIndex: 'agencyUnit', key: 'agencyUnit', width: 180, ellipsis: true },
  { title: '责任单位', dataIndex: 'responsibleUnit', key: 'responsibleUnit', width: 160, ellipsis: true },
  { title: '年度目标（万元）', key: 'annualTarget', width: 140, align: 'right' },
  { title: '本月完成（万元）', key: 'monthActual', width: 140, align: 'right' },
  { title: '本月完成率', key: 'monthRate', width: 110, align: 'right' },
  { title: '操作', key: 'operation', width: 120, fixed: 'right' }
];

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return tableData.value.slice(start, start + pagination.pageSize);
});

function getMonthRow(record: KeyProjectItem) {
  return record.imageProgress.monthlyTargets.find((item) => item.month === currentMonth);
}

async function loadList() {
  loading.value = true;
  try {
    tableData.value = await keyProjectApi.getList({
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
  pagination.current = 1;
  loadList();
}

function goDetail(record: KeyProjectItem) {
  router.push(`/project-management/key-project-overview/${record.id}`);
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">重大攻坚项目概览</h1>
      <p class="page-header__desc">重大办查看各项目代建单位填报的形象进度目标及月度完成情况</p>
    </div>

    <a-card :bordered="false" class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="关键词">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="项目名称 / 代码 / 代建单位"
            allow-clear
            style="width: 220px"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="年度">
          <a-input-number v-model:value="searchForm.year" :min="2020" :max="2099" :controls="false" />
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
        @change="(pag) => { pagination.current = pag.current ?? 1; pagination.pageSize = pag.pageSize ?? 10; }"
      >
        <template #bodyCell="{ column, record: row }">
          <template v-if="column.key === 'annualTarget'">
            {{ (row as KeyProjectItem).imageProgress.annualTarget ?? '—' }}
          </template>
          <template v-else-if="column.key === 'monthActual'">
            {{ getMonthRow(row as KeyProjectItem)?.actualAmount ?? '—' }}
          </template>
          <template v-else-if="column.key === 'monthRate'">
            {{
              calcCompletionRate(
                getMonthRow(row as KeyProjectItem)?.actualAmount,
                getMonthRow(row as KeyProjectItem)?.targetAmount
              ) != null
                ? `${calcCompletionRate(
                    getMonthRow(row as KeyProjectItem)?.actualAmount,
                    getMonthRow(row as KeyProjectItem)?.targetAmount
                  )}%`
                : '—'
            }}
          </template>
          <template v-else-if="column.key === 'operation'">
            <a-button type="link" size="small" @click="goDetail(row as KeyProjectItem)">
              项目详情
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
