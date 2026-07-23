<script setup lang="ts">
import { BarChartOutlined, FormOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';
import FundProgressModal from './components/FundProgressModal.vue';
import ProjectAnalysisChartModal from './components/ProjectAnalysisChartModal.vue';

const fundProgressOpen = ref(false);
const projectAnalysisOpen = ref(false);
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">弹窗设计</h1>
      <p class="page-header__desc">集中放置业务弹窗交互原型，便于评审与联调</p>
    </div>

    <a-card :bordered="false" class="design-card">
      <div class="design-card__item">
        <div class="design-card__meta">
          <div class="design-card__name">上级资金进度填报</div>
          <div class="design-card__desc">
            支持按政策类型分别填写年度、月度投资目标（专项债 / 中央预算内）
          </div>
        </div>
        <a-button type="primary" @click="fundProgressOpen = true">
          <template #icon><FormOutlined /></template>
          上级资金进度填报
        </a-button>
      </div>

      <a-divider />

      <div class="design-card__item">
        <div class="design-card__meta">
          <div class="design-card__name">项目分析图表设计</div>
          <div class="design-card__desc">
            移动端精简列表，分类型查看阶段项目数，并提供全部合计 Tab
          </div>
        </div>
        <a-button type="primary" @click="projectAnalysisOpen = true">
          <template #icon><BarChartOutlined /></template>
          项目分析图表设计
        </a-button>
      </div>
    </a-card>

    <FundProgressModal v-model:open="fundProgressOpen" />
    <ProjectAnalysisChartModal v-model:open="projectAnalysisOpen" />
  </div>
</template>

<style scoped>
.design-card {
  box-shadow: 0 1px 4px rgba(19, 75, 234, 0.05);
}

.design-card__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.design-card__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text, #1f1f1f);
  margin-bottom: 4px;
}

.design-card__desc {
  font-size: 13px;
  color: var(--color-text-secondary, #8c8c8c);
}
</style>
