<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import type {
  ConstructionNature,
  ProjectAttribute,
  ProjectCategory,
  SupplementProjectForm,
  SupplementProjectItem
} from '@/types/supplement-pool';
import {
  CONSTRUCTION_NATURE_LABEL,
  PROJECT_ATTRIBUTE_LABEL,
  PROJECT_CATEGORY_LABEL,
  RESPONSIBLE_UNIT_OPTIONS,
  STREET_TOWN_OPTIONS,
  SUB_PROJECT_OPTIONS
} from '@/types/supplement-pool';

const props = defineProps<{
  open: boolean;
  record: SupplementProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: SupplementProjectForm];
}>();

const currentStep = ref(0);
const formRef = ref<FormInstance>();

const form = reactive<SupplementProjectForm>({
  projectName: '',
  projectAbbr: '',
  projectLocation: '',
  totalInvestment: undefined,
  responsibleUnits: [],
  unitName: '',
  projectAttribute: undefined,
  projectCategory: undefined,
  constructionSite: '',
  constructionAddress: '',
  constructionNature: undefined,
  constructionScale: '',
  constructionProgress: '',
  proposedStartDate: undefined,
  proposedEndDate: undefined,
  needConstructionPermit: false,
  landCertificateNo: '',
  subProjects: [],
  schemeCompleteDate: undefined,
  planningCompleteDate: undefined,
  proposalApprovalDate: undefined
});

const title = computed(() => (props.record ? '修改项目' : '项目申报'));

const showSchemeDate = computed(() => form.projectAttribute === 'social');
const showGovDates = computed(
  () => form.projectAttribute === 'government' || form.projectAttribute === 'other'
);

const attributeOptions = Object.entries(PROJECT_ATTRIBUTE_LABEL).map(([value, label]) => ({
  value,
  label
}));

const categoryOptions = Object.entries(PROJECT_CATEGORY_LABEL).map(([value, label]) => ({
  value,
  label
}));

const natureOptions = Object.entries(CONSTRUCTION_NATURE_LABEL).map(([value, label]) => ({
  value,
  label
}));

function resetForm() {
  Object.assign(form, {
    projectName: '',
    projectAbbr: '',
    projectLocation: '',
    totalInvestment: undefined,
    responsibleUnits: [],
    unitName: '',
    projectAttribute: undefined,
    projectCategory: undefined,
    constructionSite: '',
    constructionAddress: '',
    constructionNature: undefined,
    constructionScale: '',
    constructionProgress: '',
    proposedStartDate: undefined,
    proposedEndDate: undefined,
    needConstructionPermit: false,
    landCertificateNo: '',
    subProjects: [],
    schemeCompleteDate: undefined,
    planningCompleteDate: undefined,
    proposalApprovalDate: undefined
  });
  currentStep.value = 0;
}

function fillFromRecord(record: SupplementProjectItem) {
  Object.assign(form, {
    projectName: record.projectName,
    projectAbbr: record.projectAbbr || '',
    projectLocation: record.projectLocation,
    totalInvestment: record.totalInvestment,
    responsibleUnits: [...record.responsibleUnits],
    unitName: record.unitName,
    projectAttribute: record.projectAttribute,
    projectCategory: record.projectCategory,
    constructionSite: record.constructionSite,
    constructionAddress: record.constructionAddress,
    constructionNature: record.constructionNature,
    constructionScale: record.constructionScale,
    constructionProgress: record.constructionProgress || '',
    proposedStartDate: record.proposedStartDate,
    proposedEndDate: record.proposedEndDate,
    needConstructionPermit: record.needConstructionPermit,
    landCertificateNo: record.landCertificateNo || '',
    subProjects: record.subProjects ? [...record.subProjects] : [],
    schemeCompleteDate: record.schemeCompleteDate,
    planningCompleteDate: record.planningCompleteDate,
    proposalApprovalDate: record.proposalApprovalDate
  });
  currentStep.value = 0;
}

watch(
  () => props.open,
  (val) => {
    if (!val) return;
    if (props.record) {
      fillFromRecord(props.record);
    } else {
      resetForm();
    }
  }
);

watch(
  () => form.projectAttribute,
  () => {
    form.schemeCompleteDate = undefined;
    form.planningCompleteDate = undefined;
    form.proposalApprovalDate = undefined;
  }
);

const STEP0_FIELDS = ['projectName', 'projectLocation', 'totalInvestment', 'responsibleUnits'] as const;
const STEP1_FIELDS = [
  'unitName',
  'projectAttribute',
  'projectCategory',
  'constructionSite',
  'constructionAddress',
  'constructionNature',
  'constructionScale'
] as const;

const step0Rules: Record<string, Rule[]> = {
  projectName: [{ required: true, message: '请输入项目名称' }],
  projectLocation: [{ required: true, message: '请选择项目属地' }],
  totalInvestment: [{ required: true, type: 'number', message: '请输入总投资' }],
  responsibleUnits: [{ required: true, type: 'array', min: 1, message: '请选择责任单位' }]
};

const step1Rules: Record<string, Rule[]> = {
  unitName: [{ required: true, message: '请输入项目单位名称' }],
  projectAttribute: [{ required: true, message: '请选择项目属性' }],
  projectCategory: [{ required: true, message: '请选择项目类别' }],
  constructionSite: [{ required: true, message: '请输入建设地点' }],
  constructionAddress: [{ required: true, message: '请输入详细建设地址' }],
  constructionNature: [{ required: true, message: '请选择建设性质' }],
  constructionScale: [{ required: true, message: '请输入建设规模及内容' }]
};

const step2Rules = computed<Record<string, Rule[]>>(() => {
  const rules: Record<string, Rule[]> = {};
  if (showSchemeDate.value) {
    rules.schemeCompleteDate = [{ required: true, message: '请选择形成方案完成时间' }];
  }
  if (showGovDates.value) {
    rules.planningCompleteDate = [{ required: true, message: '请选择规划落地完成时间' }];
    rules.proposalApprovalDate = [{ required: true, message: '请选择项建书批复完成时间' }];
  }
  return rules;
});

const currentRules = computed(() => {
  if (currentStep.value === 0) return step0Rules;
  if (currentStep.value === 1) return step1Rules;
  return step2Rules.value;
});

function close() {
  emit('update:open', false);
}

async function validateStep(): Promise<boolean> {
  if (!formRef.value) return false;
  try {
    if (currentStep.value === 0) {
      await formRef.value.validateFields([...STEP0_FIELDS]);
    } else if (currentStep.value === 1) {
      await formRef.value.validateFields([...STEP1_FIELDS]);
    } else {
      const fields = Object.keys(step2Rules.value);
      if (fields.length) {
        await formRef.value.validateFields(fields);
      }
    }
    return true;
  } catch {
    return false;
  }
}

async function nextStep() {
  const ok = await validateStep();
  if (!ok) return;
  formRef.value?.clearValidate();
  currentStep.value += 1;
}

function prevStep() {
  formRef.value?.clearValidate();
  currentStep.value -= 1;
}

async function handleSubmit() {
  const ok = await validateStep();
  if (!ok) return;
  emit('submit', { ...form });
}

function filterSubProject(input: string, option: { label?: string }) {
  return (option.label ?? '').toLowerCase().includes(input.toLowerCase());
}
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    :width="800"
    destroy-on-close
    :mask-closable="false"
    @cancel="close"
  >
    <a-steps :current="currentStep" size="small" style="margin-bottom: 24px">
      <a-step title="基本信息" />
      <a-step title="建设信息" />
      <a-step title="补充信息" />
    </a-steps>

    <a-form
      ref="formRef"
      :model="form"
      :rules="currentRules"
      layout="vertical"
      class="declare-form"
    >
      <!-- 模块一：基本信息 -->
      <div v-if="currentStep === 0" class="form-section">
        <h3 class="form-section-title">基本信息</h3>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="项目名称" name="projectName">
              <a-input v-model:value="form.projectName" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目简称" name="projectAbbr">
              <a-input v-model:value="form.projectAbbr" placeholder="请输入项目简称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目属地" name="projectLocation">
              <a-select
                v-model:value="form.projectLocation"
                placeholder="请选择项目属地"
                :options="STREET_TOWN_OPTIONS"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="总投资（亿元）" name="totalInvestment">
              <a-input-number
                v-model:value="form.totalInvestment"
                :min="0"
                :precision="2"
                placeholder="请输入"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="责任单位" name="responsibleUnits">
              <a-select
                v-model:value="form.responsibleUnits"
                mode="multiple"
                placeholder="请选择责任单位"
                :options="RESPONSIBLE_UNIT_OPTIONS"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 模块二：业主信息 + 建筑信息 -->
      <div v-if="currentStep === 1" class="form-section">
        <h3 class="form-section-title">业主信息</h3>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="项目单位名称" name="unitName">
              <a-input v-model:value="form.unitName" placeholder="请输入项目单位名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目属性" name="projectAttribute">
              <a-select
                v-model:value="form.projectAttribute"
                placeholder="请选择项目属性"
                :options="attributeOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目类别" name="projectCategory">
              <a-select
                v-model:value="form.projectCategory"
                placeholder="请选择项目类别"
                :options="categoryOptions"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <h3 class="form-section-title" style="margin-top: 8px">建筑信息</h3>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="建设地点" name="constructionSite">
              <a-input v-model:value="form.constructionSite" placeholder="请输入建设地点" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="详细建设地址" name="constructionAddress">
              <a-input v-model:value="form.constructionAddress" placeholder="请输入详细建设地址" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="建设性质" name="constructionNature">
              <a-select
                v-model:value="form.constructionNature"
                placeholder="请选择建设性质"
                :options="natureOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="建设进度" name="constructionProgress">
              <a-input v-model:value="form.constructionProgress" placeholder="请输入建设进度" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="建设规模及内容" name="constructionScale">
              <a-textarea
                v-model:value="form.constructionScale"
                placeholder="请输入建设规模及内容"
                :rows="3"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="拟开工时间" name="proposedStartDate">
              <a-date-picker
                v-model:value="form.proposedStartDate"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="拟建成时间" name="proposedEndDate">
              <a-date-picker
                v-model:value="form.proposedEndDate"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item name="needConstructionPermit">
              <a-checkbox v-model:checked="form.needConstructionPermit">
                是否需领取施工许可证
              </a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <!-- 模块三：土地信息 + 其余 -->
      <div v-if="currentStep === 2" class="form-section">
        <h3 class="form-section-title">土地信息</h3>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="本企业已有土地的土地证书编号" name="landCertificateNo">
              <a-input
                v-model:value="form.landCertificateNo"
                placeholder="请输入土地证书编号"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <h3 class="form-section-title" style="margin-top: 8px">其余</h3>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="子项目" name="subProjects">
              <a-select
                v-model:value="form.subProjects"
                mode="multiple"
                show-search
                allow-clear
                placeholder="请搜索并选择子项目"
                :options="SUB_PROJECT_OPTIONS"
                :filter-option="filterSubProject"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showSchemeDate" :span="12">
            <a-form-item label="形成方案完成时间" name="schemeCompleteDate">
              <a-date-picker
                v-model:value="form.schemeCompleteDate"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showGovDates" :span="12">
            <a-form-item label="规划落地完成时间" name="planningCompleteDate">
              <a-date-picker
                v-model:value="form.planningCompleteDate"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="showGovDates" :span="12">
            <a-form-item label="项建书批复完成时间" name="proposalApprovalDate">
              <a-date-picker
                v-model:value="form.proposalApprovalDate"
                value-format="YYYY-MM-DD"
                placeholder="请选择"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <template #footer>
      <a-button @click="close">取消</a-button>
      <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
      <a-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</a-button>
      <a-button v-else type="primary" @click="handleSubmit">提交申报</a-button>
    </template>
  </a-modal>
</template>

<style scoped>
.declare-form {
  max-height: 52vh;
  overflow-y: auto;
  padding-right: 4px;
}
</style>
