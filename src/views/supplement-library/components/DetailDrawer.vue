<script setup lang="ts">
import {
  SUPPLEMENT_LIBRARY_STATUS_LABEL,
  getSupplementLibraryStatusColor,
  type SupplementLibraryItem
} from '@/types/supplement-library';

defineProps<{
  open: boolean;
  record: SupplementLibraryItem | null;
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

function authorityText(record: SupplementLibraryItem) {
  if (record.codingAuthority === '__other__') {
    return record.codingAuthorityOther || '其他';
  }
  return record.codingAuthority || '—';
}

function natureText(record: SupplementLibraryItem) {
  if (record.constructionNature === '__other__') {
    return record.constructionNatureOther || '其他';
  }
  return record.constructionNature || '—';
}
</script>

<template>
  <a-drawer :open="open" title="项目增补详情" :width="780" destroy-on-close @close="close">
    <template v-if="record">
      <a-space style="margin-bottom: 12px">
        <a-tag :color="getSupplementLibraryStatusColor(record.status)">
          {{ SUPPLEMENT_LIBRARY_STATUS_LABEL[record.status] }}
        </a-tag>
        <span>申报人：{{ record.applicant }}（{{ record.applicantUnit }}）</span>
      </a-space>

      <a-descriptions title="业主信息" bordered size="small" :column="2">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="是否有关联子项目">
          {{ yn(record.hasRelatedSubProjects) }}
        </a-descriptions-item>
        <a-descriptions-item label="子项目代码">
          {{
            record.hasRelatedSubProjects
              ? record.subProjectCodes?.length
                ? record.subProjectCodes.join('、')
                : '—'
              : '—'
          }}
        </a-descriptions-item>
        <a-descriptions-item label="项目代码">{{ record.projectCode || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目属地">{{ record.territory }}</a-descriptions-item>
        <a-descriptions-item label="项目单位名称" :span="2">{{ record.unitName }}</a-descriptions-item>
        <a-descriptions-item label="证照号码">{{ record.unitLicenseNo }}</a-descriptions-item>
        <a-descriptions-item label="责任单位">{{ record.responsibleUnits.join('、') }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{ record.contactName }} / {{ record.contactPhone }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ record.leaderName }} / {{ record.leaderPhone }}</a-descriptions-item>
        <a-descriptions-item label="项目属性">{{ record.projectAttribute }}</a-descriptions-item>
        <a-descriptions-item label="项目类别">{{ record.projectCategory }}</a-descriptions-item>
        <a-descriptions-item label="立项类型">{{ record.approvalType }}</a-descriptions-item>
        <a-descriptions-item label="项目类型">{{ record.projectType }}</a-descriptions-item>
        <a-descriptions-item label="项目来源">{{ record.projectSources.join('、') }}</a-descriptions-item>
        <a-descriptions-item label="项目套餐">{{ record.projectPackage }}</a-descriptions-item>
        <a-descriptions-item label="备案类别">{{ record.filingCategory || '—' }}</a-descriptions-item>
        <a-descriptions-item label="备案时间">{{ record.filingDate }}</a-descriptions-item>
        <a-descriptions-item label="赋码机关">{{ authorityText(record) }}</a-descriptions-item>
        <a-descriptions-item label="赋码时间">{{ record.codingDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="是否承诺制">{{ yn(record.isCommitment) }}</a-descriptions-item>
        <a-descriptions-item label="是否补码项目">{{ yn(record.isComplementCode) }}</a-descriptions-item>
        <a-descriptions-item label="国标行业" :span="2">{{ record.nationalIndustry }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="建筑信息" bordered size="small" :column="2" style="margin-top: 16px">
        <a-descriptions-item label="建设地点">{{ record.constructionSite }}</a-descriptions-item>
        <a-descriptions-item label="建设性质">{{ natureText(record) }}</a-descriptions-item>
        <a-descriptions-item label="详细地址" :span="2">{{ record.constructionAddress }}</a-descriptions-item>
        <a-descriptions-item label="建设规模及内容" :span="2">{{ record.constructionScale }}</a-descriptions-item>
        <a-descriptions-item label="拟开工">{{ record.proposedStartDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="拟建成">{{ record.proposedEndDate || '—' }}</a-descriptions-item>
        <a-descriptions-item label="地上建筑面积">{{ record.abovegroundArea ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="总建筑面积（亩）">{{ record.totalBuildingArea ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="新增建筑面积（亩）">{{ record.newBuildingArea ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="需施工许可证">{{ yn(record.needConstructionPermit) }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="资金信息（万元）" bordered size="small" :column="2" style="margin-top: 16px">
        <a-descriptions-item label="总投资">{{ record.totalInvestment ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="固定资产投资">{{ record.fixedAssetInvestment ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="自有资金">{{ record.ownFunds ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="设备购置费">{{ record.equipmentCost ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="资金来源">{{ record.fundSource ?? '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions title="土地信息" bordered size="small" :column="2" style="margin-top: 16px">
        <a-descriptions-item label="总用地面积（亩）">{{ record.totalLandArea ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="新增建设用地（亩）">{{ record.newConstructionLand ?? '—' }}</a-descriptions-item>
        <a-descriptions-item label="含新增建设用地">{{ yn(record.includeNewLand) }}</a-descriptions-item>
        <a-descriptions-item label="是否标准地">{{ yn(record.isStandardLand) }}</a-descriptions-item>
        <a-descriptions-item label="土地证书编号" :span="2">{{ record.ownLandCertNo }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions
        v-if="record.firstAuditOpinion || record.finalAuditOpinion"
        title="审核信息"
        bordered
        size="small"
        :column="1"
        style="margin-top: 16px"
      >
        <a-descriptions-item v-if="record.firstAuditOpinion" label="初审意见">
          {{ record.firstAuditedBy }} · {{ record.firstAuditedAt }}：{{ record.firstAuditOpinion }}
        </a-descriptions-item>
        <a-descriptions-item v-if="record.finalAuditOpinion" label="终审意见">
          {{ record.finalAuditedBy }} · {{ record.finalAuditedAt }}：{{ record.finalAuditOpinion }}
        </a-descriptions-item>
      </a-descriptions>
    </template>
  </a-drawer>
</template>
