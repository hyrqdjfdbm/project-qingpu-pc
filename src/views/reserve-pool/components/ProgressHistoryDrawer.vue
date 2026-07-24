<script setup lang="ts">
import { computed } from 'vue';
import type { ReserveProjectItem } from '@/types/reserve-pool';
import { getReserveProjectName } from '@/types/reserve-pool';

const props = defineProps<{
  open: boolean;
  record: ReserveProjectItem | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const history = computed(() => props.record?.progressReports ?? []);

function close() {
  emit('update:open', false);
}
</script>

<template>
  <a-drawer
    :open="open"
    title="进度填报历史"
    :width="640"
    destroy-on-close
    @close="close"
  >
    <template v-if="record">
      <div style="margin-bottom: 12px">
        <div style="font-weight: 600">{{ getReserveProjectName(record) }}</div>
        <div style="color: rgba(0, 0, 0, 0.45)">
          共 {{ history.length }} 条填报
        </div>
      </div>

      <a-empty v-if="!history.length" description="暂无进度填报记录" />

      <a-timeline v-else>
        <a-timeline-item v-for="(item, index) in history" :key="item.id" :color="index === 0 ? 'blue' : 'gray'">
          <div class="history-head">
            <a-tag v-if="index === 0" color="processing">最新</a-tag>
            <span>{{ item.reportedBy }} · {{ item.reportedAt }}</span>
          </div>
          <a-card size="small" class="history-card">
            <div class="field">
              <div class="label">当前进度</div>
              <div class="value">{{ item.currentProgress }}</div>
            </div>
            <div class="field">
              <div class="label">下步计划</div>
              <div class="value">{{ item.nextPlan }}</div>
            </div>
          </a-card>
        </a-timeline-item>
      </a-timeline>
    </template>
  </a-drawer>
</template>

<style scoped>
.history-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.65);
}

.history-card {
  margin-bottom: 4px;
}

.field + .field {
  margin-top: 10px;
}

.label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
}

.value {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
