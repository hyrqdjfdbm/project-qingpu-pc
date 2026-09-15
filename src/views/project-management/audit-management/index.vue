<script setup lang="ts">
import { Button } from 'ant-design-vue';
import type { TableColumnType } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { computed, h, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { progressFundReportApi } from '@/api/progress-fund-report';
import type {
  AuditPayload,
  PendingAuditItem,
  PendingAuditScope,
  ProgressFundAuditStats
} from '@/types/progress-fund-report';
import AuditModal from '@/views/project-management/progress-fund-report/components/AuditModal.vue';

const router = useRouter();
const activeTab = ref<PendingAuditScope>('image');
const loading = ref(false);
const tableData = ref<PendingAuditItem[]>([]);
const stats = ref<ProgressFundAuditStats>({ pendingProjects: 0, pendingRecords: 0, todayAudited: 0 });
const searchForm = reactive({ keyword: '' });
const pagination = reactive({ current: 1, pageSize: 10 });

const auditOpen = ref(false);
const auditTitle = ref('审核');
const auditPayload = ref<Omit<AuditPayload, 'passed' | 'comment'> | null>(null);

const columns = computed<TableColumnType[]>(() => {
  const cols: TableColumnType[] = [
    { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 240, ellipsis: true },
    { title: '项目代码', dataIndex: 'projectCode', key: 'projectCode', width: 150 },
    { title: '责任单位', dataIndex: 'responsibleUnit', key: 'responsibleUnit', width: 160, ellipsis: true }
  ];
  if (activeTab.value === 'superior') {
    cols.push({ title: '上级资金政策', dataIndex: 'policyLabel', key: 'policyLabel', width: 120 });
  }
  cols.push(
    { title: '填报类型', dataIndex: 'kindLabel', key: 'kindLabel', width: 150 },
    { title: '填报周期', dataIndex: 'periodLabel', key: 'periodLabel', width: 180 },
    { title: '填报人', dataIndex: 'submittedBy', key: 'submittedBy', width: 90 },
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt', width: 170 },
    {
      title: '操作',
      key: 'operation',
      width: 140,
      fixed: 'right',
      customRender: (opt: { record?: PendingAuditItem }) => {
        const record = opt?.record;
        if (!record) return '';
        return h('span', [
          h(
            Button,
            { type: 'link', size: 'small', onClick: () => goDetail(record) },
            { default: () => '查看' }
          ),
          h(
            Button,
            { type: 'link', size: 'small', onClick: () => openAudit(record) },
            { default: () => '审核' }
          )
        ]);
      }
    }
  );
  return cols;
});

const pagedData = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize;
  return tableData.value.slice(start, start + pagination.pageSize);
});

async function loadList() {
  loading.value = true;
  try {
    const [rows, nextStats] = await Promise.all([
      progressFundReportApi.listPending(activeTab.value),
      progressFundReportApi.auditStats(activeTab.value)
    ]);
    const keyword = searchForm.keyword.trim();
    tableData.value = keyword
      ? rows.filter(
          (row) =>
            row.projectName.includes(keyword) ||
            row.projectCode.includes(keyword) ||
            row.responsibleUnit.includes(keyword)
        )
      : rows;
    stats.value = nextStats;
    pagination.current = 1;
  } finally {
    loading.value = false;
  }
}

onMounted(loadList);
watch(activeTab, loadList);

function handleSearch() {
  loadList();
}

function handleReset() {
  searchForm.keyword = '';
  loadList();
}

function goDetail(row: PendingAuditItem) {
  const tab = row.kind.startsWith('superior') ? 'fund' : 'image';
  router.push(`/project-management/implementation-pool/${row.projectId}?tab=${tab}`);
}

function openAudit(row: PendingAuditItem) {
  if (!row?.projectId) return;
  auditTitle.value = `审核${row.kindLabel}`;
  auditPayload.value = {
    projectId: row.projectId,
    kind: row.kind,
    year: row.year,
    month: row.month,
    week: row.week,
    policy: row.policy
  };
  auditOpen.value = true;
}

async function handleAudit(result: { passed: boolean; comment?: string }) {
  if (!auditPayload.value) return;
  await progressFundReportApi.audit({ ...auditPayload.value, ...result });
  message.success(result.passed ? '审核已通过' : '已退回');
  await loadList();
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">审核管理</h1>
      <p class="page-header__desc">审核项目进度目标和完成情况、上级资金下达与使用计划。填报在实施库项目详情中进行。</p>
    </div>

    <a-row :gutter="16" class="stat-row">
      <a-col :span="8">
        <a-card :bordered="false">
          <a-statistic title="待审核项目" :value="stats.pendingProjects" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card :bordered="false">
          <a-statistic title="待审核记录" :value="stats.pendingRecords" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card :bordered="false">
          <a-statistic title="今日已审核" :value="stats.todayAudited" />
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="image" tab="项目进度审核" />
        <a-tab-pane key="superior" tab="上级资金审核" />
      </a-tabs>

      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="关键字">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="项目名称 / 代码 / 责任单位"
            allow-clear
            style="width: 240px"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">查询</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>

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
        :scroll="{ x: activeTab === 'superior' ? 1320 : 1200 }"
        :locale="{ emptyText: '暂无数据' }"
        @change="
          (pag) => {
            pagination.current = pag.current ?? 1;
            pagination.pageSize = pag.pageSize ?? 10;
          }
        "
      />
    </a-card>

    <AuditModal v-model:open="auditOpen" :title="auditTitle" @submit="handleAudit" />
  </div>
</template>

<style scoped>
.stat-row {
  margin-bottom: 16px;
}
.search-form {
  margin-bottom: 16px;
}
</style>
