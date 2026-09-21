<script setup lang="ts">
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { Modal, message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { qingpuSupplementApi } from '@/api/qingpu-supplement';
import { getCurrentUser } from '@/mock/current-user';
import {
  QP_AGENCY_UNIT_OPTIONS,
  QP_CONSTRUCTION_NATURE_OPTIONS,
  QP_PERMIT_OPTIONS,
  QP_PROJECT_ATTRIBUTE_OPTIONS,
  QP_PROJECT_CATEGORY_OPTIONS,
  QP_RESPONSIBLE_UNIT_OPTIONS,
  QP_TERRITORY_OPTIONS,
  createEmptyQingpuSupplementForm,
  isQingpuBelongingMismatch,
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

const isEdit = computed(() => Boolean(props.record));
const isLastStep = computed(() => currentStep.value >= 3);
const isSocial = computed(() => isSocialInvestmentCategory(form.projectCategory || ''));
const nodeTitle = computed(() => (isSocial.value ? '形象方案' : '项建书'));
const applicantUnit = computed(() => props.record?.applicantUnit || getCurrentUser().unit);
const belongingMismatch = computed(() =>
  isQingpuBelongingMismatch(applicantUnit.value, form.territory)
);

const STEP_FIELDS: string[][] = [
  [
    'projectName',
    'unitName',
    'projectStatus',
    'territory',
    'responsibleUnits',
    'agencyUnit',
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
  unitName: [{ required: true, message: '请输入项目单位名称' }],
  projectStatus: [{ required: true, message: '请输入项目状态' }],
  territory: [{ required: true, message: '请选择纳统归属' }],
  responsibleUnits: [{ required: true, type: 'array', min: 1, message: '请选择项目责任单位' }],
  agencyUnit: [{ required: true, message: '请选择项目代建单位' }],
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
  (open) => {
    if (!open) return;
    currentStep.value = 0;
    Object.assign(form, createEmptyQingpuSupplementForm());
    nodeCompleteDate.value = '';
    nodeNotInvolved.value = false;
    if (props.record) {
      Object.assign(form, {
        ...createEmptyQingpuSupplementForm(),
        ...props.record,
        responsibleUnits: [...props.record.responsibleUnits]
      });
      const node = isSocialInvestmentCategory(props.record.projectCategory)
        ? props.record.imageScheme
        : props.record.proposalDoc;
      nodeCompleteDate.value = node?.completeDate || '';
      nodeNotInvolved.value = Boolean(node?.notInvolved);
    }
  }
);

watch(nodeNotInvolved, (val) => {
  if (val) nodeCompleteDate.value = '';
});

function close() {
  emit('update:open', false);
}

function belongingMismatchText() {
  if (form.territory === '区属') {
    return `申报单位为「${applicantUnit.value}」，不属于区属。纳统归属已选「区属」。`;
  }
  return `申报单位为「${applicantUnit.value}」，纳统归属为「${form.territory}」。`;
}

function confirmMismatchIfNeeded() {
  if (!belongingMismatch.value) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      title: '申报单位与纳统归属不一致',
      content: `${belongingMismatchText()}是否继续？`,
      okText: '继续',
      cancelText: '返回修改',
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
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
  if (currentStep.value === 0) {
    const continueOk = await confirmMismatchIfNeeded();
    if (!continueOk) return;
  }
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
        <a-alert
          v-if="belongingMismatch"
          type="warning"
          show-icon
          class="mismatch-alert"
          message="申报单位与纳统归属不一致"
          :description="belongingMismatchText()"
        />
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="项目名称" name="projectName">
              <a-input v-model:value="form.projectName" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目单位名称" name="unitName">
              <a-input v-model:value="form.unitName" placeholder="请输入项目单位名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目状态" name="projectStatus">
              <a-input v-model:value="form.projectStatus" placeholder="如施工阶段" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="纳统归属" name="territory">
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
                show-search
                :options="QP_AGENCY_UNIT_OPTIONS"
                placeholder="请选择"
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
.mismatch-alert {
  margin-bottom: 16px;
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
