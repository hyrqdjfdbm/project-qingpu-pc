<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { theme } from '@/theme';
import EnterpriseLayout from '@/layouts/EnterpriseLayout.vue';

dayjs.locale('zh-cn');
</script>

<template>
  <a-config-provider :locale="zhCN" :theme="theme">
    <das-theme-provider :theme="theme">
      <EnterpriseLayout />
    </das-theme-provider>
  </a-config-provider>
</template>
