<script setup lang="ts">
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { projectsApi } from '@/api/supplement-pool';
import { supplementLibraryApi } from '@/api/supplement-library';
import {
  SL_APPROVAL_TYPE_OPTIONS,
  SL_CODING_AUTHORITY_OPTIONS,
  SL_CONSTRUCTION_NATURE_OPTIONS,
  SL_FILING_CATEGORY_OPTIONS,
  SL_NATIONAL_INDUSTRY_OPTIONS,
  SL_PROJECT_ATTRIBUTE_OPTIONS,
  SL_PROJECT_CATEGORY_OPTIONS,
  SL_PROJECT_PACKAGE_OPTIONS,
  SL_PROJECT_SOURCE_OPTIONS,
  SL_PROJECT_TYPE_OPTIONS,
  SL_RESPONSIBLE_UNIT_OPTIONS,
  SL_TERRITORY_OPTIONS,
  SL_YES_NO_OPTIONS,
  createEmptySupplementLibraryForm,
  type SupplementLibraryForm,
  type SupplementLibraryItem
} from '@/types/supplement-library';

const props = defineProps<{
  open: boolean;
  record: SupplementLibraryItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const currentStep = ref(0);
const form = reactive<SupplementLibraryForm>(createEmptySupplementLibraryForm());
const subProjectOptions = ref<{ value: string; label: string }[]>([]);

const isEdit = computed(() => Boolean(props.record));
const codingIsOther = computed(() => form.codingAuthority === '__other__');
const natureIsOther = computed(() => form.constructionNature === '__other__');
const isLastStep = computed(() => currentStep.value >= 3);

/** 各步需校验的字段 */
const STEP_FIELDS: string[][] = [
  [
    'projectName',
    'hasRelatedSubProjects',
    'subProjectCodes',
    'unitName',
    'unitLicenseNo',
    'contactName',
    'contactPhone',
    'leaderName',
    'leaderPhone',
    'territory',
    'responsibleUnits',
    'projectAttribute',
    'projectCategory',
    'approvalType',
    'projectType',
    'projectSources',
    'projectPackage',
    'filingDate',
    'codingAuthority',
    'nationalIndustry'
  ],
  [
    'constructionSite',
    'constructionAddress',
    'constructionNature',
    'constructionScale',
    'abovegroundArea',
    'totalBuildingArea',
    'newBuildingArea',
    'needConstructionPermit'
  ],
  ['totalInvestment'],
  ['totalLandArea', 'newConstructionLand', 'includeNewLand', 'ownLandCertNo']
];

const rules: Record<string, Rule[]> = {
  projectName: [{ required: true, message: '请填写项目名称' }],
  hasRelatedSubProjects: [{ required: true, type: 'boolean', message: '请选择是否有关联子项目' }],
  subProjectCodes: [
    {
      validator: async (_rule, value: string[]) => {
        if (!form.hasRelatedSubProjects) return;
        if (!value?.length) throw new Error('请选择子项目代码');
      }
    }
  ],
  unitName: [{ required: true, message: '请填写项目单位名称' }],
  unitLicenseNo: [{ required: true, message: '请填写项目单位证照号码' }],
  contactName: [{ required: true, message: '请填写项目联系人' }],
  contactPhone: [{ required: true, message: '请填写联系人电话' }],
  leaderName: [{ required: true, message: '请填写项目负责人' }],
  leaderPhone: [{ required: true, message: '请填写负责人电话' }],
  territory: [{ required: true, message: '请选择项目属地' }],
  responsibleUnits: [{ required: true, type: 'array', min: 1, message: '请选择项目责任单位' }],
  projectAttribute: [{ required: true, message: '请选择项目属性' }],
  projectCategory: [{ required: true, message: '请选择项目类别' }],
  approvalType: [{ required: true, message: '请选择立项类型' }],
  projectType: [{ required: true, message: '请选择项目类型' }],
  projectSources: [{ required: true, type: 'array', min: 1, message: '请选择项目来源' }],
  projectPackage: [{ required: true, message: '请选择项目套餐' }],
  filingDate: [{ required: true, message: '请选择备案时间' }],
  codingAuthority: [{ required: true, message: '请选择赋码机关' }],
  nationalIndustry: [{ required: true, message: '请选择国标行业' }],
  constructionSite: [{ required: true, message: '请填写建设地点' }],
  constructionAddress: [{ required: true, message: '请填写详细建设地址' }],
  constructionNature: [{ required: true, message: '请选择建设性质' }],
  constructionScale: [{ required: true, message: '请填写建设规模及内容' }],
  abovegroundArea: [{ required: true, type: 'number', message: '请填写地上建筑面积' }],
  totalBuildingArea: [{ required: true, type: 'number', message: '请填写总建筑面积' }],
  newBuildingArea: [{ required: true, type: 'number', message: '请填写新增建筑面积' }],
  needConstructionPermit: [{ required: true, type: 'boolean', message: '请选择是否需领施工许可证' }],
  totalInvestment: [{ required: true, type: 'number', message: '请填写总投资' }],
  totalLandArea: [{ required: true, type: 'number', message: '请填写总用地面积' }],
  newConstructionLand: [{ required: true, type: 'number', message: '请填写其中新增建设用地' }],
  includeNewLand: [{ required: true, type: 'boolean', message: '请选择是否包含新增建设用地' }],
  ownLandCertNo: [{ required: true, message: '请填写本企业已有土地的土地证书编号' }]
};

async function loadSubProjectOptions() {
  const list = await projectsApi.getList({ poolStage: 'implementation' });
  subProjectOptions.value = list.map((p) => ({
    value: p.projectCode,
    label: `${p.projectCode}（${p.projectName}）`
  }));
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    currentStep.value = 0;
    Object.assign(form, createEmptySupplementLibraryForm());
    await loadSubProjectOptions();
    if (props.record) {
      Object.assign(form, {
        ...createEmptySupplementLibraryForm(),
        ...props.record,
        responsibleUnits: [...(props.record.responsibleUnits || [])],
        projectSources: [...(props.record.projectSources || [])],
        subProjectCodes: [...(props.record.subProjectCodes || [])],
        hasRelatedSubProjects: props.record.hasRelatedSubProjects ?? false
      });
    }
  }
);

watch(
  () => form.hasRelatedSubProjects,
  (val) => {
    if (!val) {
      form.subProjectCodes = [];
      formRef.value?.clearValidate?.(['subProjectCodes']);
    }
  }
);

function close() {
  emit('update:open', false);
}

function payload(): SupplementLibraryForm {
  return {
    ...form,
    hasRelatedSubProjects: form.hasRelatedSubProjects,
    subProjectCodes: form.hasRelatedSubProjects ? [...form.subProjectCodes] : [],
    codingAuthorityOther: codingIsOther.value ? form.codingAuthorityOther : undefined,
    constructionNatureOther: natureIsOther.value ? form.constructionNatureOther : undefined,
    projectCode: form.projectCode?.trim() || undefined
  };
}

async function validateCurrentStep() {
  const fields = STEP_FIELDS[currentStep.value] || [];
  try {
    await formRef.value?.validateFields(fields);
  } catch {
    message.warning('请完善本步必填项后再继续');
    return false;
  }
  if (currentStep.value === 0 && codingIsOther.value && !form.codingAuthorityOther?.trim()) {
    message.warning('请填写其他赋码机关');
    return false;
  }
  if (currentStep.value === 1 && natureIsOther.value && !form.constructionNatureOther?.trim()) {
    message.warning('请填写其他建设性质');
    return false;
  }
  return true;
}

async function nextStep() {
  const ok = await validateCurrentStep();
  if (!ok) return;
  currentStep.value += 1;
}

function prevStep() {
  formRef.value?.clearValidate();
  currentStep.value = Math.max(0, currentStep.value - 1);
}

async function submit() {
  const ok = await validateCurrentStep();
  if (!ok) return;
  submitting.value = true;
  try {
    const data = payload();
    if (props.record) {
      await supplementLibraryApi.update(props.record.id, data);
    } else {
      await supplementLibraryApi.create(data);
    }
    message.success('已流转至分管领导审核，请耐心等候～');
    emit('saved');
    close();
  } catch (e: any) {
    message.error(e?.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :title="isEdit ? '修改项目增补' : '项目申报'"
    :width="960"
    :style="{ top: '24px' }"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <a-steps :current="currentStep" size="small" style="margin-bottom: 20px">
      <a-step title="业主信息" />
      <a-step title="建筑信息" />
      <a-step title="资金信息" />
      <a-step title="土地信息" />
    </a-steps>

    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" class="declare-form">
      <div v-show="currentStep === 0">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="项目名称" name="projectName">
              <a-input v-model:value="form.projectName" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目代码" name="projectCode">
              <a-input
                v-model:value="form.projectCode"
                placeholder="选填；填写将校验是否已存在，空白则终审通过后赋码"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否有关联子项目" name="hasRelatedSubProjects">
              <a-radio-group v-model:value="form.hasRelatedSubProjects" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col v-if="form.hasRelatedSubProjects" :span="24">
            <a-form-item label="子项目代码" name="subProjectCodes">
              <a-select
                v-model:value="form.subProjectCodes"
                mode="multiple"
                allow-clear
                show-search
                option-filter-prop="label"
                :options="subProjectOptions"
                placeholder="请选择实施库项目（可多选）"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目单位名称" name="unitName">
              <a-input v-model:value="form.unitName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目单位证照号码" name="unitLicenseNo">
              <a-input v-model:value="form.unitLicenseNo" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目联系人" name="contactName">
              <a-input v-model:value="form.contactName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系人电话" name="contactPhone">
              <a-input v-model:value="form.contactPhone" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目负责人" name="leaderName">
              <a-input v-model:value="form.leaderName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人电话" name="leaderPhone">
              <a-input v-model:value="form.leaderPhone" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目属地" name="territory">
              <a-select
                v-model:value="form.territory"
                allow-clear
                show-search
                :options="SL_TERRITORY_OPTIONS"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目责任单位" name="responsibleUnits">
              <a-select
                v-model:value="form.responsibleUnits"
                mode="multiple"
                allow-clear
                show-search
                :options="SL_RESPONSIBLE_UNIT_OPTIONS"
                placeholder="可多选"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目属性" name="projectAttribute">
              <a-select v-model:value="form.projectAttribute" :options="SL_PROJECT_ATTRIBUTE_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目类别" name="projectCategory">
              <a-select v-model:value="form.projectCategory" :options="SL_PROJECT_CATEGORY_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="立项类型" name="approvalType">
              <a-select v-model:value="form.approvalType" :options="SL_APPROVAL_TYPE_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目类型" name="projectType">
              <a-select v-model:value="form.projectType" :options="SL_PROJECT_TYPE_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目来源" name="projectSources">
              <a-select
                v-model:value="form.projectSources"
                mode="multiple"
                :options="SL_PROJECT_SOURCE_OPTIONS"
                placeholder="可多选"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目套餐" name="projectPackage">
              <a-select v-model:value="form.projectPackage" :options="SL_PROJECT_PACKAGE_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备案类别" name="filingCategory">
              <a-select
                v-model:value="form.filingCategory"
                allow-clear
                :options="SL_FILING_CATEGORY_OPTIONS"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备案时间" name="filingDate">
              <a-date-picker v-model:value="form.filingDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="赋码机关" name="codingAuthority">
              <a-select v-model:value="form.codingAuthority" :options="SL_CODING_AUTHORITY_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col v-if="codingIsOther" :span="12">
            <a-form-item label="其他赋码机关" required>
              <a-input v-model:value="form.codingAuthorityOther" placeholder="请填写赋码机关" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="赋码时间" name="codingDate">
              <a-date-picker v-model:value="form.codingDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否承诺制" name="isCommitment">
              <a-radio-group v-model:value="form.isCommitment" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否补码项目" name="isComplementCode">
              <a-radio-group v-model:value="form.isComplementCode" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="国标行业" name="nationalIndustry">
              <a-select
                v-model:value="form.nationalIndustry"
                show-search
                :options="SL_NATIONAL_INDUSTRY_OPTIONS"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="投资目的大洲" name="investContinent">
              <a-input v-model:value="form.investContinent" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="投资目的国别" name="investCountry">
              <a-input v-model:value="form.investCountry" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-show="currentStep === 1">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="建设地点" name="constructionSite">
              <a-input v-model:value="form.constructionSite" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="详细建设地址" name="constructionAddress">
              <a-input v-model:value="form.constructionAddress" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="建设性质" name="constructionNature">
              <a-select v-model:value="form.constructionNature" :options="SL_CONSTRUCTION_NATURE_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col v-if="natureIsOther" :span="12">
            <a-form-item label="其他建设性质" required>
              <a-input v-model:value="form.constructionNatureOther" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="建设规模及内容" name="constructionScale">
              <a-textarea v-model:value="form.constructionScale" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="项目进度" name="projectProgress">
              <a-input v-model:value="form.projectProgress" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="拟开工时间" name="proposedStartDate">
              <a-date-picker v-model:value="form.proposedStartDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="拟建成时间" name="proposedEndDate">
              <a-date-picker v-model:value="form.proposedEndDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="地上建筑面积" name="abovegroundArea">
              <a-input-number v-model:value="form.abovegroundArea" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="总建筑面积（亩）" name="totalBuildingArea">
              <a-input-number v-model:value="form.totalBuildingArea" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="新增建筑面积（亩）" name="newBuildingArea">
              <a-input-number v-model:value="form.newBuildingArea" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否需领施工许可证" name="needConstructionPermit">
              <a-radio-group v-model:value="form.needConstructionPermit" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否利用其他企业空闲场地或厂房" name="useIdleSite">
              <a-radio-group v-model:value="form.useIdleSite" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-show="currentStep === 2">
        <a-alert type="info" show-icon style="margin-bottom: 12px" message="金额单位：万元" />
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="总投资" name="totalInvestment">
              <a-input-number v-model:value="form.totalInvestment" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="固定资产投资" name="fixedAssetInvestment">
              <a-input-number v-model:value="form.fixedAssetInvestment" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="项目注册资金" name="registeredCapital">
              <a-input-number v-model:value="form.registeredCapital" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="自有资金" name="ownFunds">
              <a-input-number v-model:value="form.ownFunds" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="银行贷款" name="bankLoan">
              <a-input-number v-model:value="form.bankLoan" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="财政性资金" name="fiscalFunds">
              <a-input-number v-model:value="form.fiscalFunds" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="铺底流动资金" name="workingCapital">
              <a-input-number v-model:value="form.workingCapital" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="土建工程费" name="civilCost">
              <a-input-number v-model:value="form.civilCost" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="设备购置费" name="equipmentCost">
              <a-input-number v-model:value="form.equipmentCost" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="安装工程费" name="installCost">
              <a-input-number v-model:value="form.installCost" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="工程建设其他费用" name="otherConstructionCost">
              <a-input-number v-model:value="form.otherConstructionCost" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="预备费" name="reserveFund">
              <a-input-number v-model:value="form.reserveFund" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="建设期利息" name="constructionInterest">
              <a-input-number v-model:value="form.constructionInterest" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="其他" name="otherCost">
              <a-input-number v-model:value="form.otherCost" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="资金来源" name="fundSource">
              <a-input-number v-model:value="form.fundSource" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-show="currentStep === 3">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="总用地面积（亩）" name="totalLandArea">
              <a-input-number v-model:value="form.totalLandArea" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="其中新增建设用地（亩）" name="newConstructionLand">
              <a-input-number v-model:value="form.newConstructionLand" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否包含新增建设用地" name="includeNewLand">
              <a-radio-group v-model:value="form.includeNewLand" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否标准地" name="isStandardLand">
              <a-radio-group v-model:value="form.isStandardLand" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否零土地" name="isZeroLand">
              <a-radio-group v-model:value="form.isZeroLand" :options="SL_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="本企业已有土地的土地证书编号" name="ownLandCertNo">
              <a-input v-model:value="form.ownLandCertNo" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="出租方土地证书编号" name="lessorLandCertNo">
              <a-input v-model:value="form.lessorLandCertNo" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <div class="declare-footer">
      <a-button @click="close">取消</a-button>
      <a-space>
        <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
        <a-button v-if="!isLastStep" type="primary" @click="nextStep">下一步</a-button>
        <a-button v-else type="primary" :loading="submitting" @click="submit">提交</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<style scoped>
.declare-form {
  max-height: 58vh;
  overflow-y: auto;
  padding-right: 4px;
}
.declare-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
