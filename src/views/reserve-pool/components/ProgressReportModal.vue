<script setup lang="ts">
import { message } from 'ant-design-vue';
import { computed, ref, watch } from 'vue';
import { reservePoolApi } from '@/api/reserve-pool';
import { getReserveProjectName, type ReserveProjectItem } from '@/types/reserve-pool';

const props = defineProps<{
  open: boolean;
  record: ReserveProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const currentProgress = ref('');
const nextPlan = ref('');

const historyCount = computed(() => props.record?.progressReports?.length ?? 0);
const latest = computed(() => props.record?.progressReports?.[0]);

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    // 每次均为新增填报，不覆盖历史
    currentProgress.value = '';
    nextPlan.value = '';
  }
);

function close() {
  emit('update:open', false);
}

async function submit() {
  if (!props.record) return;
  if (!currentProgress.value.trim()) {
    message.warning('请填写当前进度');
    return;
  }
  if (!nextPlan.value.trim()) {
    message.warning('请填写下步计划');
    return;
  }
  submitting.value = true;
  try {
    await reservePoolApi.updateProgress(props.record.id, {
      currentProgress: currentProgress.value,
      nextPlan: nextPlan.value
    });
    message.success('已新增一条进度填报');
    emit('saved');
    close();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    title="填报项目进度"
    :width="680"
    destroy-on-close
    :confirm-loading="submitting"
    ok-text="提交本次填报"
    @ok="submit"
    @cancel="close"
  >
    <template v-if="record">
      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 12px"
        :message="getReserveProjectName(record)"
        :description="`可多次填报；本次提交将新增一条记录，不覆盖历史。已有 ${historyCount} 条填报记录。`"
      />

      <a-card v-if="latest" size="small" title="最近一次填报（只读）" style="margin-bottom: 12px">
        <p><strong>当前进度：</strong>{{ latest.currentProgress }}</p>
        <p style="margin-bottom: 4px"><strong>下步计划：</strong>{{ latest.nextPlan }}</p>
        <div style="color: rgba(0, 0, 0, 0.45); font-size: 12px">
          {{ latest.reportedBy }} · {{ latest.reportedAt }}
        </div>
      </a-card>

      <a-divider orientation="left" plain>本次新增填报</a-divider>
      <a-form layout="vertical">
        <a-form-item label="当前进度" required>
          <a-textarea
            v-model:value="currentProgress"
            :rows="4"
            placeholder="请填写本次项目当前推进情况"
            :maxlength="500"
            show-count
          />
        </a-form-item>
        <a-form-item label="下步计划" required>
          <a-textarea
            v-model:value="nextPlan"
            :rows="4"
            placeholder="请填写下一步工作计划"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>
