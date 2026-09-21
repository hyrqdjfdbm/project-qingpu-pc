<script setup lang="ts">
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { projectsApi } from '@/api/supplement-pool';
import { qingpuWithdrawApi } from '@/api/qingpu-withdraw';
import {
  createEmptyQingpuWithdrawForm,
  type QingpuWithdrawForm,
  type QingpuWithdrawItem
} from '@/types/qingpu-withdraw';
import type { SupplementProjectItem } from '@/types/supplement-pool';

const props = defineProps<{
  open: boolean;
  record: QingpuWithdrawItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const form = reactive<QingpuWithdrawForm>(createEmptyQingpuWithdrawForm());
const projectOptions = ref<{ value: string; label: string; raw: SupplementProjectItem }[]>([]);

const isEdit = computed(() => Boolean(props.record));

const rules: Record<string, Rule[]> = {
  projectId: [{ required: true, message: '请选择退库项目' }],
  reason: [{ required: true, message: '请填写退库原因' }]
};

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    Object.assign(form, createEmptyQingpuWithdrawForm());
    const impl = await projectsApi.getList({ poolStage: 'implementation' });
    projectOptions.value = impl.map((p) => ({
      value: p.id,
      label: `${p.projectCode}　${p.projectName}`,
      raw: p
    }));
    if (props.record) {
      Object.assign(form, {
        ...createEmptyQingpuWithdrawForm(),
        ...props.record,
        responsibleUnits: [...props.record.responsibleUnits]
      });
      if (!projectOptions.value.some((o) => o.value === props.record!.projectId)) {
        projectOptions.value.unshift({
          value: props.record.projectId,
          label: `${props.record.projectCode}　${props.record.projectName}`,
          raw: {
            id: props.record.projectId,
            projectCode: props.record.projectCode,
            projectName: props.record.projectName,
            projectAbbr: props.record.projectAbbr,
            projectLocation: props.record.statisticalBelonging,
            totalInvestment: props.record.totalInvestment,
            responsibleUnits: props.record.responsibleUnits
          } as SupplementProjectItem
        });
      }
    }
  }
);

function fillFromProject(id: string) {
  const hit = projectOptions.value.find((o) => o.value === id)?.raw;
  if (!hit) return;
  form.projectId = hit.id;
  form.projectName = hit.projectName;
  form.projectCode = hit.projectCode;
  form.projectAbbr = hit.projectAbbr;
  form.totalInvestment = hit.totalInvestment;
  form.statisticalBelonging = hit.projectLocation;
  form.responsibleUnits = [...(hit.responsibleUnits || [])];
}

function close() {
  emit('update:open', false);
}

async function submit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    const payload: QingpuWithdrawForm = {
      ...form,
      hasReplacement: false,
      replacementProjectId: undefined,
      replacementProjectName: undefined,
      replacementProjectCode: undefined
    };
    if (props.record) {
      await qingpuWithdrawApi.update(props.record.id, payload);
    } else {
      await qingpuWithdrawApi.create(payload);
    }
    message.success('已流转至审批专员审核，请耐心等候～');
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
    :title="isEdit ? '修改退库申请' : '项目退库'"
    :width="640"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交申请"
    @ok="submit"
    @cancel="close"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="退库项目" name="projectId">
        <a-select
          v-model:value="form.projectId"
          show-search
          option-filter-prop="label"
          :options="projectOptions"
          placeholder="请输入项目代码｜项目名称｜项目简称"
          @change="(v: string) => fillFromProject(v)"
        />
      </a-form-item>
      <a-form-item label="退库原因" name="reason">
        <a-textarea v-model:value="form.reason" :rows="4" placeholder="请输入退库原因" :maxlength="300" show-count />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
