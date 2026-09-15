<script setup lang="ts">
import {
  QINGPU_AUDIT_CHANNEL_LABEL,
  QINGPU_SUPPLEMENT_STATUS_LABEL,
  getQingpuSupplementStatusColor,
  isSocialInvestmentCategory,
  type QingpuSupplementItem
} from '@/types/qingpu-supplement';

defineProps<{
  open: boolean;
  record: QingpuSupplementItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

function close() {
  emit('update:open', false);
}

function yn(v: boolean | undefined) {
  if (v === undefined) return '—';
  return v ? '是' : '否';
}
</script>

<template>
  <a-drawer :open="open" title="项目增补详情" :width="760" destroy-on-close @close="close">
    <template v-if="record">
      <a-space class="status-row">
        <a-tag :color="getQingpuSupplementStatusColor(record.status)">
          {{ QINGPU_SUPPLEMENT_STATUS_LABEL[record.status] }}
        </a-tag>
        <span>审核通道：{{ QINGPU_AUDIT_CHANNEL_LABEL[record.auditChannel] }}</span>
      </a-space>
      <p class="meta">申报人：{{ record.applicant }}（{{ record.applicantUnit }}）　申请时间：{{ record.submittedAt }}</p>

      <a-descriptions title="业主信息" bordered size="small" :column="2">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目代码">{{ record.projectCode || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目层级">{{ record.projectLevel }}</a-descriptions-item>
        <a-descriptions-item v-if="record.projectLevel === '主项目'" label="是否有关联子项目">
          {{ yn(record.hasRelatedSubProjects) }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.hasRelatedSubProjects" label="子项目代码" :span="2">
          {{ record.subProjectCodes?.length ? record.subProjectCodes.join('、') : '—' }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.projectLevel === '子项目'" label="关联主项目" :span="2">
          {{ record.relatedParentProjectCode || '—' }}
        </a-descriptions-item>
        <a-descriptions-item label="项目单位名称" :span="2">{{ record.unitName }}</a-descriptions-item>
        <a-descriptions-item label="项目状态">{{ record.projectStatus || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目属地">{{ record.territory }}</a-descriptions-item>
        <a-descriptions-item label="责任单位" :span="2">
          {{ record.responsibleUnits.join('、') }}
        </a-descriptions-item>
        <a-descriptions-item label="代建单位">{{ record.agencyUnit || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目属性">{{ record.projectAttribute }}</a-descriptions-item>
        <a-descriptions-item label="项目类别" :span="2">{{ record.projectCategory }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="建筑信息" bordered size="small" :column="2" class="block">
        <a-descriptions-item label="建设地点">{{ record.constructionSite }}</a-descriptions-item>
        <a-descriptions-item label="建设性质">{{ record.constructionNature }}</a-descriptions-item>
        <a-descriptions-item label="详细建设地址" :span="2">{{ record.constructionAddress }}</a-descriptions-item>
        <a-descriptions-item label="建设规模及内容" :span="2">{{ record.constructionScale }}</a-descriptions-item>
        <a-descriptions-item label="项目进度" :span="2">{{ record.projectProgress || '—' }}</a-descriptions-item>
        <a-descriptions-item label="拟开工时间">{{ record.proposedStartDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="拟建成时间">{{ record.proposedEndDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="是否需领施工许可证">{{ record.needConstructionPermit }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="资金与土地" bordered size="small" :column="2" class="block">
        <a-descriptions-item label="总投资（万元）">{{ record.totalInvestment ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="土地证书编号">{{ record.ownLandCertNo || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="节点信息" bordered size="small" :column="2" class="block">
        <template v-if="isSocialInvestmentCategory(record.projectCategory)">
          <a-descriptions-item label="形象方案完成时间">
            {{ record.imageScheme?.notInvolved ? '—' : record.imageScheme?.completeDate || '—' }}
          </a-descriptions-item>
          <a-descriptions-item label="不涉及此节点">
            {{ record.imageScheme?.notInvolved ? '是' : '否' }}
          </a-descriptions-item>
        </template>
        <template v-else>
          <a-descriptions-item label="项建书完成时间">
            {{ record.proposalDoc?.notInvolved ? '—' : record.proposalDoc?.completeDate || '—' }}
          </a-descriptions-item>
          <a-descriptions-item label="不涉及此节点">
            {{ record.proposalDoc?.notInvolved ? '是' : '否' }}
          </a-descriptions-item>
        </template>
      </a-descriptions>

      <a-descriptions
        v-if="record.auditOpinion || record.revokeReason"
        title="审核 / 撤销"
        bordered
        size="small"
        :column="2"
        class="block"
      >
        <a-descriptions-item v-if="record.auditedBy" label="审核人">{{ record.auditedBy }}</a-descriptions-item>
        <a-descriptions-item v-if="record.auditedAt" label="审核时间">{{ record.auditedAt }}</a-descriptions-item>
        <a-descriptions-item v-if="record.auditOpinion" label="审核意见" :span="2">
          {{ record.auditOpinion }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.revokeReason" label="撤销原因" :span="2">
          {{ record.revokeReason }}
        </a-descriptions-item>
      </a-descriptions>
    </template>
  </a-drawer>
</template>

<style scoped>
.status-row {
  margin-bottom: 8px;
}
.meta {
  margin: 0 0 16px;
  color: var(--color-text-secondary);
  font-size: 13px;
}
.block {
  margin-top: 16px;
}
</style>
