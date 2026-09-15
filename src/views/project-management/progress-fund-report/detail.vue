<script setup lang="ts">
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FundOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import type { TableColumnType } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { progressFundReportApi } from '@/api/progress-fund-report';
import {
  canAuditProgressFund,
  canFillProgressFund,
  currentUserVersion,
  getCurrentUser
} from '@/mock/current-user';
import type {
  AuditKind,
  AuditPayload,
  AuditStatus,
  ProgressFundProject,
  SuperiorPolicyKey
} from '@/types/progress-fund-report';
import {
  AUDIT_STATUS_COLOR,
  AUDIT_STATUS_LABEL,
  getWeekInfo,
  SUPERIOR_POLICY_LABEL
} from '@/types/progress-fund-report';
import { getWeekLabel } from '@/types/image-progress-completion';
import AuditModal from './components/AuditModal.vue';
import ImageMonthlyModal from './components/ImageMonthlyModal.vue';
import ImageWeeklyModal from './components/ImageWeeklyModal.vue';
import ImageYearModal from './components/ImageYearModal.vue';
import SuperiorWeeklyModal from './components/SuperiorWeeklyModal.vue';
import SuperiorYearModal from './components/SuperiorYearModal.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const project = ref<ProgressFundProject | null>(null);
const activeTab = ref<'image' | 'superior'>((route.query.tab as 'image' | 'superior') || 'image');
const policyTab = ref<SuperiorPolicyKey>('specialBond');

const imageYearOpen = ref(false);
const imageMonthlyOpen = ref(false);
const imageWeeklyOpen = ref(false);
const superiorYearOpen = ref(false);
const superiorWeeklyOpen = ref(false);
const auditOpen = ref(false);
const auditTitle = ref('审核');
const auditPayload = ref<Omit<AuditPayload, 'passed' | 'comment'> | null>(null);

const canFill = computed(() => {
  currentUserVersion.value;
  return canFillProgressFund(getCurrentUser().role);
});
const canAudit = computed(() => {
  currentUserVersion.value;
  return canAuditProgressFund(getCurrentUser().role);
});
const thisWeek = getWeekInfo();

function tagStatus(status?: AuditStatus): AuditStatus {
  return status ?? 'none';
}

const monthColumns: TableColumnType[] = [
  { title: '月份', key: 'month', width: 90 },
  { title: '资金目标（万元）', key: 'fundTarget', width: 140, align: 'right' },
  { title: '资金完成（万元）', key: 'completed', width: 140, align: 'right' },
  { title: '累计完成（万元）', key: 'cumulative', width: 140, align: 'right' },
  { title: '审核状态', key: 'status', width: 110 },
  { title: '操作', key: 'operation', width: 100, fixed: 'right' }
];

const weekColumns: TableColumnType[] = [
  { title: '周次', key: 'week', width: 220 },
  { title: '完成情况', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '完成比例', key: 'pct', width: 100, align: 'right' },
  { title: '填报人', dataIndex: 'submittedBy', key: 'submittedBy', width: 90 },
  { title: '审核状态', key: 'status', width: 110 },
  { title: '操作', key: 'operation', width: 100, fixed: 'right' }
];

const superiorWeekColumns: TableColumnType[] = [
  { title: '周次', key: 'week', width: 220 },
  { title: '本周完成（万元）', key: 'completed', width: 140, align: 'right' },
  { title: '累计完成（万元）', key: 'cumulative', width: 140, align: 'right' },
  { title: '填报人', dataIndex: 'submittedBy', key: 'submittedBy', width: 90 },
  { title: '审核状态', key: 'status', width: 110 },
  { title: '操作', key: 'operation', width: 100, fixed: 'right' }
];

const monthlyRows = computed(() => {
  if (!project.value) return [];
  const year = new Date().getFullYear();
  const targets = project.value.imageYearTarget?.monthlyTargets ?? [];
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const target = targets.find((t) => t.month === month);
    const fund = project.value!.imageMonthlyFunds.find((r) => r.year === year && r.month === month);
    return {
      month,
      fundTarget: target?.fundTarget,
      imageTarget: target?.imageProgressTarget,
      completed: fund?.completedAmount,
      cumulative: fund?.cumulativeAmount,
      status: tagStatus(fund?.status),
      pending: fund?.status === 'pending'
    };
  });
});

const sortedImageWeeks = computed(() => {
  if (!project.value) return [];
  return [...project.value.imageWeeklyReports].sort((a, b) => b.week - a.week);
});

const currentPolicy = computed(() => project.value?.superior[policyTab.value]);

const sortedSuperiorWeeks = computed(() => {
  if (!currentPolicy.value) return [];
  return [...currentPolicy.value.weeklyReports].sort((a, b) => b.week - a.week);
});

async function loadDetail() {
  loading.value = true;
  try {
    project.value = await progressFundReportApi.getById(String(route.params.id));
  } catch {
    message.error('项目不存在');
    router.replace('/project-management/progress-fund-report');
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);

function goBack() {
  router.push('/project-management/progress-fund-report');
}

function openAudit(title: string, payload: Omit<AuditPayload, 'passed' | 'comment'>) {
  auditTitle.value = title;
  auditPayload.value = payload;
  auditOpen.value = true;
}

async function handleAudit(result: { passed: boolean; comment?: string }) {
  if (!auditPayload.value) return;
  await progressFundReportApi.audit({ ...auditPayload.value, ...result });
  message.success(result.passed ? '审核已通过' : '已退回');
  await loadDetail();
}

function canAuditKind(status?: AuditStatus) {
  return canAudit.value && status === 'pending';
}
</script>

<template>
  <div>
    <div class="page-header page-header--with-action">
      <div>
        <a-button type="link" class="back-btn" @click="goBack">
          <ArrowLeftOutlined /> 返回列表
        </a-button>
        <h1 class="page-header__title">{{ project?.projectName || '形象进度与上级资金' }}</h1>
        <p class="page-header__desc">填报后提交审核；退回后可修改再报。</p>
      </div>
    </div>

    <a-spin :spinning="loading">
      <template v-if="project">
        <a-card title="项目基本信息" :bordered="false">
          <a-descriptions bordered size="small" :column="2">
            <a-descriptions-item label="项目代码">{{ project.projectCode }}</a-descriptions-item>
            <a-descriptions-item label="当前阶段">{{ project.currentStage }}</a-descriptions-item>
            <a-descriptions-item label="责任单位">{{ project.responsibleUnit }}</a-descriptions-item>
            <a-descriptions-item label="施工单位">{{ project.constructionUnit }}</a-descriptions-item>
            <a-descriptions-item label="总投资（亿元）">{{ project.totalInvestment }}</a-descriptions-item>
            <a-descriptions-item label="当前周次">
              {{ thisWeek.year }}年第{{ thisWeek.week }}周
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card :bordered="false" style="margin-top: 16px">
          <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane key="image" tab="形象进度">
              <div class="toolbar">
                <a-space wrap v-if="canFill">
                  <a-button type="primary" @click="imageYearOpen = true">
                    <template #icon><PlusOutlined /></template>
                    年初目标填报
                  </a-button>
                  <a-button @click="imageMonthlyOpen = true">
                    <template #icon><FundOutlined /></template>
                    月度资金完成
                  </a-button>
                  <a-button @click="imageWeeklyOpen = true">
                    <template #icon><CalendarOutlined /></template>
                    周进度完成
                  </a-button>
                </a-space>
              </div>

              <a-card size="small" title="年度目标" class="inner-card">
                <template #extra>
                  <a-tag :color="AUDIT_STATUS_COLOR[tagStatus(project.imageYearTarget?.status)]">
                    {{ AUDIT_STATUS_LABEL[tagStatus(project.imageYearTarget?.status)] }}
                  </a-tag>
                  <a-button
                    v-if="canAuditKind(project.imageYearTarget?.status)"
                    type="link"
                    size="small"
                    @click="
                      openAudit('审核形象进度年度目标', {
                        projectId: project.id,
                        kind: 'imageYear' as AuditKind
                      })
                    "
                  >
                    审核
                  </a-button>
                </template>
                <template v-if="project.imageYearTarget">
                  <a-descriptions bordered size="small" :column="1">
                    <a-descriptions-item label="年度资金目标（万元）">
                      {{ project.imageYearTarget.fundTarget.toLocaleString() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="年度形象进度目标">
                      {{ project.imageYearTarget.imageProgressTarget }}
                    </a-descriptions-item>
                    <a-descriptions-item label="填报人">
                      {{ project.imageYearTarget.submittedBy }} · {{ project.imageYearTarget.submittedAt }}
                    </a-descriptions-item>
                    <a-descriptions-item v-if="project.imageYearTarget.auditor" label="审核人">
                      {{ project.imageYearTarget.auditor }} · {{ project.imageYearTarget.auditedAt }}
                      <span v-if="project.imageYearTarget.auditComment">
                        （{{ project.imageYearTarget.auditComment }}）
                      </span>
                    </a-descriptions-item>
                  </a-descriptions>
                </template>
                <div v-else class="empty-tip">尚未填报年度目标</div>
              </a-card>

              <a-card size="small" title="各月资金完成" class="inner-card">
                <a-table
                  :columns="monthColumns"
                  :data-source="monthlyRows"
                  row-key="month"
                  :pagination="false"
                  size="middle"
                >
                  <template #bodyCell="{ column, record: row }">
                    <template v-if="column.key === 'month'">{{ row.month }}月</template>
                    <template v-else-if="column.key === 'fundTarget'">
                      {{ row.fundTarget != null ? row.fundTarget.toLocaleString() : '—' }}
                    </template>
                    <template v-else-if="column.key === 'completed'">
                      {{ row.completed != null ? row.completed.toLocaleString() : '—' }}
                    </template>
                    <template v-else-if="column.key === 'cumulative'">
                      {{ row.cumulative != null ? row.cumulative.toLocaleString() : '—' }}
                    </template>
                    <template v-else-if="column.key === 'status'">
                      <a-tag :color="AUDIT_STATUS_COLOR[row.status]">{{ AUDIT_STATUS_LABEL[row.status] }}</a-tag>
                    </template>
                    <template v-else-if="column.key === 'operation'">
                      <a-button
                        v-if="canAuditKind(row.status)"
                        type="link"
                        size="small"
                        @click="
                          openAudit(`审核${row.month}月资金完成`, {
                            projectId: project.id,
                            kind: 'imageMonthly',
                            year: new Date().getFullYear(),
                            month: row.month
                          })
                        "
                      >
                        审核
                      </a-button>
                      <span v-else class="empty-tip">—</span>
                    </template>
                  </template>
                </a-table>
              </a-card>

              <a-card size="small" title="周形象进度" class="inner-card">
                <a-table
                  v-if="sortedImageWeeks.length"
                  :columns="weekColumns"
                  :data-source="sortedImageWeeks"
                  row-key="id"
                  :pagination="false"
                  size="middle"
                >
                  <template #bodyCell="{ column, record: row }">
                    <template v-if="column.key === 'week'">
                      {{ getWeekLabel(row.year, row.week, row.weekStart, row.weekEnd) }}
                    </template>
                    <template v-else-if="column.key === 'pct'">
                      {{ row.progressPercent != null ? `${row.progressPercent}%` : '—' }}
                    </template>
                    <template v-else-if="column.key === 'status'">
                      <a-tag :color="AUDIT_STATUS_COLOR[tagStatus(row.status)]">
                        {{ AUDIT_STATUS_LABEL[tagStatus(row.status)] }}
                      </a-tag>
                    </template>
                    <template v-else-if="column.key === 'operation'">
                      <a-button
                        v-if="canAuditKind(row.status)"
                        type="link"
                        size="small"
                        @click="
                          openAudit('审核周形象进度', {
                            projectId: project.id,
                            kind: 'imageWeekly',
                            year: row.year,
                            week: row.week
                          })
                        "
                      >
                        审核
                      </a-button>
                      <span v-else class="empty-tip">—</span>
                    </template>
                  </template>
                </a-table>
                <div v-else class="empty-tip">暂无周进度填报</div>
              </a-card>
            </a-tab-pane>

            <a-tab-pane key="superior" tab="上级资金">
              <a-tabs v-model:activeKey="policyTab" size="small">
                <a-tab-pane v-for="(label, key) in SUPERIOR_POLICY_LABEL" :key="key" :tab="label" />
              </a-tabs>
              <div class="toolbar">
                <a-space wrap v-if="canFill">
                  <a-button type="primary" @click="superiorYearOpen = true">
                    <template #icon><PlusOutlined /></template>
                    年初资金目标
                  </a-button>
                  <a-button @click="superiorWeeklyOpen = true">
                    <template #icon><CalendarOutlined /></template>
                    周资金完成
                  </a-button>
                </a-space>
              </div>

              <a-card size="small" :title="`${SUPERIOR_POLICY_LABEL[policyTab]}年度目标`" class="inner-card">
                <template #extra>
                  <a-tag :color="AUDIT_STATUS_COLOR[tagStatus(currentPolicy?.yearTarget?.status)]">
                    {{ AUDIT_STATUS_LABEL[tagStatus(currentPolicy?.yearTarget?.status)] }}
                  </a-tag>
                  <a-button
                    v-if="canAuditKind(currentPolicy?.yearTarget?.status)"
                    type="link"
                    size="small"
                    @click="
                      openAudit(`审核${SUPERIOR_POLICY_LABEL[policyTab]}年度目标`, {
                        projectId: project.id,
                        kind: 'superiorYear',
                        policy: policyTab
                      })
                    "
                  >
                    审核
                  </a-button>
                </template>
                <template v-if="currentPolicy?.yearTarget">
                  <a-descriptions bordered size="small" :column="1">
                    <a-descriptions-item label="年度资金目标（万元）">
                      {{ currentPolicy.yearTarget.annualTarget.toLocaleString() }}
                    </a-descriptions-item>
                    <a-descriptions-item label="填报人">
                      {{ currentPolicy.yearTarget.submittedBy }} · {{ currentPolicy.yearTarget.submittedAt }}
                    </a-descriptions-item>
                    <a-descriptions-item v-if="currentPolicy.yearTarget.auditor" label="审核人">
                      {{ currentPolicy.yearTarget.auditor }} · {{ currentPolicy.yearTarget.auditedAt }}
                      <span v-if="currentPolicy.yearTarget.auditComment">
                        （{{ currentPolicy.yearTarget.auditComment }}）
                      </span>
                    </a-descriptions-item>
                  </a-descriptions>
                </template>
                <div v-else class="empty-tip">尚未填报该类型年度资金目标</div>
              </a-card>

              <a-card size="small" :title="`${SUPERIOR_POLICY_LABEL[policyTab]}周资金完成`" class="inner-card">
                <a-table
                  v-if="sortedSuperiorWeeks.length"
                  :columns="superiorWeekColumns"
                  :data-source="sortedSuperiorWeeks"
                  row-key="id"
                  :pagination="false"
                  size="middle"
                >
                  <template #bodyCell="{ column, record: row }">
                    <template v-if="column.key === 'week'">
                      {{ getWeekLabel(row.year, row.week, row.weekStart, row.weekEnd) }}
                    </template>
                    <template v-else-if="column.key === 'completed'">
                      {{ row.completedAmount.toLocaleString() }}
                    </template>
                    <template v-else-if="column.key === 'cumulative'">
                      {{ row.cumulativeAmount.toLocaleString() }}
                    </template>
                    <template v-else-if="column.key === 'status'">
                      <a-tag :color="AUDIT_STATUS_COLOR[tagStatus(row.status)]">
                        {{ AUDIT_STATUS_LABEL[tagStatus(row.status)] }}
                      </a-tag>
                    </template>
                    <template v-else-if="column.key === 'operation'">
                      <a-button
                        v-if="canAuditKind(row.status)"
                        type="link"
                        size="small"
                        @click="
                          openAudit(`审核${SUPERIOR_POLICY_LABEL[policyTab]}周资金`, {
                            projectId: project.id,
                            kind: 'superiorWeekly',
                            policy: policyTab,
                            year: row.year,
                            week: row.week
                          })
                        "
                      >
                        审核
                      </a-button>
                      <span v-else class="empty-tip">—</span>
                    </template>
                  </template>
                </a-table>
                <div v-else class="empty-tip">暂无周资金填报</div>
              </a-card>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </template>
    </a-spin>

    <ImageYearModal v-model:open="imageYearOpen" :project-id="project?.id" @saved="loadDetail" />
    <ImageMonthlyModal v-model:open="imageMonthlyOpen" :project-id="project?.id" @saved="loadDetail" />
    <ImageWeeklyModal v-model:open="imageWeeklyOpen" :project-id="project?.id" @saved="loadDetail" />
    <SuperiorYearModal
      v-model:open="superiorYearOpen"
      :project-id="project?.id"
      :policy="policyTab"
      @saved="loadDetail"
    />
    <SuperiorWeeklyModal
      v-model:open="superiorWeeklyOpen"
      :project-id="project?.id"
      :policy="policyTab"
      @saved="loadDetail"
    />
    <AuditModal v-model:open="auditOpen" :title="auditTitle" @submit="handleAudit" />
  </div>
</template>

<style scoped>
.page-header--with-action {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.back-btn {
  padding-left: 0;
  margin-bottom: 4px;
}
.toolbar {
  margin-bottom: 12px;
}
.inner-card {
  margin-bottom: 16px;
}
.empty-tip {
  font-size: 13px;
  color: var(--color-text-secondary, #8c8c8c);
}
</style>
