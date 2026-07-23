<script setup lang="ts">
import { TrophyOutlined } from '@ant-design/icons-vue';
import type { BudgetDrawRecord } from '@/types/budget-draw';
import DrawAttachmentList from './DrawAttachmentList.vue';

withDefaults(
  defineProps<{
    record: BudgetDrawRecord;
    /** hero 用于弹窗内即时公示，list 用于历史列表 */
    variant?: 'hero' | 'list';
  }>(),
  { variant: 'list' }
);

function formatExcludedSummary(record: BudgetDrawRecord) {
  if (!record.excludedDetails.length) return '无';
  return record.excludedDetails.map((item) => `${item.unitName}（${item.reason}）`).join('；');
}
</script>

<template>
  <!-- 列表：紧凑横向卡片 -->
  <article v-if="variant === 'list'" class="publicity-card publicity-card--list">
    <div class="compact-row compact-row--top">
      <div class="compact-winner">
        <TrophyOutlined class="compact-icon" />
        <span class="compact-label">中签</span>
        <span class="compact-winner-name">{{ record.winnerUnit }}</span>
      </div>
      <time class="compact-time">{{ record.drawTime }}</time>
    </div>
    <div class="compact-row compact-row--details">
      <div class="compact-item compact-item--full">
        <span class="compact-label">项目</span>
        <span class="compact-value">{{ record.projectName }}</span>
      </div>
      <div class="compact-item compact-item--half">
        <span class="compact-label">投资</span>
        <span class="compact-value compact-value--num">{{ record.totalInvestment.toFixed(2) }} 万元</span>
      </div>
      <div class="compact-item compact-item--half">
        <span class="compact-label">参与</span>
        <span class="compact-value">{{ record.eligibleCount }} 家</span>
      </div>
      <div class="compact-item compact-item--quarter">
        <span class="compact-label">建设单位</span>
        <span class="compact-value">{{ record.constructionUnit }}</span>
      </div>
      <div class="compact-item compact-item--quarter">
        <span class="compact-label">法人</span>
        <span class="compact-value">{{ record.legalPerson }}</span>
      </div>
      <div class="compact-item compact-item--quarter">
        <span class="compact-label">经办人</span>
        <span class="compact-value">{{ record.handler }}</span>
      </div>
      <div class="compact-item compact-item--quarter">
        <span class="compact-label">手机号</span>
        <span class="compact-value">{{ record.contactPhone }}</span>
      </div>
      <div class="compact-item compact-item--quarter">
        <span class="compact-label">编制单位</span>
        <span class="compact-value">{{ record.compileUnit }}</span>
      </div>
      <div class="compact-item compact-item--quarter">
        <span class="compact-label">联系人</span>
        <span class="compact-value">{{ record.compileContact }}</span>
      </div>
      <div class="compact-item compact-item--quarter">
        <span class="compact-label">手机号</span>
        <span class="compact-value">{{ record.compilePhone }}</span>
      </div>
      <div class="compact-item compact-item--quarter compact-item--spacer" aria-hidden="true" />
      <div class="compact-item compact-item--full">
        <span class="compact-label">建设内容</span>
        <span class="compact-value">{{ record.constructionContent }}</span>
      </div>
      <div class="compact-item compact-item--full">
        <span class="compact-label">不参与</span>
        <span class="compact-value">{{ formatExcludedSummary(record) }}</span>
      </div>
    </div>
    <div v-if="record.attachments.length" class="compact-attachments">
      <div class="compact-attachments__title">附件</div>
      <DrawAttachmentList :attachments="record.attachments" compact />
    </div>
  </article>

  <!-- 弹窗：结构化公示卡片 -->
  <article v-else class="publicity-card publicity-card--hero">
    <header class="hero-header">
      <div class="hero-header__left">
        <TrophyOutlined class="hero-header__icon" />
        <span class="hero-header__title">抽取结果公示</span>
      </div>
      <time class="hero-header__time">{{ record.drawTime }}</time>
    </header>

    <section class="hero-winner">
      <p class="hero-winner__label">中签单位</p>
      <h2 class="hero-winner__name">{{ record.winnerUnit }}</h2>
    </section>

    <section class="hero-section">
      <div class="hero-section__title">项目信息</div>
      <a-descriptions bordered size="small" :column="4" layout="horizontal">
        <a-descriptions-item label="项目名称" :span="4">
          {{ record.projectName }}
        </a-descriptions-item>
        <a-descriptions-item label="投资额（万元）" :span="2">
          {{ record.totalInvestment.toFixed(2) }} 万元
        </a-descriptions-item>
        <a-descriptions-item label="参与抽取数" :span="2">
          {{ record.eligibleCount }} 家
        </a-descriptions-item>
        <a-descriptions-item label="建设单位">{{ record.constructionUnit }}</a-descriptions-item>
        <a-descriptions-item label="法人">{{ record.legalPerson }}</a-descriptions-item>
        <a-descriptions-item label="经办人">{{ record.handler }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ record.contactPhone }}</a-descriptions-item>
        <a-descriptions-item label="编制单位">{{ record.compileUnit }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{ record.compileContact }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ record.compilePhone }}</a-descriptions-item>
        <a-descriptions-item label=" " class="hero-desc-spacer">&nbsp;</a-descriptions-item>
        <a-descriptions-item label="建设内容" :span="4">
          {{ record.constructionContent }}
        </a-descriptions-item>
      </a-descriptions>
    </section>

    <section class="hero-section">
      <div class="hero-section__title">不参与抽取单位</div>
      <a-table
        v-if="record.excludedDetails.length"
        :columns="[
          { title: '序号', key: 'index', width: 64, align: 'center' },
          { title: '单位名称', dataIndex: 'unitName', key: 'unitName', ellipsis: true },
          { title: '不参与原因', dataIndex: 'reason', key: 'reason', ellipsis: true }
        ]"
        :data-source="record.excludedDetails.map((item, index) => ({ ...item, index: index + 1, key: item.unitName }))"
        :pagination="false"
        size="small"
        bordered
      />
      <div v-else class="hero-empty">无</div>
    </section>

    <section class="hero-section">
      <div class="hero-section__title">附件资料</div>
      <DrawAttachmentList :attachments="record.attachments" />
    </section>
  </article>
</template>

<style scoped>
.publicity-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(19, 75, 234, 0.05);
}

.publicity-card--list {
  padding: 10px 14px;
}

.compact-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compact-row--top {
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
}

.compact-winner {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.compact-icon {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--color-primary);
}

.compact-label {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-secondary, #8c8c8c);
}

.compact-winner-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-secondary, #8c8c8c);
}

.compact-row--details {
  flex-wrap: wrap;
  row-gap: 6px;
}

.compact-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.compact-item--full {
  width: 100%;
}

.compact-item--half {
  width: calc(50% - 6px);
}

.compact-item--quarter {
  width: calc(25% - 9px);
}

.compact-item--spacer {
  visibility: hidden;
  pointer-events: none;
}

.compact-value {
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-text, #1f1f1f);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-item--full .compact-value {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.compact-value--num {
  font-weight: 600;
  color: var(--color-primary);
}

.compact-attachments {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border, #f0f0f0);
}

.compact-attachments__title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text, #1f1f1f);
}

.publicity-card--hero .hero-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: linear-gradient(90deg, rgba(19, 75, 234, 0.1) 0%, rgba(19, 75, 234, 0.03) 100%);
  border-bottom: 1px solid rgba(19, 75, 234, 0.1);
}

.hero-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-header__icon {
  font-size: 15px;
  color: var(--color-primary);
}

.hero-header__title {
  font-size: 14px;
  font-weight: 600;
}

.hero-header__time {
  font-size: 12px;
  color: var(--color-text-secondary, #8c8c8c);
}

.hero-winner {
  padding: 16px;
  text-align: center;
  background: linear-gradient(180deg, rgba(19, 75, 234, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
  border-bottom: 1px solid var(--color-border, #f0f0f0);
}

.hero-winner__label {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--color-text-secondary, #8c8c8c);
}

.hero-winner__name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  word-break: break-all;
}

.hero-section {
  padding: 12px 16px 0;
}

.hero-section:last-child {
  padding-bottom: 16px;
}

.hero-section__title {
  margin-bottom: 8px;
  padding-left: 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: var(--color-text, #1f1f1f);
  border-left: 3px solid var(--color-primary);
}

.hero-empty {
  padding: 12px;
  font-size: 13px;
  color: var(--color-text-secondary, #8c8c8c);
  background: var(--color-bg-secondary, #fafafa);
  border: 1px solid var(--color-border, #f0f0f0);
  border-radius: 4px;
}

:deep(.hero-desc-spacer .ant-descriptions-item-label),
:deep(.hero-desc-spacer .ant-descriptions-item-content) {
  color: transparent;
  user-select: none;
}
</style>
