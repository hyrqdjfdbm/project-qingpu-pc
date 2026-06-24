<script setup lang="ts">
import { computed } from 'vue';
import type { SupplementProjectItem } from '@/types/supplement-pool';
import {
  CONSTRUCTION_NATURE_LABEL,
  POOL_STAGE_LABEL,
  PROJECT_ATTRIBUTE_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  SUB_PROJECT_OPTIONS
} from '@/types/supplement-pool';

const props = defineProps<{
  open: boolean;
  record: SupplementProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const subProjectLabels = computed(() => {
  if (!props.record?.subProjects?.length) return '—';
  return props.record.subProjects
    .map((id) => SUB_PROJECT_OPTIONS.find((o) => o.value === id)?.label || id)
    .join('、');
});

function close() {
  emit('update:open', false);
}

function label(key: string, value: string | undefined) {
  if (!value) return '—';
  const maps: Record<string, Record<string, string>> = {
    projectType: PROJECT_TYPE_LABEL,
    projectAttribute: PROJECT_ATTRIBUTE_LABEL,
    projectCategory: PROJECT_CATEGORY_LABEL,
    constructionNature: CONSTRUCTION_NATURE_LABEL,
    status: PROJECT_STATUS_LABEL
  };
  return maps[key]?.[value] ?? value;
}
</script>

<template>
  <a-modal
    :open="open"
    title="项目详情"
    :width="800"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <div v-if="record" class="detail-modal-body">
      <div class="declared-by-bar">
        <span class="declared-by-bar__label">申报人</span>
        <span class="declared-by-bar__value">{{ record.declaredBy || '—' }}</span>
      </div>

      <a-descriptions title="基本信息" :column="2" bordered size="small">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目简称">{{ record.projectAbbr || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目代码">{{ record.projectCode }}</a-descriptions-item>
        <a-descriptions-item label="项目类型">{{ label('projectType', record.projectType) }}</a-descriptions-item>
        <a-descriptions-item label="项目属地">{{ record.projectLocation }}</a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">{{ record.totalInvestment?.toFixed(2) }}</a-descriptions-item>
        <a-descriptions-item label="项目状态">{{ label('status', record.status) }}</a-descriptions-item>
        <a-descriptions-item label="责任单位" :span="2">{{ record.responsibleUnits.join('、') }}</a-descriptions-item>
        <a-descriptions-item label="所属库">{{ POOL_STAGE_LABEL[record.poolStage] }}</a-descriptions-item>
        <a-descriptions-item v-if="record.progressPercent != null" label="投资完成率">
          {{ record.progressPercent }}%
        </a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="业主信息" :column="2" bordered size="small" class="detail-section">
        <a-descriptions-item label="项目单位名称" :span="2">{{ record.unitName }}</a-descriptions-item>
        <a-descriptions-item label="项目属性">{{ label('projectAttribute', record.projectAttribute) }}</a-descriptions-item>
        <a-descriptions-item label="项目类别">{{ label('projectCategory', record.projectCategory) }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="建筑信息" :column="2" bordered size="small" class="detail-section">
        <a-descriptions-item label="建设地点">{{ record.constructionSite }}</a-descriptions-item>
        <a-descriptions-item label="建设性质">{{ label('constructionNature', record.constructionNature) }}</a-descriptions-item>
        <a-descriptions-item label="详细建设地址" :span="2">{{ record.constructionAddress }}</a-descriptions-item>
        <a-descriptions-item label="建设规模及内容" :span="2">{{ record.constructionScale }}</a-descriptions-item>
        <a-descriptions-item label="建设进度">{{ record.constructionProgress || '—' }}</a-descriptions-item>
        <a-descriptions-item label="施工许可证">
          {{ record.needConstructionPermit ? '需要' : '不需要' }}
        </a-descriptions-item>
        <a-descriptions-item label="拟开工时间">{{ record.proposedStartDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="拟建成时间">{{ record.proposedEndDate || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="土地及其他" :column="2" bordered size="small" class="detail-section">
        <a-descriptions-item label="土地证书编号" :span="2">{{ record.landCertificateNo || '—' }}</a-descriptions-item>
        <a-descriptions-item label="子项目" :span="2">{{ subProjectLabels }}</a-descriptions-item>
        <a-descriptions-item v-if="record.schemeCompleteDate" label="形成方案完成时间">
          {{ record.schemeCompleteDate }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.planningCompleteDate" label="规划落地完成时间">
          {{ record.planningCompleteDate }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.proposalApprovalDate" label="项建书批复完成时间" :span="2">
          {{ record.proposalApprovalDate }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.auditRemark" label="审核意见" :span="2">
          {{ record.auditRemark }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </a-modal>
</template>

<style scoped>
.detail-modal-body {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 4px;
}

.declared-by-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--color-bg-layout);
}

.declared-by-bar__label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.declared-by-bar__value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.detail-section {
  margin-top: 16px;
}
</style>
