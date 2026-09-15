<script setup lang="ts">
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { projectsApi } from '@/api/supplement-pool';
import { qingpuSupplementApi } from '@/api/qingpu-supplement';
import { getCurrentUser } from '@/mock/current-user';
import {
  QP_AGENCY_UNIT_OPTIONS,
  QP_CONSTRUCTION_NATURE_OPTIONS,
  QP_PERMIT_OPTIONS,
  QP_PROJECT_ATTRIBUTE_OPTIONS,
  QP_PROJECT_CATEGORY_OPTIONS,
  QP_PROJECT_LEVEL_OPTIONS,
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_TERRITORY_OPTIONS,
  QP_YES_NO_OPTIONS,
  createEmptyQingpuSupplementForm,
  isSocialInvestmentCategory,
  type QingpuSupplementForm,
  type QingpuSupplementItem
} from '@/types/qingpu-supplement';

const props = defineProps<{
  open: boolean;
  record: QingpuSupplementItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const currentStep = ref(0);
const form = reactive<QingpuSupplementForm>(createEmptyQingpuSupplementForm());
const nodeCompleteDate = ref('');
const nodeNotInvolved = ref(false);
const implOptions = ref<{ value: string; label: string }[]>([]);

const isEdit = computed(() => Boolean(props.record));
const isLastStep = computed(() => currentStep.value >= 3);
const isMainProject = computed(() => form.projectLevel === '主项目');
const isSocial = computed(() => isSocialInvestmentCategory(form.projectCategory || ''));
const nodeTitle = computed(() => (isSocial.value ? '形象方案' : '项建书'));

const STEP_FIELDS: string[][] = [
  [
    'projectName',
    'projectLevel',
    'hasRelatedSubProjects',
    'subProjectCodes',
    'relatedParentProjectCode',
    'unitName',
    'projectStatus',
    'territory',
    'responsibleUnits',
    'projectAttribute',
    'projectCategory'
  ],
  [
    'constructionSite',
    'constructionAddress',
    'constructionNature',
    'constructionScale',
    'needConstructionPermit'
  ],
  ['totalInvestment'],
  []
];

const rules: Record<string, Rule[]> = {
  projectName: [{ required: true, message: '请输入项目名称' }],
  projectLevel: [{ required: true, message: '请选择项目层级' }],
  hasRelatedSubProjects: [{ required: true, message: '请选择是否有关联子项目' }],
  subProjectCodes: [
    {
      validator: async () => {
        if (isMainProject.value && form.hasRelatedSubProjects && !form.subProjectCodes.length) {
          return Promise.reject('请选择子项目代码');
        }
        return Promise.resolve();
      }
    }
  ],
  relatedParentProjectCode: [
    {
      validator: async () => {
        if (!isMainProject.value && !form.relatedParentProjectCode) {
          return Promise.reject('请选择关联主项目');
        }
        return Promise.resolve();
      }
    }
  ],
  unitName: [{ required: true, message: '请输入项目单位名称' }],
  projectStatus: [{ required: true, message: '请输入项目状态' }],
  territory: [{ required: true, message: '请选择项目属地' }],
  responsibleUnits: [{ required: true, type: 'array', min: 1, message: '请选择项目责任单位' }],
  projectAttribute: [{ required: true, message: '请选择项目属性' }],
  projectCategory: [{ required: true, message: '请选择项目类别' }],
  constructionSite: [{ required: true, message: '请输入建设地点' }],
  constructionAddress: [{ required: true, message: '请输入详细建设地址' }],
  constructionNature: [{ required: true, message: '请选择建设性质' }],
  constructionScale: [{ required: true, message: '请输入建设规模及内容' }],
  needConstructionPermit: [{ required: true, message: '请选择是否需领施工许可证' }],
  totalInvestment: [{ required: true, type: 'number', message: '请输入总投资（万元）' }]
};

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    currentStep.value = 0;
    Object.assign(form, createEmptyQingpuSupplementForm());
    nodeCompleteDate.value = '';
    nodeNotInvolved.value = false;
    if (props.record) {
      Object.assign(form, {
        ...createEmptyQingpuSupplementForm(),
        ...props.record,
        subProjectCodes: [...(props.record.subProjectCodes || [])],
        responsibleUnits: [...props.record.responsibleUnits]
      });
      const node = isSocialInvestmentCategory(props.record.projectCategory)
        ? props.record.imageScheme
        : props.record.proposalDoc;
      nodeCompleteDate.value = node?.completeDate || '';
      nodeNotInvolved.value = Boolean(node?.notInvolved);
    }
    const impl = await projectsApi.getList({ poolStage: 'implementation' });
    implOptions.value = impl.map((p) => ({
      value: p.projectCode,
      label: `${p.projectCode}　${p.projectName}`
    }));
  }
);

watch(
  () => form.projectLevel,
  (level) => {
    if (level === '子项目') {
      form.hasRelatedSubProjects = false;
      form.subProjectCodes = [];
    } else {
      form.relatedParentProjectCode = undefined;
    }
  }
);

watch(
  () => form.hasRelatedSubProjects,
  (val) => {
    if (!val) form.subProjectCodes = [];
  }
);

watch(nodeNotInvolved, (val) => {
  if (val) nodeCompleteDate.value = '';
});

function close() {
  emit('update:open', false);
}

async function validateCurrentStep() {
  try {
    const fields = STEP_FIELDS[currentStep.value];
    if (fields.length) {
      await formRef.value?.validateFields(fields);
    }
    if (currentStep.value === 0) {
      const taken = await qingpuSupplementApi.isProjectNameTaken(
        form.projectName,
        props.record?.id
      );
      if (taken) {
        message.warning('项目名称已存在，请核对后重新填写');
        return false;
      }
      const user = getCurrentUser();
      const territoryValues = QP_TERRITORY_OPTIONS.map((o) => o.value);
      if (isSocial.value && territoryValues.includes(user.unit) && user.unit !== form.territory) {
        message.warning('社会投资项目的申请人单位须与项目属地一致');
        return false;
      }
      if (!isSocial.value && !form.responsibleUnits.includes(user.unit) && user.role !== 'admin') {
        message.warning('政府投资/其他项目的申请人单位须包含在责任单位范围内');
        return false;
      }
    }
    if (currentStep.value === 3) {
      if (!form.projectCategory) {
        message.warning('请先在业主信息中选择项目类别');
        return false;
      }
      if (!nodeNotInvolved.value && !nodeCompleteDate.value) {
        message.warning(`请填写${nodeTitle.value}完成时间`);
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
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

function payload(): QingpuSupplementForm {
  const node = {
    notInvolved: nodeNotInvolved.value,
    completeDate: nodeNotInvolved.value ? undefined : nodeCompleteDate.value
  };
  return {
    ...form,
    subProjectCodes: isMainProject.value && form.hasRelatedSubProjects ? form.subProjectCodes : [],
    relatedParentProjectCode: isMainProject.value ? undefined : form.relatedParentProjectCode,
    imageScheme: isSocial.value ? node : undefined,
    proposalDoc: isSocial.value ? undefined : node
  };
}

async function submit() {
  const ok = await validateCurrentStep();
  if (!ok) return;
  submitting.value = true;
  try {
    const data = payload();
    if (props.record) {
      await qingpuSupplementApi.update(props.record.id, data);
    } else {
      await qingpuSupplementApi.create(data);
    }
    message.success('已流转至审核专员审核，请耐心等候～');
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
    :title="isEdit ? '修改项目申报' : '项目申报'"
    :width="960"
    :style="{ top: '24px' }"
    destroy-on-close
    :footer="null"
    @cancel="close"
  >
    <a-steps :current="currentStep" size="small" class="declare-steps">
      <a-step title="业主信息" />
      <a-step title="建筑信息" />
      <a-step title="资金与土地" />
      <a-step title="节点信息" />
    </a-steps>

    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <div v-show="currentStep === 0">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="项目名称" name="projectName">
              <a-input v-model:value="form.projectName" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目层级" name="projectLevel">
              <a-select
                v-model:value="form.projectLevel"
                :options="QP_PROJECT_LEVEL_OPTIONS"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="isMainProject" :span="12">
            <a-form-item label="是否有关联子项目" name="hasRelatedSubProjects">
              <a-radio-group v-model:value="form.hasRelatedSubProjects" :options="QP_YES_NO_OPTIONS" />
            </a-form-item>
          </a-col>
          <a-col v-if="isMainProject && form.hasRelatedSubProjects" :span="24">
            <a-form-item label="子项目代码" name="subProjectCodes">
              <a-select
                v-model:value="form.subProjectCodes"
                mode="multiple"
                allow-clear
                show-search
                option-filter-prop="label"
                :options="implOptions"
                placeholder="搜索实施库项目代码 / 名称"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="!isMainProject" :span="24">
            <a-form-item label="关联主项目" name="relatedParentProjectCode">
              <a-select
                v-model:value="form.relatedParentProjectCode"
                allow-clear
                show-search
                option-filter-prop="label"
                :options="implOptions"
                placeholder="搜索实施库主项目"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目单位名称" name="unitName">
              <a-input v-model:value="form.unitName" placeholder="请输入项目单位名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目状态" name="projectStatus">
              <a-input v-model:value="form.projectStatus" placeholder="如：前期、在建、竣工" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目属地" name="territory">
              <a-select
                v-model:value="form.territory"
                show-search
                :options="QP_TERRITORY_OPTIONS"
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
                option-filter-prop="label"
                :options="QP_RESPONSIBLE_UNIT_OPTIONS"
                placeholder="可多选"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目代建单位" name="agencyUnit">
              <a-select
                v-model:value="form.agencyUnit"
                allow-clear
                :options="QP_AGENCY_UNIT_OPTIONS"
                placeholder="选填"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目属性" name="projectAttribute">
              <a-select
                v-model:value="form.projectAttribute"
                :options="QP_PROJECT_ATTRIBUTE_OPTIONS"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目类别" name="projectCategory">
              <a-select
                v-model:value="form.projectCategory"
                :options="QP_PROJECT_CATEGORY_OPTIONS"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-show="currentStep === 1">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="建设地点" name="constructionSite">
              <a-input v-model:value="form.constructionSite" placeholder="请输入建设地点" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="建设性质" name="constructionNature">
              <a-select
                v-model:value="form.constructionNature"
                :options="QP_CONSTRUCTION_NATURE_OPTIONS"
                placeholder="请选择"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="详细建设地址" name="constructionAddress">
              <a-input v-model:value="form.constructionAddress" placeholder="请输入详细建设地址" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="建设规模及内容" name="constructionScale">
              <a-textarea
                v-model:value="form.constructionScale"
                :rows="3"
                placeholder="请输入建设规模及内容"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="项目进度" name="projectProgress">
              <a-textarea
                v-model:value="form.projectProgress"
                :rows="2"
                placeholder="选填"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="拟开工时间" name="proposedStartDate">
              <a-date-picker
                v-model:value="form.proposedStartDate"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                placeholder="选填"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="拟建成时间" name="proposedEndDate">
              <a-date-picker
                v-model:value="form.proposedEndDate"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                placeholder="选填"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="是否需领施工许可证" name="needConstructionPermit">
              <a-radio-group v-model:value="form.needConstructionPermit" :options="QP_PERMIT_OPTIONS" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-show="currentStep === 2">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="总投资（万元）" name="totalInvestment">
              <a-input-number
                v-model:value="form.totalInvestment"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入总投资"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="本企业已有土地的土地证书编号" name="ownLandCertNo">
              <a-input v-model:value="form.ownLandCertNo" placeholder="选填" />
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <div v-show="currentStep === 3">
        <a-alert
          class="node-alert"
          type="info"
          show-icon
          :message="`按项目类别填报${nodeTitle}`"
          :description="
            isSocial
              ? '社会投资项目填报形象方案，字段与节点填报一致。'
              : '政府投资 / 其他项目填报项建书，字段与节点填报一致。'
          "
        />
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item :label="`${nodeTitle}完成时间`" :required="!nodeNotInvolved">
              <a-date-picker
                v-model:value="nodeCompleteDate"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                placeholder="请选择完成时间"
                :disabled="nodeNotInvolved"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item class="node-skip">
              <a-checkbox v-model:checked="nodeNotInvolved">不涉及此节点</a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <div class="declare-footer">
      <a-button @click="close">取消</a-button>
      <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
      <a-button v-if="!isLastStep" type="primary" @click="nextStep">下一步</a-button>
      <a-button v-else type="primary" :loading="submitting" @click="submit">提交申请</a-button>
    </div>
  </a-modal>
</template>

<style scoped>
.declare-steps {
  margin-bottom: 20px;
}
.node-alert {
  margin-bottom: 16px;
}
.node-skip {
  display: flex;
  align-items: flex-end;
  min-height: 32px;
  padding-top: 30px;
}
.declare-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-secondary);
}
</style>
