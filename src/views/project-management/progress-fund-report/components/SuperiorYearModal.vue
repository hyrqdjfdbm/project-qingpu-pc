<script setup lang="ts">
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { progressFundReportApi } from '@/api/progress-fund-report';
import {
  emptySuperiorMonths,
  SUPERIOR_POLICY_LABEL,
  type SuperiorPolicyKey
} from '@/types/progress-fund-report';

const props = defineProps<{
  open: boolean;
  projectId?: string;
  policy?: SuperiorPolicyKey;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const rejectReason = ref('');
const monthlyCollapsed = ref(false);
const projectOptions = ref<{ value: string; label: string }[]>([]);
const projectLocked = computed(() => Boolean(props.projectId));

const form = reactive({
  projectId: undefined as string | undefined,
  policy: 'specialBond' as SuperiorPolicyKey,
  year: new Date().getFullYear(),
  annualTarget: undefined as number | undefined,
  months: emptySuperiorMonths()
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    projectOptions.value = await progressFundReportApi.listOptions();
    form.projectId = props.projectId;
    form.policy = props.policy ?? 'specialBond';
    form.year = new Date().getFullYear();
    form.annualTarget = undefined;
    form.months = emptySuperiorMonths();
    rejectReason.value = '';
    monthlyCollapsed.value = false;
    if (form.projectId) await fillExisting();
  }
);

async function fillExisting() {
  if (!form.projectId) return;
  try {
    const project = await progressFundReportApi.getById(form.projectId);
    const target = project.superior[form.policy].yearTarget;
    if (target && target.year === form.year) {
      form.annualTarget = target.annualTarget;
      rejectReason.value = target.status === 'rejected' ? target.auditComment || '审核已退回' : '';
      form.months = emptySuperiorMonths().map((item) => ({
        month: item.month,
        target: target.monthlyTargets.find((m) => m.month === item.month)?.target
      }));
    }
  } catch {
    /* ignore */
  }
}

function close() {
  emit('update:open', false);
}

function onOk() {
  void handleSubmit();
}

async function handleSubmit() {
  if (!form.projectId) {
    message.warning('请选择项目');
    return;
  }
  if (form.annualTarget === undefined) {
    message.warning('请填写年度资金目标');
    return;
  }
  submitting.value = true;
  try {
    await progressFundReportApi.submitSuperiorYear({
      projectId: form.projectId,
      policy: form.policy,
      year: form.year,
      annualTarget: form.annualTarget,
      monthlyTargets: form.months
    });
    message.success('已提交审核');
    emit('saved');
  } finally {
    submitting.value = false;
    close();
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="上级资金下达和使用计划填报"
    :width="640"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交审核"
    @ok="onOk"
    @cancel="close"
  >
    <a-alert
      v-if="rejectReason"
      type="error"
      show-icon
      style="margin-bottom: 16px"
      message="上次审核已退回"
      :description="rejectReason"
    />
    <a-alert
      type="info"
      show-icon
      style="margin-bottom: 16px"
      message="年初填报两重、两新或专项债资金年度目标及月度使用计划，提交后由审核管理审核。"
    />
    <a-form layout="vertical">
      <a-form-item label="选择项目" required>
        <a-select
          v-model:value="form.projectId"
          :options="projectOptions"
          :disabled="projectLocked"
          show-search
          option-filter-prop="label"
        />
      </a-form-item>
      <a-form-item label="资金类型" required>
        <a-radio-group v-model:value="form.policy">
          <a-radio v-for="(label, key) in SUPERIOR_POLICY_LABEL" :key="key" :value="key">{{ label }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="年度" required>
            <a-input-number v-model:value="form.year" :min="2020" :max="2099" :controls="false" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="16">
          <a-form-item label="年度投资目标（万元）" required>
            <a-input-number
              v-model:value="form.annualTarget"
              :min="0"
              :precision="2"
              :controls="false"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <div class="month-block">
        <div class="month-block__head">
          <span>上级资金月度使用计划</span>
          <a-button type="link" size="small" @click="monthlyCollapsed = !monthlyCollapsed">
            {{ monthlyCollapsed ? '展开' : '收起' }}
            <DownOutlined v-if="monthlyCollapsed" />
            <UpOutlined v-else />
          </a-button>
        </div>
        <div v-show="!monthlyCollapsed" class="month-block__body">
          <div v-for="item in form.months" :key="item.month" class="month-row">
            <div class="month-row__label">{{ form.year }}年{{ item.month }}月</div>
            <a-input-number
              v-model:value="item.target"
              :min="0"
              :precision="2"
              :controls="false"
              placeholder="月度投资计划（万元）"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<style scoped>
.month-block {
  border: 1px solid var(--color-border-secondary, #e8e8e8);
  border-radius: 6px;
  overflow: hidden;
}
.month-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-bg-container, #fafafa);
  font-weight: 600;
}
.month-block__body {
  padding: 12px;
  max-height: 280px;
  overflow: auto;
}
.month-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.month-row__label {
  width: 110px;
  color: var(--color-text-secondary, #8c8c8c);
  font-size: 13px;
}
</style>
