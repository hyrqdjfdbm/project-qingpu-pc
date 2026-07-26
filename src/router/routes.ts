import type { RouteRecordRaw } from 'vue-router';
import {
  AlertOutlined,
  AuditOutlined,
  BankOutlined,
  BuildOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FlagOutlined,
  FormOutlined,
  FundOutlined,
  FundProjectionScreenOutlined,
  GiftOutlined,
  PauseCircleOutlined,
  ReadOutlined,
  SolutionOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserSwitchOutlined
} from '@ant-design/icons-vue';

export interface MenuChild {
  path: string;
  title: string;
  icon: typeof DashboardOutlined;
}

export interface MenuGroup {
  key: string;
  title: string;
  children: Array<
    MenuChild | {
      key: string;
      title: string;
      icon: typeof DashboardOutlined;
      children: MenuChild[];
    }
  >;
}

export function isMenuSubGroup(
  item: MenuGroup['children'][number]
): item is { key: string; title: string; icon: typeof DashboardOutlined; children: MenuChild[] } {
  return 'children' in item && Array.isArray((item as { children?: unknown }).children);
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
    key: 'reserve-pool',
    title: '储备库',
    children: [
      { path: '/reserve-pool/party-school', title: '党校集中谋划项目', icon: ReadOutlined },
      { path: '/reserve-pool/department', title: '部门谋划项目', icon: ClusterOutlined },
      { path: '/reserve-pool/township', title: '乡镇（街道）谋划项目', icon: TeamOutlined },
      { path: '/reserve-pool/arena', title: '比拼擂台赛项目', icon: TrophyOutlined },
      { path: '/reserve-pool/element', title: '要素争取项目', icon: FundOutlined },
      {
        key: 'reserve-pool-audit',
        title: '储备库审核',
        icon: AuditOutlined,
        children: [
          { path: '/reserve-pool/audit/first', title: '储备库初审', icon: SolutionOutlined },
          { path: '/reserve-pool/audit/final', title: '储备库终审', icon: CheckCircleOutlined }
        ]
      }
    ]
  },
  {
    key: 'supplement-library',
    title: '增补库',
    children: [
      { path: '/supplement-library', title: '项目增补', icon: FormOutlined },
      { path: '/supplement-library/audit/first', title: '增补初审', icon: SolutionOutlined },
      { path: '/supplement-library/audit/final', title: '增补终审', icon: CheckCircleOutlined }
    ]
  },
  {
    key: 'project-management',
    title: '项目管理',
    children: [
      { path: '/project-management/overview', title: '项目概览', icon: DashboardOutlined },
      { path: '/project-management/planning-pool', title: '谋划库', icon: BulbOutlined },
      { path: '/project-management/supplement-pool', title: '增补库（在库）', icon: DatabaseOutlined },
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
  },
  {
    key: 'work-suspend',
    title: '项目停复工情况',
    children: [
      { path: '/work-suspend', title: '项目停复工情况', icon: PauseCircleOutlined }
    ]
  },
  {
    key: 'assessment-score',
    title: '考核评分',
    children: [
      { path: '/assessment-score/red-yellow-flag', title: '红黄旗评分', icon: FlagOutlined },
      { path: '/assessment-score/annual', title: '年度考核', icon: TrophyOutlined }
    ]
  },
  {
    key: 'alert-management',
    title: '预警管理',
    children: [
      { path: '/alert-management', title: '预警管理', icon: AlertOutlined }
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
    path: '/reserve-pool/party-school',
    name: 'ReservePartySchool',
    component: () => import('@/views/reserve-pool/party-school/index.vue'),
    meta: { title: '党校集中谋划项目', icon: ReadOutlined, group: 'reserve-pool' }
  },
  {
    path: '/reserve-pool/department',
    name: 'ReserveDepartment',
    component: () => import('@/views/reserve-pool/department/index.vue'),
    meta: { title: '部门谋划项目', icon: ClusterOutlined, group: 'reserve-pool' }
  },
  {
    path: '/reserve-pool/township',
    name: 'ReserveTownship',
    component: () => import('@/views/reserve-pool/township/index.vue'),
    meta: { title: '乡镇（街道）谋划项目', icon: TeamOutlined, group: 'reserve-pool' }
  },
  {
    path: '/reserve-pool/arena',
    name: 'ReserveArena',
    component: () => import('@/views/reserve-pool/arena/index.vue'),
    meta: { title: '比拼擂台赛项目', icon: TrophyOutlined, group: 'reserve-pool' }
  },
  {
    path: '/reserve-pool/element',
    name: 'ReserveElement',
    component: () => import('@/views/reserve-pool/element/index.vue'),
    meta: { title: '要素争取项目', icon: FundOutlined, group: 'reserve-pool' }
  },
  {
    path: '/reserve-pool/audit',
    redirect: '/reserve-pool/audit/first'
  },
  {
    path: '/reserve-pool/audit/first',
    name: 'ReserveAuditFirst',
    component: () => import('@/views/reserve-pool/audit/first.vue'),
    meta: { title: '储备库初审', icon: SolutionOutlined, group: 'reserve-pool' }
  },
  {
    path: '/reserve-pool/audit/final',
    name: 'ReserveAuditFinal',
    component: () => import('@/views/reserve-pool/audit/final.vue'),
    meta: { title: '储备库终审', icon: CheckCircleOutlined, group: 'reserve-pool' }
  },
  {
    path: '/supplement-library',
    name: 'SupplementLibrary',
    component: () => import('@/views/supplement-library/index.vue'),
    meta: { title: '项目增补', icon: FormOutlined, group: 'supplement-library' }
  },
  {
    path: '/supplement-library/audit/first',
    name: 'SupplementLibraryAuditFirst',
    component: () => import('@/views/supplement-library/audit/first.vue'),
    meta: { title: '增补初审', icon: SolutionOutlined, group: 'supplement-library' }
  },
  {
    path: '/supplement-library/audit/final',
    name: 'SupplementLibraryAuditFinal',
    component: () => import('@/views/supplement-library/audit/final.vue'),
    meta: { title: '增补终审', icon: CheckCircleOutlined, group: 'supplement-library' }
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
  },
  {
    path: '/work-suspend',
    name: 'WorkSuspend',
    component: () => import('@/views/work-suspend/index.vue'),
    meta: { title: '项目停复工情况', icon: PauseCircleOutlined, group: 'work-suspend' }
  },
  {
    path: '/assessment-score/red-yellow-flag',
    name: 'AssessmentRedYellowFlag',
    component: () => import('@/views/assessment-score/red-yellow-flag/index.vue'),
    meta: {
      title: '红黄旗评分',
      icon: FlagOutlined,
      group: 'assessment-score'
    }
  },
  {
    path: '/assessment-score/annual',
    name: 'AssessmentAnnual',
    component: () => import('@/views/assessment-score/annual/index.vue'),
    meta: {
      title: '年度考核',
      icon: TrophyOutlined,
      group: 'assessment-score'
    }
  },
  {
    path: '/alert-management',
    name: 'AlertManagement',
    component: () => import('@/views/alert-management/index.vue'),
    meta: { title: '预警管理', icon: AlertOutlined, group: 'alert-management' }
  }
];
