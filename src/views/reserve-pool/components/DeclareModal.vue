<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { reservePoolApi } from '@/api/reserve-pool';
import type {
  ArenaFields,
  DepartmentFields,
  DeptProjectCategory,
  ElementFields,
  InvestType,
  PartySchoolFields,
  PolicyCategory,
  ReserveDomain,
  ReserveModule,
  ReserveProjectItem,
  SixNetType,
  TownshipFields
} from '@/types/reserve-pool';
import {
  DEPT_CATEGORY_OPTIONS,
  INVEST_TYPE_OPTIONS,
  POLICY_CATEGORY_OPTIONS,
  RESERVE_DOMAIN_OPTIONS,
  RESERVE_UNIT_OPTIONS,
  SIX_NET_OPTIONS
} from '@/types/reserve-pool';

const props = defineProps<{
  open: boolean;
  module: ReserveModule;
  mode: 'create' | 'edit';
  record: ReserveProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const title = computed(() => (props.mode === 'edit' ? '编辑申报' : '项目申报'));

const partySchool = reactive<Partial<PartySchoolFields>>({});
const department = reactive<Partial<DepartmentFields>>({});
const township = reactive<Partial<TownshipFields>>({});
const arena = reactive<Partial<ArenaFields>>({});
const element = reactive<Partial<ElementFields> & { sixNetTypes: SixNetType[] }>({
  sixNetTypes: []
});

const yearRange = ref<{ start?: number; end?: number }>({});

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    reset();
    if (props.record && props.mode === 'edit') fill(props.record);
  }
);

function reset() {
  Object.keys(partySchool).forEach((k) => delete (partySchool as any)[k]);
  Object.keys(department).forEach((k) => delete (department as any)[k]);
  Object.keys(township).forEach((k) => delete (township as any)[k]);
  Object.keys(arena).forEach((k) => delete (arena as any)[k]);
  Object.keys(element).forEach((k) => {
    if (k !== 'sixNetTypes') delete (element as any)[k];
  });
  element.sixNetTypes = [];
  element.isSixNet = false;
  yearRange.value = {};
}

function fill(record: ReserveProjectItem) {
  if (record.partySchool) {
    Object.assign(partySchool, record.partySchool);
    yearRange.value = {
      start: record.partySchool.startYear,
      end: record.partySchool.endYear
    };
  }
  if (record.department) Object.assign(department, record.department);
  if (record.township) Object.assign(township, record.township);
  if (record.arena) Object.assign(arena, record.arena);
  if (record.element) {
    Object.assign(element, record.element);
    element.sixNetTypes = [...record.element.sixNetTypes];
  }
}

function close() {
  emit('update:open', false);
}

function requireText(v: unknown, label: string) {
  if (v === undefined || v === null || String(v).trim() === '') {
    message.warning(`请填写${label}`);
    return false;
  }
  return true;
}

function requireNumber(v: unknown, label: string) {
  if (v === undefined || v === null || Number.isNaN(Number(v))) {
    message.warning(`请填写${label}`);
    return false;
  }
  return true;
}

function validate(): boolean {
  if (props.module === 'partySchool') {
    if (!requireText(partySchool.leadUnit, '牵头单位')) return false;
    if (!requireText(partySchool.responsibleUnit, '责任单位')) return false;
    if (!requireText(partySchool.domain, '领域')) return false;
    if (!requireText(partySchool.projectName, '项目名称')) return false;
    if (!requireText(partySchool.location, '建设地点')) return false;
    if (!requireText(partySchool.landStatus, '用地情况')) return false;
    if (!requireText(partySchool.fundMix, '资金拼盘情况')) return false;
    if (!requireText(partySchool.operationMode, '运营模式')) return false;
    if (!requireText(partySchool.constructionScale, '建设规模和内容')) return false;
    if (!yearRange.value.start || !yearRange.value.end) {
      message.warning('请选择起止年限');
      return false;
    }
    if (yearRange.value.end < yearRange.value.start) {
      message.warning('结束年份不能早于起始年份');
      return false;
    }
    if (!requireNumber(partySchool.totalInvestment, '总投资')) return false;
    if (!requireNumber(partySchool.planInvest2027, '2027年年度计划投资')) return false;
    if (!requireText(partySchool.plannedStartDate, '计划开工时间')) return false;
    if (!requireText(partySchool.investType, '项目投资类型')) return false;
    if (partySchool.investType === 'other' && !requireText(partySchool.investTypeOther, '其他投资类型说明')) {
      return false;
    }
  }
  if (props.module === 'department') {
    if (!requireText(department.responsibleUnit, '责任单位')) return false;
    if (!requireText(department.projectCategory, '项目类别')) return false;
    if (
      department.projectCategory === 'other' &&
      !requireText(department.projectCategoryOther, '其他项目类别说明')
    ) {
      return false;
    }
    if (!requireText(department.projectName, '项目名称')) return false;
    if (!requireText(department.projectContent, '项目内容')) return false;
    if (!requireText(department.plannedStartDate, '预计开工时间')) return false;
    if (!requireNumber(department.totalInvestment, '总投资')) return false;
    if (!requireNumber(department.planInvest2027, '2027年年度计划投资')) return false;
  }
  if (props.module === 'township') {
    if (!requireText(township.responsibleUnit, '责任单位')) return false;
    if (!requireText(township.projectName, '项目名称')) return false;
    if (!requireText(township.constructionContent, '建设内容')) return false;
    if (!requireNumber(township.totalInvestment, '总投资')) return false;
    if (!requireNumber(township.planInvest2027, '2027年年度计划投资')) return false;
    if (!requireText(township.plannedStartDate, '计划开工时间')) return false;
    if (!requireText(township.fundMix, '资金拼盘情况')) return false;
    if (!requireText(township.operationMode, '运营模式')) return false;
    if (!requireText(township.landStatus, '用地情况')) return false;
  }
  if (props.module === 'arena') {
    if (!requireText(arena.responsibleUnit, '责任单位')) return false;
    if (!requireText(arena.projectName, '项目名称')) return false;
    if (!requireText(arena.constructionContent, '建设内容')) return false;
    if (!requireNumber(arena.totalInvestment, '总投资')) return false;
    if (!requireNumber(arena.planInvest2026, '2026年计划投资')) return false;
    if (!requireText(arena.plannedStartDate, '计划开工时间')) return false;
    if (arena.hasStarted === undefined) {
      message.warning('请选择是否已开工');
      return false;
    }
    if (arena.hasStarted && !requireText(arena.actualStartDate, '开工时间')) return false;
  }
  if (props.module === 'element') {
    if (!requireText(element.responsibleUnit, '责任单位')) return false;
    if (!requireText(element.projectName, '项目名称')) return false;
    if (!requireText(element.constructionContent, '建设内容')) return false;
    if (!requireNumber(element.totalInvestment, '总投资')) return false;
    if (!requireText(element.policyCategory, '政策类别')) return false;
    if (
      element.policyCategory === 'other' &&
      !requireText(element.policyCategoryOther, '其他政策类别说明')
    ) {
      return false;
    }
    if (element.isSixNet === undefined) {
      message.warning('请选择是否属于六网项目');
      return false;
    }
    if (element.isSixNet && !element.sixNetTypes?.length) {
      message.warning('请选择六网类型');
      return false;
    }
    if (!requireNumber(element.elementFund, '要素资金')) return false;
  }
  return true;
}

function buildPayload(asDraft: boolean) {
  const payload: Parameters<typeof reservePoolApi.create>[0] = {
    module: props.module,
    asDraft,
    attachments: []
  };
  if (props.module === 'partySchool') {
    payload.partySchool = {
      leadUnit: String(partySchool.leadUnit || ''),
      responsibleUnit: String(partySchool.responsibleUnit || ''),
      domain: (partySchool.domain || 'other') as ReserveDomain,
      projectName: String(partySchool.projectName || '').trim(),
      location: String(partySchool.location || '').trim(),
      landStatus: String(partySchool.landStatus || '').trim(),
      fundMix: String(partySchool.fundMix || '').trim(),
      operationMode: String(partySchool.operationMode || '').trim(),
      constructionScale: String(partySchool.constructionScale || '').trim(),
      startYear: yearRange.value.start || new Date().getFullYear(),
      endYear: yearRange.value.end || new Date().getFullYear(),
      totalInvestment: Number(partySchool.totalInvestment || 0),
      planInvest2027: Number(partySchool.planInvest2027 || 0),
      plannedStartDate: String(partySchool.plannedStartDate || ''),
      investType: (partySchool.investType || 'other') as InvestType,
      investTypeOther: partySchool.investTypeOther,
      remark: partySchool.remark
    };
  }
  if (props.module === 'department') {
    payload.department = {
      responsibleUnit: String(department.responsibleUnit || ''),
      projectCategory: (department.projectCategory || 'other') as DeptProjectCategory,
      projectCategoryOther: department.projectCategoryOther,
      projectName: String(department.projectName || '').trim(),
      projectContent: String(department.projectContent || '').trim(),
      plannedStartDate: String(department.plannedStartDate || ''),
      totalInvestment: Number(department.totalInvestment || 0),
      planInvest2027: Number(department.planInvest2027 || 0),
      remark: department.remark
    };
  }
  if (props.module === 'township') {
    payload.township = {
      responsibleUnit: String(township.responsibleUnit || ''),
      projectName: String(township.projectName || '').trim(),
      constructionContent: String(township.constructionContent || '').trim(),
      totalInvestment: Number(township.totalInvestment || 0),
      planInvest2027: Number(township.planInvest2027 || 0),
      plannedStartDate: String(township.plannedStartDate || ''),
      fundMix: String(township.fundMix || '').trim(),
      operationMode: String(township.operationMode || '').trim(),
      landStatus: String(township.landStatus || '').trim(),
      remark: township.remark
    };
  }
  if (props.module === 'arena') {
    payload.arena = {
      responsibleUnit: String(arena.responsibleUnit || ''),
      projectName: String(arena.projectName || '').trim(),
      constructionContent: String(arena.constructionContent || '').trim(),
      totalInvestment: Number(arena.totalInvestment || 0),
      planInvest2026: Number(arena.planInvest2026 || 0),
      plannedStartDate: String(arena.plannedStartDate || ''),
      hasStarted: !!arena.hasStarted,
      actualStartDate: arena.hasStarted ? arena.actualStartDate : undefined,
      remark: arena.remark
    };
  }
  if (props.module === 'element') {
    payload.element = {
      responsibleUnit: String(element.responsibleUnit || ''),
      projectName: String(element.projectName || '').trim(),
      constructionContent: String(element.constructionContent || '').trim(),
      totalInvestment: Number(element.totalInvestment || 0),
      policyCategory: (element.policyCategory || 'other') as PolicyCategory,
      policyCategoryOther: element.policyCategoryOther,
      isSixNet: !!element.isSixNet,
      sixNetTypes: element.isSixNet ? [...element.sixNetTypes] : [],
      elementFund: Number(element.elementFund || 0),
      remark: element.remark
    };
  }
  return payload;
}

async function handleSave(asDraft: boolean) {
  if (!asDraft && !validate()) return;
  if (asDraft) {
    const name =
      partySchool.projectName ||
      department.projectName ||
      township.projectName ||
      arena.projectName ||
      element.projectName;
    if (!String(name || '').trim()) {
      message.warning('草稿至少填写项目名称');
      return;
    }
  }
  submitting.value = true;
  try {
    const payload = buildPayload(asDraft);
    if (props.mode === 'edit' && props.record) {
      await reservePoolApi.update(props.record.id, payload);
      message.success(asDraft ? '草稿已保存' : '已重新提交');
    } else {
      await reservePoolApi.create(payload);
      message.success(asDraft ? '草稿已保存' : '申报成功，请及时填报当前进度与下步计划');
    }
    emit('saved');
    close();
  } finally {
    submitting.value = false;
  }
}

const yearOptions = Array.from({ length: 20 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    :width="860"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <a-alert
      type="info"
      show-icon
      style="margin-bottom: 12px"
      message="申报流程：责任单位项目专员申报 → 分管领导审核 → 片区专员审核。除备注外均为必填。"
    />

    <a-form layout="vertical">
      <!-- 党校 -->
      <template v-if="module === 'partySchool'">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="牵头单位" required>
              <a-select v-model:value="partySchool.leadUnit" :options="RESERVE_UNIT_OPTIONS" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="责任单位" required>
              <a-select v-model:value="partySchool.responsibleUnit" :options="RESERVE_UNIT_OPTIONS" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="领域" required>
              <a-select v-model:value="partySchool.domain" :options="RESERVE_DOMAIN_OPTIONS" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目名称" required>
              <a-input v-model:value="partySchool.projectName" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="建设地点" required>
              <a-input v-model:value="partySchool.location" placeholder="请输入建设地点" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="起止年限" required>
              <a-space>
                <a-select
                  v-model:value="yearRange.start"
                  :options="yearOptions"
                  placeholder="起始年"
                  style="width: 120px"
                />
                <span>-</span>
                <a-select
                  v-model:value="yearRange.end"
                  :options="yearOptions"
                  placeholder="结束年"
                  style="width: 120px"
                />
              </a-space>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="用地情况" required>
              <a-textarea v-model:value="partySchool.landStatus" :rows="2" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="资金拼盘情况" required>
              <a-textarea v-model:value="partySchool.fundMix" :rows="2" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="运营模式" required>
              <a-input v-model:value="partySchool.operationMode" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="建设规模和内容" required>
              <a-textarea v-model:value="partySchool.constructionScale" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="总投资（亿元）" required>
              <a-input-number v-model:value="partySchool.totalInvestment" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="2027年年度计划投资（亿元）" required>
              <a-input-number v-model:value="partySchool.planInvest2027" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="计划开工时间" required>
              <a-date-picker
                v-model:value="partySchool.plannedStartDate"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目投资类型" required>
              <a-select v-model:value="partySchool.investType" :options="INVEST_TYPE_OPTIONS" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col v-if="partySchool.investType === 'other'" :span="12">
            <a-form-item label="其他投资类型说明" required>
              <a-input v-model:value="partySchool.investTypeOther" placeholder="请填写" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model:value="partySchool.remark" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <!-- 部门 -->
      <template v-else-if="module === 'department'">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="责任单位" required>
              <a-select v-model:value="department.responsibleUnit" :options="RESERVE_UNIT_OPTIONS" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目类别" required>
              <a-select v-model:value="department.projectCategory" :options="DEPT_CATEGORY_OPTIONS" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col v-if="department.projectCategory === 'other'" :span="24">
            <a-form-item label="其他项目类别说明" required>
              <a-input v-model:value="department.projectCategoryOther" placeholder="请填写" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="项目名称" required>
              <a-input v-model:value="department.projectName" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="项目内容" required>
              <a-textarea v-model:value="department.projectContent" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="预计开工时间" required>
              <a-date-picker v-model:value="department.plannedStartDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="总投资（亿元）" required>
              <a-input-number v-model:value="department.totalInvestment" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="2027年年度计划投资（亿元）" required>
              <a-input-number v-model:value="department.planInvest2027" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model:value="department.remark" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <!-- 镇街 -->
      <template v-else-if="module === 'township'">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="责任单位" required>
              <a-select v-model:value="township.responsibleUnit" :options="RESERVE_UNIT_OPTIONS" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目名称" required>
              <a-input v-model:value="township.projectName" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="建设内容" required>
              <a-textarea v-model:value="township.constructionContent" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="总投资（亿元）" required>
              <a-input-number v-model:value="township.totalInvestment" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="2027年年度计划投资（亿元）" required>
              <a-input-number v-model:value="township.planInvest2027" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="计划开工时间" required>
              <a-date-picker v-model:value="township.plannedStartDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="资金拼盘情况" required>
              <a-textarea v-model:value="township.fundMix" :rows="2" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="运营模式" required>
              <a-input v-model:value="township.operationMode" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="用地情况" required>
              <a-input v-model:value="township.landStatus" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model:value="township.remark" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <!-- 擂台 -->
      <template v-else-if="module === 'arena'">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="责任单位" required>
              <a-select v-model:value="arena.responsibleUnit" :options="RESERVE_UNIT_OPTIONS" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目名称" required>
              <a-input v-model:value="arena.projectName" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="建设内容" required>
              <a-textarea v-model:value="arena.constructionContent" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="总投资（亿元）" required>
              <a-input-number v-model:value="arena.totalInvestment" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="2026年计划投资（亿元）" required>
              <a-input-number v-model:value="arena.planInvest2026" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="计划开工时间" required>
              <a-date-picker v-model:value="arena.plannedStartDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否已开工" required>
              <a-radio-group
                v-model:value="arena.hasStarted"
                :options="[
                  { label: '是', value: true },
                  { label: '否', value: false }
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="arena.hasStarted" :span="12">
            <a-form-item label="开工时间" required>
              <a-date-picker v-model:value="arena.actualStartDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model:value="arena.remark" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <!-- 要素 -->
      <template v-else-if="module === 'element'">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="责任单位" required>
              <a-select v-model:value="element.responsibleUnit" :options="RESERVE_UNIT_OPTIONS" show-search placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目名称" required>
              <a-input v-model:value="element.projectName" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="建设内容" required>
              <a-textarea v-model:value="element.constructionContent" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="总投资（亿元）" required>
              <a-input-number v-model:value="element.totalInvestment" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="政策类别" required>
              <a-select v-model:value="element.policyCategory" :options="POLICY_CATEGORY_OPTIONS" placeholder="请选择" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="要素资金（亿元）" required>
              <a-input-number v-model:value="element.elementFund" :min="0" :precision="2" :controls="false" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col v-if="element.policyCategory === 'other'" :span="24">
            <a-form-item label="其他政策类别说明" required>
              <a-input v-model:value="element.policyCategoryOther" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="是否属于六网项目" required>
              <a-radio-group
                v-model:value="element.isSixNet"
                :options="[
                  { label: '是', value: true },
                  { label: '否', value: false }
                ]"
                @change="() => { if (!element.isSixNet) element.sixNetTypes = [] }"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="element.isSixNet" :span="24">
            <a-form-item label="六网类型" required>
              <a-checkbox-group v-model:value="element.sixNetTypes" :options="SIX_NET_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea v-model:value="element.remark" :rows="2" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>
    </a-form>

    <div class="footer-actions">
      <a-button @click="close">取消</a-button>
      <a-button :loading="submitting" @click="handleSave(true)">存草稿</a-button>
      <a-button type="primary" :loading="submitting" @click="handleSave(false)">提交申报</a-button>
    </div>
  </a-modal>
</template>

<style scoped>
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
