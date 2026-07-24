<script setup lang="ts">
import {
  DEPT_CATEGORY_LABEL,
  INVEST_TYPE_LABEL,
  POLICY_CATEGORY_LABEL,
  RESERVE_DOMAIN_LABEL,
  RESERVE_FLOW_STATUS_LABEL,
  SIX_NET_LABEL,
  getReserveProjectName,
  getReserveStatusColor,
  type ReserveProjectItem
} from '@/types/reserve-pool';

defineProps<{
  open: boolean;
  record: ReserveProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

function close() {
  emit('update:open', false);
}

function policyText(record: ReserveProjectItem) {
  const el = record.element;
  if (!el) return '—';
  if (el.policyCategory === 'other') return el.policyCategoryOther || '其他';
  return POLICY_CATEGORY_LABEL[el.policyCategory];
}

function sixNetText(record: ReserveProjectItem) {
  const el = record.element;
  if (!el) return '—';
  if (!el.isSixNet) return '否';
  return el.sixNetTypes.map((t) => SIX_NET_LABEL[t]).join('、') || '是';
}
</script>

<template>
  <a-drawer :open="open" title="项目详情" :width="720" destroy-on-close @close="close">
    <template v-if="record">
      <a-space style="margin-bottom: 12px">
        <a-tag :color="getReserveStatusColor(record.status)">
          {{ RESERVE_FLOW_STATUS_LABEL[record.status] }}
        </a-tag>
        <span>{{ getReserveProjectName(record) }}</span>
      </a-space>

      <a-descriptions
        v-if="record.partySchool"
        title="党校集中谋划信息"
        bordered
        size="small"
        :column="2"
      >
        <a-descriptions-item label="牵头单位">{{ record.partySchool.leadUnit }}</a-descriptions-item>
        <a-descriptions-item label="责任单位">{{ record.partySchool.responsibleUnit }}</a-descriptions-item>
        <a-descriptions-item label="领域">
          {{ RESERVE_DOMAIN_LABEL[record.partySchool.domain] }}
        </a-descriptions-item>
        <a-descriptions-item label="项目名称">{{ record.partySchool.projectName }}</a-descriptions-item>
        <a-descriptions-item label="建设地点">{{ record.partySchool.location }}</a-descriptions-item>
        <a-descriptions-item label="起止年限">
          {{ record.partySchool.startYear }}-{{ record.partySchool.endYear }}
        </a-descriptions-item>
        <a-descriptions-item label="用地情况" :span="2">{{ record.partySchool.landStatus }}</a-descriptions-item>
        <a-descriptions-item label="资金拼盘情况" :span="2">{{ record.partySchool.fundMix }}</a-descriptions-item>
        <a-descriptions-item label="运营模式">{{ record.partySchool.operationMode }}</a-descriptions-item>
        <a-descriptions-item label="计划开工时间">{{ record.partySchool.plannedStartDate }}</a-descriptions-item>
        <a-descriptions-item label="建设规模和内容" :span="2">
          {{ record.partySchool.constructionScale }}
        </a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">{{ record.partySchool.totalInvestment }}</a-descriptions-item>
        <a-descriptions-item label="2027计划投资（亿元）">
          {{ record.partySchool.planInvest2027 }}
        </a-descriptions-item>
        <a-descriptions-item label="项目投资类型" :span="2">
          {{
            record.partySchool.investType === 'other'
              ? record.partySchool.investTypeOther || '其他'
              : INVEST_TYPE_LABEL[record.partySchool.investType]
          }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ record.partySchool.remark || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions
        v-if="record.department"
        title="部门谋划信息"
        bordered
        size="small"
        :column="2"
      >
        <a-descriptions-item label="责任单位">{{ record.department.responsibleUnit }}</a-descriptions-item>
        <a-descriptions-item label="项目类别">
          {{
            record.department.projectCategory === 'other'
              ? record.department.projectCategoryOther || '其他'
              : DEPT_CATEGORY_LABEL[record.department.projectCategory]
          }}
        </a-descriptions-item>
        <a-descriptions-item label="项目名称" :span="2">{{ record.department.projectName }}</a-descriptions-item>
        <a-descriptions-item label="项目内容" :span="2">{{ record.department.projectContent }}</a-descriptions-item>
        <a-descriptions-item label="预计开工时间">{{ record.department.plannedStartDate }}</a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">{{ record.department.totalInvestment }}</a-descriptions-item>
        <a-descriptions-item label="2027计划投资（亿元）">
          {{ record.department.planInvest2027 }}
        </a-descriptions-item>
        <a-descriptions-item label="备注">{{ record.department.remark || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions
        v-if="record.township"
        title="乡镇（街道）谋划信息"
        bordered
        size="small"
        :column="2"
      >
        <a-descriptions-item label="责任单位">{{ record.township.responsibleUnit }}</a-descriptions-item>
        <a-descriptions-item label="项目名称">{{ record.township.projectName }}</a-descriptions-item>
        <a-descriptions-item label="建设内容" :span="2">{{ record.township.constructionContent }}</a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">{{ record.township.totalInvestment }}</a-descriptions-item>
        <a-descriptions-item label="2027计划投资（亿元）">{{ record.township.planInvest2027 }}</a-descriptions-item>
        <a-descriptions-item label="计划开工时间">{{ record.township.plannedStartDate }}</a-descriptions-item>
        <a-descriptions-item label="运营模式">{{ record.township.operationMode }}</a-descriptions-item>
        <a-descriptions-item label="资金拼盘情况" :span="2">{{ record.township.fundMix }}</a-descriptions-item>
        <a-descriptions-item label="用地情况" :span="2">{{ record.township.landStatus }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ record.township.remark || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions
        v-if="record.arena"
        title="比拼擂台赛信息"
        bordered
        size="small"
        :column="2"
      >
        <a-descriptions-item label="责任单位">{{ record.arena.responsibleUnit }}</a-descriptions-item>
        <a-descriptions-item label="项目名称">{{ record.arena.projectName }}</a-descriptions-item>
        <a-descriptions-item label="建设内容" :span="2">{{ record.arena.constructionContent }}</a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">{{ record.arena.totalInvestment }}</a-descriptions-item>
        <a-descriptions-item label="2026计划投资（亿元）">{{ record.arena.planInvest2026 }}</a-descriptions-item>
        <a-descriptions-item label="计划开工时间">{{ record.arena.plannedStartDate }}</a-descriptions-item>
        <a-descriptions-item label="是否已开工">{{ record.arena.hasStarted ? '是' : '否' }}</a-descriptions-item>
        <a-descriptions-item v-if="record.arena.hasStarted" label="开工时间">
          {{ record.arena.actualStartDate || '—' }}
        </a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ record.arena.remark || '—' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions
        v-if="record.element"
        title="要素争取信息"
        bordered
        size="small"
        :column="2"
      >
        <a-descriptions-item label="责任单位">{{ record.element.responsibleUnit }}</a-descriptions-item>
        <a-descriptions-item label="项目名称">{{ record.element.projectName }}</a-descriptions-item>
        <a-descriptions-item label="建设内容" :span="2">{{ record.element.constructionContent }}</a-descriptions-item>
        <a-descriptions-item label="总投资（亿元）">{{ record.element.totalInvestment }}</a-descriptions-item>
        <a-descriptions-item label="要素资金（亿元）">{{ record.element.elementFund }}</a-descriptions-item>
        <a-descriptions-item label="政策类别">{{ policyText(record) }}</a-descriptions-item>
        <a-descriptions-item label="六网项目">{{ sixNetText(record) }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{ record.element.remark || '—' }}</a-descriptions-item>
      </a-descriptions>

      <div v-if="record.revokeReason || record.revokedAt" style="margin-top: 16px">
        <a-descriptions title="撤销信息" bordered size="small" :column="2">
          <a-descriptions-item label="撤销人">{{ record.revokedBy || '—' }}</a-descriptions-item>
          <a-descriptions-item label="撤销时间">{{ record.revokedAt || '—' }}</a-descriptions-item>
          <a-descriptions-item label="撤销原因" :span="2">
            {{ record.revokeReason || '—' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <div v-if="record.progressReports?.length" style="margin-top: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">进度填报历史</div>
        <a-timeline>
          <a-timeline-item
            v-for="(p, i) in record.progressReports"
            :key="p.id"
            :color="i === 0 ? 'blue' : 'gray'"
          >
            <div>
              <a-tag v-if="i === 0" color="processing">最新</a-tag>
              {{ p.reportedBy }} · {{ p.reportedAt }}
            </div>
            <div style="margin-top: 4px"><strong>当前进度：</strong>{{ p.currentProgress }}</div>
            <div style="color: rgba(0, 0, 0, 0.65)"><strong>下步计划：</strong>{{ p.nextPlan }}</div>
          </a-timeline-item>
        </a-timeline>
      </div>

      <div v-if="record.auditRecords.length" style="margin-top: 16px">
        <div style="font-weight: 600; margin-bottom: 8px">审批记录</div>
        <a-timeline>
          <a-timeline-item
            v-for="(a, i) in record.auditRecords"
            :key="i"
            :color="a.result === 'pass' ? 'green' : 'red'"
          >
            <div>
              {{ a.stage === 'first' ? '初审' : '终审' }} ·
              {{ a.result === 'pass' ? '通过' : '驳回' }} · {{ a.auditor }} · {{ a.auditedAt }}
            </div>
            <div style="color: rgba(0, 0, 0, 0.45)">{{ a.opinion }}</div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </template>
  </a-drawer>
</template>
