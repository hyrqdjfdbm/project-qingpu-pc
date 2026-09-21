<script setup lang="ts">
import { computed } from 'vue';
import {
  QINGPU_AUDIT_CHANNEL_LABEL,
  QINGPU_SUPPLEMENT_STATUS_LABEL,
  getQingpuSupplementStatusColor,
  isQingpuBelongingMismatch,
  isSocialInvestmentCategory,
  type QingpuSupplementItem
} from '@/types/qingpu-supplement';

type FlowStepStatus = 'done' | 'current' | 'wait' | 'error';

interface FlowStep {
  title: string;
  status: FlowStepStatus;
  operator?: string;
  time?: string;
  remark?: string;
}

const props = defineProps<{
  open: boolean;
  record: QingpuSupplementItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

function close() {
  emit('update:open', false);
}

const auditorLabel = computed(() =>
  props.record ? QINGPU_AUDIT_CHANNEL_LABEL[props.record.auditChannel] : '审核专员'
);

const auditFlow = computed<FlowStep[]>(() => {
  const record = props.record;
  if (!record) return [];

  const auditor = auditorLabel.value;
  const applyStep: FlowStep = {
    title: '项目专员申报',
    status: 'done',
    operator: `${record.applicant}（${record.applicantUnit}）`,
    time: record.submittedAt
  };

  if (record.status === 'pendingReview') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'current',
        operator: auditor,
        remark: '待审核'
      }
    ];
  }

  if (record.status === 'returned') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'error',
        operator: record.auditedBy ? `${record.auditedBy}（${auditor}）` : auditor,
        time: record.auditedAt,
        remark: record.auditOpinion ? `退回：${record.auditOpinion}` : '已退回'
      }
    ];
  }

  if (record.status === 'entered') {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'done',
        operator: record.auditedBy ? `${record.auditedBy}（${auditor}）` : auditor,
        time: record.auditedAt,
        remark: record.auditOpinion
          ? `通过：${record.auditOpinion}`
          : '审核通过，已进入实施库'
      }
    ];
  }

  // revoked
  if (record.auditedAt) {
    return [
      applyStep,
      {
        title: `${auditor}审核`,
        status: 'error',
        operator: record.auditedBy ? `${record.auditedBy}（${auditor}）` : auditor,
        time: record.auditedAt,
        remark: record.auditOpinion ? `退回：${record.auditOpinion}` : '已退回'
      },
      {
        title: '撤销申报',
        status: 'done',
        time: record.updatedAt,
        remark: record.revokeReason || '申报已撤销'
      }
    ];
  }

  return [
    applyStep,
    {
      title: `${auditor}审核`,
      status: 'wait',
      remark: record.revokeReason ? `申报已撤销：${record.revokeReason}` : '申报已撤销，未进入审核'
    }
  ];
});

function stepColor(status: FlowStepStatus) {
  if (status === 'done') return 'green';
  if (status === 'current') return 'blue';
  if (status === 'error') return 'red';
  return 'gray';
}

function stepTag(status: FlowStepStatus) {
  if (status === 'current') return { color: 'blue', text: '当前' };
  if (status === 'error') return { color: 'error', text: '退回' };
  if (status === 'done') return { color: 'success', text: '完成' };
  return { color: 'default', text: '未开始' };
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
      <a-alert
        v-if="record.applicantUnit && record.territory && isQingpuBelongingMismatch(record.applicantUnit, record.territory)"
        type="warning"
        show-icon
        class="mismatch-alert"
        message="申报单位与纳统归属不一致"
        :description="
          record.territory === '区属'
            ? `申报单位为「${record.applicantUnit}」，不属于区属。纳统归属已选「区属」。`
            : `申报单位为「${record.applicantUnit}」，纳统归属为「${record.territory}」。`
        "
      />

      <div class="section-title">基本信息</div>

      <a-descriptions title="业主信息" bordered size="small" :column="2">
        <a-descriptions-item label="项目名称" :span="2">{{ record.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目代码">{{ record.projectCode || '—' }}</a-descriptions-item>
        <a-descriptions-item label="项目单位名称" :span="2">{{ record.unitName }}</a-descriptions-item>
        <a-descriptions-item label="项目状态">{{ record.projectStatus || '—' }}</a-descriptions-item>
        <a-descriptions-item label="纳统归属">{{ record.territory }}</a-descriptions-item>
        <a-descriptions-item label="项目责任单位" :span="2">
          {{ record.responsibleUnits.join('、') }}
        </a-descriptions-item>
        <a-descriptions-item label="项目代建单位">{{ record.agencyUnit || '—' }}</a-descriptions-item>
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
        <a-descriptions-item label="本企业已有土地的土地证书编号">{{ record.ownLandCertNo || '—' }}</a-descriptions-item>
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

      <div class="flow-section">
        <div class="section-title">审核流程</div>
        <a-timeline>
          <a-timeline-item
            v-for="(step, index) in auditFlow"
            :key="index"
            :color="stepColor(step.status)"
          >
            <div class="process-step">
              <div class="process-step__title">
                {{ step.title }}
                <a-tag :color="stepTag(step.status).color" class="process-step__tag">
                  {{ stepTag(step.status).text }}
                </a-tag>
              </div>
              <div v-if="step.operator || step.time" class="process-step__meta">
                <span v-if="step.operator">{{ step.operator }}</span>
                <template v-if="step.operator && step.time">
                  <span>·</span>
                </template>
                <span v-if="step.time">{{ step.time }}</span>
              </div>
              <div v-if="step.remark" class="process-step__remark">{{ step.remark }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
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
.mismatch-alert {
  margin-bottom: 16px;
}
.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.flow-section {
  margin-top: 24px;
}
.process-step__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.process-step__tag {
  margin: 0;
  line-height: 18px;
}
.process-step__meta {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.process-step__remark {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-primary);
}
</style>
