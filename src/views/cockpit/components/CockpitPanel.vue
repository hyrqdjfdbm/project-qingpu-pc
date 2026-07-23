<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="cockpit-panel">
    <span class="cockpit-panel__corner cockpit-panel__corner--tl" />
    <span class="cockpit-panel__corner cockpit-panel__corner--tr" />
    <span class="cockpit-panel__corner cockpit-panel__corner--bl" />
    <span class="cockpit-panel__corner cockpit-panel__corner--br" />

    <div class="cockpit-panel__head">
      <div class="cockpit-panel__title-wrap">
        <span class="cockpit-panel__dot" />
        <h3 class="cockpit-panel__title">{{ title }}</h3>
      </div>
      <div v-if="$slots.extra" class="cockpit-panel__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="cockpit-panel__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cockpit-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(8, 28, 58, 0.92) 0%, rgba(4, 16, 36, 0.88) 100%);
  border: 1px solid rgba(0, 180, 255, 0.22);
  box-shadow:
    inset 0 0 24px rgba(0, 120, 255, 0.06),
    0 4px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
}

.cockpit-panel__corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: #00d4ff;
  border-style: solid;
  opacity: 0.85;
}

.cockpit-panel__corner--tl {
  top: -1px;
  left: -1px;
  border-width: 2px 0 0 2px;
}

.cockpit-panel__corner--tr {
  top: -1px;
  right: -1px;
  border-width: 2px 2px 0 0;
}

.cockpit-panel__corner--bl {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 2px 2px;
}

.cockpit-panel__corner--br {
  right: -1px;
  bottom: -1px;
  border-width: 0 2px 2px 0;
}

.cockpit-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 180, 255, 0.15);
}

.cockpit-panel__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cockpit-panel__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00d4ff;
  box-shadow: 0 0 8px #00d4ff;
}

.cockpit-panel__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #e8f4ff;
  letter-spacing: 0.5px;
}

.cockpit-panel__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.cockpit-panel__body::-webkit-scrollbar {
  width: 4px;
}

.cockpit-panel__body::-webkit-scrollbar-thumb {
  background: rgba(0, 180, 255, 0.3);
  border-radius: 2px;
}
</style>
