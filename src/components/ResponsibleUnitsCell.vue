<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  units?: string[];
}>();

const list = computed(() => props.units?.filter(Boolean) ?? []);
const fullText = computed(() => list.value.join('、'));
</script>

<template>
  <a-tooltip v-if="list.length" :title="fullText">
    <div class="responsible-units-cell">
      <a-tag class="unit-tag">{{ list[0] }}</a-tag>
      <a-tag v-if="list.length > 1" class="unit-tag unit-tag--more">+{{ list.length - 1 }}</a-tag>
    </div>
  </a-tooltip>
  <span v-else class="cell-empty">—</span>
</template>

<style scoped>
.responsible-units-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
}

.unit-tag {
  margin: 0;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unit-tag--more {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  background: var(--color-bg-layout);
  border-color: var(--color-border-secondary);
}

.cell-empty {
  color: var(--color-text-tertiary);
}
</style>
