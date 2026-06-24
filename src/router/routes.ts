import type { RouteRecordRaw } from 'vue-router';
import {
  BankOutlined,
  BuildOutlined,
  BulbOutlined,
  DashboardOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue';

export interface MenuGroup {
  key: string;
  title: string;
  children: {
    path: string;
    title: string;
    icon: typeof DashboardOutlined;
  }[];
}

export const menuGroups: MenuGroup[] = [
  {
    key: 'project-management',
    title: '项目管理',
    children: [
      { path: '/project-management/overview', title: '项目概览', icon: DashboardOutlined },
      { path: '/project-management/planning-pool', title: '谋划库', icon: BulbOutlined },
      { path: '/project-management/supplement-pool', title: '增补库', icon: DatabaseOutlined },
      { path: '/project-management/implementation-pool', title: '实施库', icon: BuildOutlined },
      {
        path: '/project-management/gov-investment-pool',
        title: '政府投资项目库',
        icon: BankOutlined
      }
    ]
  }
];

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/project-management/overview' },
  {
    path: '/project-management/overview',
    name: 'ProjectOverview',
    component: () => import('@/views/project-management/overview/index.vue'),
    meta: { title: '项目概览', icon: DashboardOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/planning-pool',
    name: 'PlanningPool',
    component: () => import('@/views/project-management/planning-pool/index.vue'),
    meta: { title: '谋划库', icon: BulbOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/supplement-pool',
    name: 'SupplementPool',
    component: () => import('@/views/project-management/supplement-pool/index.vue'),
    meta: { title: '增补库', icon: DatabaseOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/implementation-pool',
    name: 'ImplementationPool',
    component: () => import('@/views/project-management/implementation-pool/index.vue'),
    meta: { title: '实施库', icon: BuildOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/gov-investment-pool',
    name: 'GovInvestmentPool',
    component: () => import('@/views/project-management/gov-investment-pool/index.vue'),
    meta: { title: '政府投资项目库', icon: BankOutlined, group: 'project-management' }
  }
];
