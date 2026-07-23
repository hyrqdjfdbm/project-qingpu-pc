import type { RouteRecordRaw } from 'vue-router';
import {
  BankOutlined,
  BuildOutlined,
  BulbOutlined,
  CalendarOutlined,
  ClusterOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FlagOutlined,
  FormOutlined,
  FundOutlined,
  FundProjectionScreenOutlined,
  GiftOutlined,
  TeamOutlined,
  UserSwitchOutlined
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
    key: 'cockpit',
    title: '驾驶舱',
    children: [
      { path: '/cockpit', title: '驾驶舱', icon: FundProjectionScreenOutlined }
    ]
  },
  {
    key: 'budget-draw',
    title: '概算管理',
    children: [
      { path: '/budget-unit-draw', title: '概算单位随机抽取', icon: GiftOutlined }
    ]
  },
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
      },
      { path: '/project-management/modal-design', title: '弹窗设计', icon: FormOutlined },
      { path: '/project-management/key-project-overview', title: '重大攻坚项目概览', icon: FlagOutlined },
      {
        path: '/project-management/image-progress-completion',
        title: '形象进度完成情况',
        icon: FundOutlined
      }
    ]
  },
  {
    key: 'route-planning',
    title: '路线规划',
    children: [
      { path: '/route-planning/saturday-activity', title: '周六进行时', icon: CalendarOutlined },
      { path: '/route-planning/city-leader', title: '市领导督帮', icon: UserSwitchOutlined },
      { path: '/route-planning/project-office', title: '项目办督帮', icon: TeamOutlined }
    ]
  },
  {
    key: 'meeting-coordination',
    title: '会议协调',
    children: [
      { path: '/meeting-coordination', title: '会议协调事项', icon: ClusterOutlined }
    ]
  }
];

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/cockpit' },
  {
    path: '/cockpit',
    name: 'Cockpit',
    component: () => import('@/views/cockpit/index.vue'),
    meta: { title: '驾驶舱', icon: FundProjectionScreenOutlined, group: 'cockpit', fullscreen: true }
  },
  {
    path: '/budget-unit-draw',
    name: 'BudgetUnitDraw',
    component: () => import('@/views/budget-unit-draw/index.vue'),
    meta: { title: '概算单位随机抽取', icon: GiftOutlined, group: 'budget-draw' }
  },
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
  },
  {
    path: '/project-management/modal-design',
    name: 'ModalDesign',
    component: () => import('@/views/project-management/modal-design/index.vue'),
    meta: { title: '弹窗设计', icon: FormOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/key-project-overview',
    name: 'KeyProjectOverview',
    component: () => import('@/views/project-management/key-project-overview/index.vue'),
    meta: { title: '重大攻坚项目概览', icon: FlagOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/key-project-overview/:id',
    name: 'KeyProjectDetail',
    component: () => import('@/views/project-management/key-project-overview/detail.vue'),
    meta: { title: '攻坚项目详情', icon: FlagOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/image-progress-completion',
    name: 'ImageProgressCompletion',
    component: () => import('@/views/project-management/image-progress-completion/index.vue'),
    meta: { title: '形象进度完成情况', icon: FundOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/image-progress-completion/:id',
    name: 'ImageProgressCompletionDetail',
    component: () => import('@/views/project-management/image-progress-completion/detail.vue'),
    meta: { title: '形象进度完成情况详情', icon: FundOutlined, group: 'project-management' }
  },
  {
    path: '/route-planning/saturday-activity',
    name: 'SaturdayActivity',
    component: () => import('@/views/route-planning/saturday-activity/index.vue'),
    meta: { title: '周六进行时', icon: CalendarOutlined, group: 'route-planning' }
  },
  {
    path: '/route-planning/city-leader',
    name: 'CityLeaderSupervise',
    component: () => import('@/views/route-planning/city-leader/index.vue'),
    meta: { title: '市领导督帮', icon: UserSwitchOutlined, group: 'route-planning' }
  },
  {
    path: '/route-planning/project-office',
    name: 'ProjectOfficeSupervise',
    component: () => import('@/views/route-planning/project-office/index.vue'),
    meta: { title: '项目办督帮', icon: TeamOutlined, group: 'route-planning' }
  },
  {
    path: '/meeting-coordination',
    name: 'MeetingCoordination',
    component: () => import('@/views/meeting-coordination/index.vue'),
    meta: { title: '会议协调事项', icon: ClusterOutlined, group: 'meeting-coordination' }
  }
];
