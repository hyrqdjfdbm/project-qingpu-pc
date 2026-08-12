<script setup lang="ts">
import { UploadOutlined } from '@ant-design/icons-vue';
import type { UploadFile, UploadProps } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue/es/form';
import type {
  BudgetDrawPayload,
  BudgetDrawRecord,
  BudgetUnit,
  DrawAttachmentCategoryKey
} from '@/types/budget-draw';
import { DRAW_ATTACHMENT_CATEGORIES, getDrawAttachmentDisplayLabel } from '@/types/budget-draw';
import PublicityCard from './PublicityCard.vue';

const props = defineProps<{
  open: boolean;
  units: BudgetUnit[];
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: BudgetDrawPayload];
}>();

const formRef = ref<FormInstance>();
const drawing = ref(false);
const result = ref<BudgetDrawRecord | null>(null);

function createEmptyFileLists(): Record<DrawAttachmentCategoryKey, UploadFile[]> {
  return {
    applicationForm: [],
    projectProposal: [],
    feasibilityReport: [],
    preliminaryDesign: [],
    budgetEstimate: [],
    quantityMeasure: []
  };
}

const fileLists = ref(createEmptyFileLists());

const form = reactive({
  projectName: '',
  totalInvestment: undefined as number | undefined,
  constructionUnit: '',
  legalPerson: '',
  handler: '',
  contactPhone: '',
  compileUnit: '',
  compileContact: '',
  compilePhone: '',
  constructionContent: '',
  excludedUnitIds: [] as string[],
  excludedReasons: {} as Record<string, string>
});

const unitOptions = computed(() =>
  props.units.map((u) => ({ value: u.id, label: u.name }))
);

const eligibleCount = computed(() => {
  const excluded = new Set(form.excludedUnitIds);
  return props.units.filter((u) => !excluded.has(u.id)).length;
});

const excludedUnitList = computed(() =>
  form.excludedUnitIds
    .map((id) => props.units.find((u) => u.id === id))
    .filter((u): u is BudgetUnit => Boolean(u))
);

watch(
  () => form.excludedUnitIds,
  (ids) => {
    for (const key of Object.keys(form.excludedReasons)) {
      if (!ids.includes(key)) {
        delete form.excludedReasons[key];
      }
    }
  }
);

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.projectName = '';
      form.totalInvestment = undefined;
      form.constructionUnit = '';
      form.legalPerson = '';
      form.handler = '';
      form.contactPhone = '';
      form.compileUnit = '';
      form.compileContact = '';
      form.compilePhone = '';
      form.constructionContent = '';
      form.excludedUnitIds = [];
      form.excludedReasons = {};
      fileLists.value = createEmptyFileLists();
      result.value = null;
      drawing.value = false;
      formRef.value?.clearValidate();
    }
  }
);

const beforeUpload: UploadProps['beforeUpload'] = () => false;

function close() {
  emit('update:open', false);
}

async function handleConfirm() {
  if (result.value) {
    close();
    return;
  }

  try {
    await formRef.value?.validate();
    if (eligibleCount.value <= 0) {
      return;
    }
    drawing.value = true;
    emit('submit', {
      projectName: form.projectName.trim(),
      totalInvestment: form.totalInvestment!,
      constructionUnit: form.constructionUnit.trim(),
      legalPerson: form.legalPerson.trim(),
      handler: form.handler.trim(),
      contactPhone: form.contactPhone.trim(),
      compileUnit: form.compileUnit.trim(),
      compileContact: form.compileContact.trim(),
      compilePhone: form.compilePhone.trim(),
      constructionContent: form.constructionContent.trim(),
      excludedUnitIds: [...form.excludedUnitIds],
      excludedReasons: { ...form.excludedReasons },
      attachments: DRAW_ATTACHMENT_CATEGORIES.flatMap((category) =>
        fileLists.value[category.key].map((file) => ({
          category: category.key,
          name: file.name,
          size: file.size ?? 0,
          url: file.originFileObj
            ? URL.createObjectURL(file.originFileObj as File)
            : undefined
        }))
      )
    });
  } catch {
    // 校验未通过
  }
}

function showResult(record: BudgetDrawRecord) {
  result.value = record;
  drawing.value = false;
}

function showError() {
  drawing.value = false;
}

defineExpose({ showResult, showError });
</script>

<template>
  <a-modal
    :open="open"
    :title="result ? '抽取结果公示' : '概算单位随机抽取'"
    :width="result ? 920 : 760"
    :footer="result ? null : undefined"
    :confirm-loading="drawing"
    destroy-on-close
    @cancel="close"
  >
    <template v-if="!result">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item
          label="项目名称"
          name="projectName"
          :rules="[{ required: true, message: '请输入项目名称' }]"
        >
          <a-input v-model:value="form.projectName" placeholder="请输入项目名称" allow-clear />
        </a-form-item>

        <a-form-item
          label="投资额（万元）"
          name="totalInvestment"
          :rules="[{ required: true, message: '请输入投资额' }]"
        >
          <a-input-number
            v-model:value="form.totalInvestment"
            :min="0"
            :precision="2"
            placeholder="请输入投资额（万元）"
            style="width: 100%"
          />
        </a-form-item>

        <div class="form-section">
          <div class="form-section__title">建设单位信息</div>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item
                label="建设单位"
                name="constructionUnit"
                :rules="[{ required: true, message: '请输入建设单位' }]"
              >
                <a-input v-model:value="form.constructionUnit" placeholder="请输入建设单位" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="法人"
                name="legalPerson"
                :rules="[{ required: true, message: '请输入法人' }]"
              >
                <a-input v-model:value="form.legalPerson" placeholder="请输入法人" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="经办人"
                name="handler"
                :rules="[{ required: true, message: '请输入经办人' }]"
              >
                <a-input v-model:value="form.handler" placeholder="请输入经办人" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="联系电话"
                name="contactPhone"
                :rules="[{ required: true, message: '请输入联系电话' }]"
              >
                <a-input v-model:value="form.contactPhone" placeholder="请输入联系电话" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div class="form-section">
          <div class="form-section__title">编制单位信息</div>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item
                label="编制单位"
                name="compileUnit"
                :rules="[{ required: true, message: '请输入编制单位' }]"
              >
                <a-input v-model:value="form.compileUnit" placeholder="请输入编制单位" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="联系人"
                name="compileContact"
                :rules="[{ required: true, message: '请输入联系人' }]"
              >
                <a-input v-model:value="form.compileContact" placeholder="请输入联系人" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="电话"
                name="compilePhone"
                :rules="[{ required: true, message: '请输入电话' }]"
              >
                <a-input v-model:value="form.compilePhone" placeholder="请输入电话" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <a-form-item
          label="建设内容"
          name="constructionContent"
          :rules="[{ required: true, message: '请输入建设内容' }]"
        >
          <a-textarea
            v-model:value="form.constructionContent"
            placeholder="请输入建设内容"
            :rows="3"
          />
        </a-form-item>

        <a-form-item label="不参与抽取单位" name="excludedUnitIds">
          <a-select
            v-model:value="form.excludedUnitIds"
            mode="multiple"
            allow-clear
            placeholder="勾选后该单位不参与本次抽取"
            :options="unitOptions"
            :max-tag-count="2"
          />
          <div class="form-hint">
            每选择一个不参与抽取的单位，均需填写原因。
            当前可抽取 <strong>{{ eligibleCount }}</strong> 家。
          </div>
        </a-form-item>

        <div v-if="excludedUnitList.length" class="exclude-reasons">
          <div class="exclude-reasons__title">不参与抽取原因</div>
          <div
            v-for="unit in excludedUnitList"
            :key="unit.id"
            class="exclude-reason-item"
          >
            <div class="exclude-reason-item__name">{{ unit.name }}</div>
            <a-form-item
              :name="['excludedReasons', unit.id]"
              :rules="[{ required: true, message: '请填写不参与抽取原因' }]"
            >
              <a-textarea
                v-model:value="form.excludedReasons[unit.id]"
                placeholder="请输入该单位不参与本次抽取的原因"
                :rows="2"
                allow-clear
              />
            </a-form-item>
          </div>
        </div>

        <div class="attachment-section">
          <div class="attachment-section__title">附件上传</div>
          <div
            v-for="category in DRAW_ATTACHMENT_CATEGORIES"
            :key="category.key"
            class="attachment-block"
          >
            <div class="attachment-block__label">
              {{ getDrawAttachmentDisplayLabel(category.key) }}
            </div>
            <a-upload
              v-model:file-list="fileLists[category.key]"
              class="attachment-upload"
              multiple
              :before-upload="beforeUpload"
            >
              <a-button size="small">
                <UploadOutlined />
                选择文件
              </a-button>
            </a-upload>
          </div>
        </div>
      </a-form>

      <div v-if="drawing" class="drawing-tip">
        <a-spin /> 正在随机抽取，请稍候…
      </div>
    </template>

    <template v-else>
      <PublicityCard :record="result" variant="hero" />
      <div class="result-actions">
        <a-button type="primary" @click="close">完成公示</a-button>
      </div>
    </template>

    <template v-if="!result" #footer>
      <a-button @click="close">取消</a-button>
      <a-button
        type="primary"
        :loading="drawing"
        :disabled="eligibleCount <= 0"
        @click="handleConfirm"
      >
        确认抽取
      </a-button>
    </template>
  </a-modal>
</template>

<style scoped>
.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.form-hint strong {
  color: var(--color-primary);
}

.form-section {
  margin-bottom: 8px;
  padding: 12px;
  background: var(--color-bg-secondary, #fafafa);
  border: 1px solid var(--color-border, #f0f0f0);
  border-radius: 6px;
}

.form-section__title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text, #1f1f1f);
}

.exclude-reasons {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-bg-secondary, #fafafa);
  border: 1px solid var(--color-border, #f0f0f0);
  border-radius: 6px;
}

.exclude-reasons__title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text, #1f1f1f);
}

.exclude-reason-item + .exclude-reason-item {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border, #e8e8e8);
}

.exclude-reason-item__name {
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
}

.exclude-reason-item :deep(.ant-form-item) {
  margin-bottom: 0;
}

.attachment-section {
  margin-bottom: 8px;
}

.attachment-section__title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1f1f1f);
}

.attachment-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: var(--color-bg-secondary, #fafafa);
  border: 1px solid var(--color-border, #f0f0f0);
  border-radius: 4px;
}

.attachment-block__label {
  flex: 0 0 240px;
  padding-top: 4px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-text, #1f1f1f);
}

.attachment-upload {
  flex: 1;
  min-width: 0;
}

.attachment-upload :deep(.ant-upload-list) {
  margin-top: 4px;
}

.attachment-upload :deep(.ant-upload-list-item) {
  margin-top: 4px;
  padding: 2px 8px;
  font-size: 12px;
}

.drawing-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: var(--color-text-secondary);
}

.result-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
