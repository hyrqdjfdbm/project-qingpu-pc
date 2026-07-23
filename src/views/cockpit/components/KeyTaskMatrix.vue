<script setup lang="ts">
import type { KeyTaskData } from '@/mock/cockpit-data';

defineProps<{
  data: KeyTaskData;
}>();
</script>

<template>
  <table class="key-task-table">
    <tbody>
      <tr>
        <td rowspan="5" class="cell cell--root">攻坚项目</td>
        <td rowspan="2" class="cell cell--group">新开项目总数</td>
        <td class="cell cell--label">新开未开项目数</td>
        <td class="cell cell--value">{{ data.newNotStarted }}</td>
      </tr>
      <tr>
        <td colspan="2" class="cell cell--split">
          <div class="split-grid">
            <span class="split-label">新开已开项目数</span>
            <span class="split-value">{{ data.newStarted }}</span>
            <span class="split-label">形象进度总投资（亿元）</span>
            <span class="split-value split-value--gold">{{ data.imageProgressInvestment.toFixed(1) }}</span>
          </div>
        </td>
      </tr>
      <tr>
        <td rowspan="3" class="cell cell--group">问题项目总数</td>
        <td class="cell cell--label">问题条数</td>
        <td class="cell cell--value">{{ data.problemItemTotal }}</td>
      </tr>
      <tr>
        <td class="cell cell--label">已解决问题条数</td>
        <td class="cell cell--value">{{ data.resolvedProblemItems }}</td>
      </tr>
      <tr>
        <td class="cell cell--label">未解决问题条数</td>
        <td class="cell cell--value cell--warn">{{ data.unresolvedProblemItems }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.key-task-table {
  width: 100%;
  height: 100%;
  min-height: 200px;
  border-collapse: collapse;
  table-layout: fixed;
  border: 1px solid rgba(0, 180, 255, 0.22);
}

.cell {
  padding: 8px 6px;
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
  vertical-align: middle;
  color: rgba(220, 235, 255, 0.9);
  border: 1px solid rgba(0, 180, 255, 0.18);
  background: rgba(4, 22, 48, 0.92);
}

.cell--root {
  width: 44px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 3px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: #ffd54f;
  background: rgba(0, 70, 130, 0.55);
}

.cell--group {
  width: 28%;
  font-weight: 600;
  color: #e8f4ff;
  background: rgba(0, 55, 110, 0.65);
}

.cell--label {
  color: rgba(180, 210, 240, 0.88);
}

.cell--value {
  width: 22%;
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
}

.cell--warn {
  color: #ff9f43;
}

.cell--split {
  padding: 0;
}

.split-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  align-items: center;
  height: 100%;
  min-height: 44px;
}

.split-label {
  padding: 8px 6px;
  font-size: 11px;
  color: rgba(180, 210, 240, 0.88);
  border-right: 1px solid rgba(0, 180, 255, 0.12);
}

.split-value {
  padding: 8px 10px;
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  border-right: 1px solid rgba(0, 180, 255, 0.12);
}

.split-value:last-child {
  border-right: none;
}

.split-label:last-of-type {
  border-right: 1px solid rgba(0, 180, 255, 0.12);
}

.split-value--gold {
  color: #ffd54f;
}
</style>
