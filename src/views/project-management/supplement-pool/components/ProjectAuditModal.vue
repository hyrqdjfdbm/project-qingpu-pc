<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInstance } from 'ant-design-vue/es/form';
import type { SupplementProjectItem } from '@/types/supplement-pool';
import { PROJECT_TYPE_LABEL } from '@/types/supplement-pool';
import { getAuditDepartment } from '@/config/audit-workflow';

const props = defineProps<{
  open: boolean;
  record: SupplementProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  submit: [payload: { approved: boolean; remark?: string }];
}>();

const formRef = ref<FormInstance>();
const form = reactive({
  approved: true,
  remark: ''
});

const auditDept = computed(() =>
  props.record ? getAuditDepartment(props.record.projectType) : ''
);

const remarkRules = computed(() => [
  {
    type: 'string' as const,
    required: !form.approved,
    message: '退回时请填写审核意见',
    trigger: 'blur' as const
  }
]);

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.approved = true;
      form.remark = '';
      formRef.value?.clearValidate();
    }
  }
);

watch(
  () => form.approved,
  () => {
    formRef.value?.clearValidate('remark');
  }
);

function close() {
  emit('update:open', false);
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    const remark = form.remark.trim();
    emit('submit', {
      approved: form.approved,
      remark: form.approved ? remark || undefined : remark
    });
  } catch {
    // 校验未通过
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="项目审核"
    :width="520"
    destroy-on-close
    @cancel="close"
  >
    <template v-if="record">
      <p class="audit-intro">
        正在审核项目：<strong>{{ record.projectName }}</strong>
      </p>
      <p class="audit-dept">
        审核部门：<strong>{{ auditDept }}</strong>
        <a-tag color="blue" style="margin-left: 8px">{{ PROJECT_TYPE_LABEL[record.projectType] }}</a-tag>
      </p>

      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item label="审核结果" required>
          <a-radio-group v-model:value="form.approved">
            <a-radio :value="true">通过</a-radio>
            <a-radio :value="false">退回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="审核意见"
          name="remark"
          :required="!form.approved"
          :rules="remarkRules"
        >
          <a-textarea
            v-model:value="form.remark"
            :placeholder="form.approved ? '请输入审核意见（选填）' : '请输入审核意见（必填）'"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </template>

    <template #footer>
      <a-button @click="close">取消</a-button>
      <a-button type="primary" @click="handleSubmit">确认</a-button>
    </template>
  </a-modal>
</template>

<style scoped>
.audit-intro {
  margin: 0 0 8px;
}

.audit-dept {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
