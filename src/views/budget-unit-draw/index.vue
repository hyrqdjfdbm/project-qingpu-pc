<script setup lang="ts">
import { GiftOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { budgetDrawApi } from '@/api/budget-draw';
import type { BudgetDrawPayload, BudgetDrawRecord, BudgetUnit } from '@/types/budget-draw';
import DrawModal from './components/DrawModal.vue';
import PublicityCard from './components/PublicityCard.vue';

const tableData = ref<BudgetDrawRecord[]>([]);
const units = ref<BudgetUnit[]>([]);
const loading = ref(false);
const drawOpen = ref(false);
const drawModalRef = ref<InstanceType<typeof DrawModal> | null>(null);
const pagination = reactive({ current: 1, pageSize: 10 });

const searchForm = reactive({
  projectName: '',
  winnerUnit: undefined as string | undefined
});

const winnerOptions = computed(() => {
  const names = new Set(tableData.value.map((r) => r.winnerUnit));
  return [...names].sort().map((name) => ({ value: name, label: name }));
});

const filteredData = computed(() => {
  const projectKeyword = searchForm.projectName.trim().toLowerCase();
  return tableData.value.filter((record) => {
    const matchProject =
      !projectKeyword || record.projectName.toLowerCase().includes(projectKeyword);
    const matchWinner =
      !searchForm.winnerUnit || record.winnerUnit === searchForm.winnerUnit;
    return matchProject && matchWinner;
  });
});

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return filteredData.value.slice(start, start + pagination.pageSize);
});

const hasFilter = computed(
  () => Boolean(searchForm.projectName.trim()) || Boolean(searchForm.winnerUnit)
);

watch(
  () => [searchForm.projectName, searchForm.winnerUnit],
  () => {
    pagination.current = 1;
  }
);

async function loadData() {
  loading.value = true;
  try {
    const [records, unitList] = await Promise.all([
      budgetDrawApi.getRecords(),
      budgetDrawApi.getUnits()
    ]);
    tableData.value = records;
    units.value = unitList;
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

function openDraw() {
  drawOpen.value = true;
}

function filterWinnerOption(input: string, option: { label?: string }) {
  return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
}

function handleSearch() {
  pagination.current = 1;
}

function handleReset() {
  searchForm.projectName = '';
  searchForm.winnerUnit = undefined;
  pagination.current = 1;
}

async function handleDrawSubmit(payload: BudgetDrawPayload) {
  try {
    const record = await budgetDrawApi.draw(payload);
    drawModalRef.value?.showResult(record);
    message.success('抽取完成，结果已公示');
    await loadData();
  } catch (err) {
    drawModalRef.value?.showError();
    message.error(err instanceof Error ? err.message : '抽取失败');
  }
}

function onPageChange(page: number, pageSize: number) {
  pagination.current = page;
  pagination.pageSize = pageSize;
}
</script>

<template>
  <div>
    <div class="page-header page-header--with-action">
      <div>
        <h1 class="page-header__title">概算单位随机抽取</h1>
        <p class="page-header__desc">展示历史抽取公示结果，支持随机抽取概算单位并公示</p>
      </div>
      <a-button type="primary" @click="openDraw">
        <template #icon><GiftOutlined /></template>
        随机抽取
      </a-button>
    </div>

    <div class="table-wrap">
      <das-search-bar
        class="search-bar"
        :model="searchForm"
        :columns="2"
        @search="handleSearch"
        @reset="handleReset"
      >
        <a-form-item label="项目名称" name="projectName">
          <a-input
            v-model:value="searchForm.projectName"
            placeholder="请输入项目名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="中签单位" name="winnerUnit">
          <a-select
            v-model:value="searchForm.winnerUnit"
            allow-clear
            show-search
            placeholder="全部"
            :options="winnerOptions"
            :filter-option="filterWinnerOption"
          />
        </a-form-item>
      </das-search-bar>

      <a-spin :spinning="loading">
        <div v-if="pagedData.length" class="publicity-list">
          <PublicityCard
            v-for="record in pagedData"
            :key="record.id"
            :record="record"
          />
        </div>
        <a-empty
          v-else-if="!loading"
          class="publicity-empty"
          :description="hasFilter ? '未找到匹配的公示记录' : '暂无公示记录，点击右上角「随机抽取」开始'"
        />

        <div v-if="filteredData.length > pagination.pageSize" class="publicity-pagination">
          <a-pagination
            v-model:current="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="filteredData.length"
            :page-size-options="['5', '10', '20']"
            show-size-changer
            show-quick-jumper
            :show-total="(total: number) => `共 ${total} 条公示记录`"
            @change="onPageChange"
            @show-size-change="onPageChange"
          />
        </div>
      </a-spin>
    </div>

    <DrawModal
      ref="drawModalRef"
      v-model:open="drawOpen"
      :units="units"
      @submit="handleDrawSubmit"
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

.search-bar {
  margin-bottom: 16px;
}

.publicity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.publicity-empty {
  padding: 48px 0;
}

.publicity-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
