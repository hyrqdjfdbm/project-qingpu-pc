<script setup lang="ts">
import { MenuFoldOutlined, MenuUnfoldOutlined, ProjectOutlined } from '@ant-design/icons-vue';
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { menuGroups, isMenuSubGroup } from '@/router/routes';
import { getCurrentUser } from '@/mock/current-user';
import { workbenchStore } from '@/mock/workbench-store';

const route = useRoute();
const router = useRouter();

const selectedKeys = ref<string[]>([route.path]);
const openKeys = ref<string[]>([
  'cockpit',
  'budget-draw',
  'reserve-pool',
  'reserve-pool-audit',
  'supplement-library',
  'project-management',
  'route-planning',
  'meeting-coordination',
  'work-suspend',
  'assessment-score',
  'two-letters-one-order',
  'alert-management',
  'workbench'
]);
const collapsed = ref(false);

const isCockpit = computed(() => route.meta.fullscreen === true);

const workbenchPendingCount = ref(0);
function refreshWorkbenchBadge() {
  const userId = getCurrentUser().id;
  workbenchPendingCount.value = workbenchStore.getPendingCount(userId);
}
onMounted(() => {
  refreshWorkbenchBadge();
  window.addEventListener('workbench:updated', refreshWorkbenchBadge);
});
onUnmounted(() => {
  window.removeEventListener('workbench:updated', refreshWorkbenchBadge);
});

function resolveOpenKey(path: string) {
  if (path.startsWith('/cockpit')) return ['cockpit'];
  if (path.startsWith('/budget-unit-draw')) return ['budget-draw'];
  if (path.startsWith('/reserve-pool/audit')) return ['reserve-pool', 'reserve-pool-audit'];
  if (path.startsWith('/reserve-pool')) return ['reserve-pool'];
  if (path.startsWith('/supplement-library')) return ['supplement-library'];
  if (path.startsWith('/project-management')) return ['project-management'];
  if (path.startsWith('/route-planning')) return ['route-planning'];
  if (path.startsWith('/meeting-coordination')) return ['meeting-coordination'];
  if (path.startsWith('/work-suspend')) return ['work-suspend'];
  if (path.startsWith('/assessment-score')) return ['assessment-score'];
  if (path.startsWith('/two-letters-one-order')) return ['two-letters-one-order'];
  if (path.startsWith('/alert-management')) return ['alert-management'];
  if (path.startsWith('/workbench')) return ['workbench'];
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
    for (const child of group.children) {
      if (isMenuSubGroup(child)) {
        const hit = child.children.find((c) => c.path === route.path);
        if (hit) return hit.title;
      } else if (child.path === route.path) {
        return child.title;
      }
    }
  }
  return '';
});

function getIcon(icon: { displayName?: string; name?: string }) {
  return () => h(icon);
}

function onMenuClick({ key }: MenuInfo) {
  if (String(key).startsWith('reserve-pool-audit') && !String(key).startsWith('/')) return;
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
          <template v-for="item in group.children" :key="isMenuSubGroup(item) ? item.key : item.path">
            <a-sub-menu v-if="isMenuSubGroup(item)" :key="item.key">
              <template #icon>
                <component :is="getIcon(item.icon)" />
              </template>
              <template #title>{{ item.title }}</template>
              <a-menu-item v-for="sub in item.children" :key="sub.path">
                <template #icon>
                  <component :is="getIcon(sub.icon)" />
                </template>
                {{ sub.title }}
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.path">
              <template #icon>
                <a-badge
                  v-if="item.path === '/workbench'"
                  :count="workbenchPendingCount"
                  :show-zero="false"
                  :offset="[0, 0]"
                >
                  <component :is="getIcon(item.icon)" />
                </a-badge>
                <component v-else :is="getIcon(item.icon)" />
              </template>
              {{ item.title }}
            </a-menu-item>
          </template>
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
