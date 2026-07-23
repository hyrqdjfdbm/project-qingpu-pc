<script setup lang="ts">
import { MenuFoldOutlined, MenuUnfoldOutlined, ProjectOutlined } from '@ant-design/icons-vue';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import { computed, h, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { menuGroups } from '@/router/routes';

const route = useRoute();
const router = useRouter();

const selectedKeys = ref<string[]>([route.path]);
const openKeys = ref<string[]>(['cockpit', 'budget-draw', 'project-management', 'route-planning', 'meeting-coordination']);
const collapsed = ref(false);

const isCockpit = computed(() => route.meta.fullscreen === true);

function resolveOpenKey(path: string) {
  if (path.startsWith('/cockpit')) return ['cockpit'];
  if (path.startsWith('/budget-unit-draw')) return ['budget-draw'];
  if (path.startsWith('/project-management')) return ['project-management'];
  if (path.startsWith('/route-planning')) return ['route-planning'];
  if (path.startsWith('/meeting-coordination')) return ['meeting-coordination'];
  return [];
}

watch(collapsed, (val) => {
  if (val) {
    openKeys.value = [];
  } else {
    openKeys.value = resolveOpenKey(route.path);
  }
});

watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path];
    openKeys.value = resolveOpenKey(path);
  },
  { immediate: true }
);

const currentTitle = computed(() => {
  for (const group of menuGroups) {
    const item = group.children.find((c) => c.path === route.path);
    if (item) return item.title;
  }
  return '';
});

function getIcon(icon: { displayName?: string; name?: string }) {
  return () => h(icon);
}

function onMenuClick({ key }: MenuInfo) {
  router.push(String(key));
}
</script>

<template>
  <a-layout class="enterprise-layout">
    <a-layout-sider
      v-model:collapsed="collapsed"
      class="layout-sider"
      :width="208"
      :collapsed-width="64"
      theme="dark"
      collapsible
    >
      <div class="logo" :class="{ 'logo--collapsed': collapsed }">
        <span class="logo-mark">青</span>
        <span v-show="!collapsed" class="logo-text">青浦项目管理</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        :inline-collapsed="collapsed"
        theme="dark"
        mode="inline"
        @click="onMenuClick"
      >
        <a-sub-menu v-for="group in menuGroups" :key="group.key">
          <template #icon><ProjectOutlined /></template>
          <template #title>{{ group.title }}</template>
          <a-menu-item v-for="item in group.children" :key="item.path">
            <template #icon>
              <component :is="getIcon(item.icon)" />
            </template>
            {{ item.title }}
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="layout-header">
        <div class="header-left">
          <a-button type="text" class="collapse-btn" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <span class="header-title">青浦区提质增效全生命周期管理系统</span>
          <span v-if="currentTitle" class="header-breadcrumb">/ {{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <a-avatar size="small" style="background: var(--color-primary)">管</a-avatar>
          <span class="user-name">管理员</span>
        </div>
      </a-layout-header>

      <a-layout-content :class="['layout-content', { 'layout-content--cockpit': isCockpit }]">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.enterprise-layout {
  min-height: 100vh;
}

.layout-sider {
  background: var(--color-sider-bg) !important;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 20px;
  color: #fff;
  overflow: hidden;
  transition: padding 0.2s;
}

.logo--collapsed {
  justify-content: center;
  padding: 0;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  font-size: 14px;
  font-weight: 700;
}

.logo-text {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.collapse-btn {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--spacing-lg);
  background: var(--color-bg-container);
  border-bottom: 1px solid var(--color-border-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-breadcrumb {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  color: var(--color-text-primary);
}

.layout-content {
  padding: var(--spacing-lg);
  background: var(--color-bg-layout);
  min-height: calc(100vh - var(--header-height));
}

.layout-content--cockpit {
  padding: 0;
  background: #040d1a;
  overflow: hidden;
}
</style>
