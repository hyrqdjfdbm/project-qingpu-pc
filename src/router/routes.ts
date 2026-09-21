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
  MailOutlined,
  PauseCircleOutlined,
  ReadOutlined,
  RollbackOutlined,
  SolutionOutlined,
  TableOutlined,
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
    title: '增补库（兰溪）',
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
      {
        key: 'pm-implementation-library',
        title: '实施项目库',
        icon: BuildOutlined,
        children: [
          { path: '/project-management/overview', title: '项目概览', icon: DashboardOutlined },
          { path: '/project-management/implementation-pool', title: '实施库', icon: BuildOutlined },
          { path: '/project-management/audit-management', title: '审核管理', icon: AuditOutlined }
        ]
      },
      {
        key: 'pm-qingpu-supplement',
        title: '增补库',
        icon: DatabaseOutlined,
        children: [
          { path: '/project-management/qingpu-supplement', title: '项目增补列表', icon: FormOutlined },
          { path: '/project-management/qingpu-supplement/audit', title: '增补审核', icon: SolutionOutlined }
        ]
      },
      {
        key: 'pm-qingpu-withdraw-biz',
        title: '退库业务办理',
        icon: RollbackOutlined,
        children: [
          { path: '/project-management/qingpu-withdraw', title: '项目退库申请', icon: RollbackOutlined },
          { path: '/project-management/qingpu-withdraw/audit', title: '退库审核', icon: SolutionOutlined }
        ]
      },
      {
        key: 'pm-qingpu-withdraw-pool',
        title: '青浦退库项目库',
        icon: PauseCircleOutlined,
        children: [
          { path: '/project-management/qingpu-withdraw-pool', title: '退库项目列表', icon: DatabaseOutlined },
          { path: '/project-management/qingpu-withdraw-pool/audit', title: '恢复审核', icon: SolutionOutlined }
        ]
      },
      { path: '/project-management/planning-pool', title: '谋划库', icon: BulbOutlined },
      { path: '/project-management/supplement-pool', title: '增补库（在库）', icon: DatabaseOutlined },
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
    key: 'two-letters-one-order',
    title: '两函一单',
    children: [
      { path: '/two-letters-one-order/assign', title: '交办函', icon: MailOutlined },
      { path: '/two-letters-one-order/remind', title: '提醒函', icon: MailOutlined },
      { path: '/two-letters-one-order/supervise', title: '督办函', icon: MailOutlined }
    ]
  },
  {
    key: 'alert-management',
    title: '预警管理',
    children: [
      { path: '/alert-management', title: '预警管理', icon: AlertOutlined }
    ]
  },
  {
    key: 'data-management',
    title: '数据管理',
    children: [
      {
        path: '/data-management/unit-fixed-investment',
        title: '责任单位固投',
        icon: TableOutlined
      }
    ]
  },
  {
    key: 'workbench',
    title: '工作台',
    children: [
      { path: '/workbench', title: '工作台', icon: ReadOutlined }
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
    path: '/project-management/qingpu-withdraw-pool/audit',
    name: 'QingpuWithdrawPoolAudit',
    component: () => import('@/views/project-management/qingpu-withdraw-pool/audit.vue'),
    meta: { title: '恢复审核', icon: SolutionOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/qingpu-withdraw-pool',
    name: 'QingpuWithdrawPool',
    component: () => import('@/views/project-management/qingpu-withdraw-pool/index.vue'),
    meta: { title: '青浦退库项目库', icon: PauseCircleOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/qingpu-withdraw/audit',
    name: 'QingpuWithdrawAudit',
    component: () => import('@/views/project-management/qingpu-withdraw/audit.vue'),
    meta: { title: '退库审核', icon: SolutionOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/qingpu-withdraw',
    name: 'QingpuWithdrawList',
    component: () => import('@/views/project-management/qingpu-withdraw/index.vue'),
    meta: { title: '项目退库申请', icon: RollbackOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/qingpu-supplement/audit',
    name: 'QingpuSupplementAudit',
    component: () => import('@/views/project-management/qingpu-supplement/audit.vue'),
    meta: { title: '增补审核', icon: SolutionOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/qingpu-supplement',
    name: 'QingpuSupplementList',
    component: () => import('@/views/project-management/qingpu-supplement/index.vue'),
    meta: { title: '项目增补列表', icon: FormOutlined, group: 'project-management' }
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
    path: '/project-management/implementation-pool/:id',
    name: 'ImplementationPoolDetail',
    component: () => import('@/views/project-management/implementation-pool/detail.vue'),
    meta: { title: '实施库项目详情', icon: BuildOutlined, group: 'project-management' }
  },
  {
    path: '/project-management/audit-management',
    name: 'ProjectAuditManagement',
    component: () => import('@/views/project-management/audit-management/index.vue'),
    meta: { title: '审核管理', icon: AuditOutlined, group: 'project-management' }
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
    path: '/project-management/progress-fund-report',
    redirect: '/project-management/audit-management'
  },
  {
    path: '/project-management/progress-fund-report/:id',
    redirect: (to) => `/project-management/implementation-pool/${to.params.id}`
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
    path: '/two-letters-one-order/assign',
    name: 'TwoLettersAssign',
    component: () => import('@/views/two-letters-one-order/assign/index.vue'),
    meta: { title: '交办函', icon: MailOutlined, group: 'two-letters-one-order' }
  },
  {
    path: '/two-letters-one-order/remind',
    name: 'TwoLettersRemind',
    component: () => import('@/views/two-letters-one-order/remind/index.vue'),
    meta: { title: '提醒函', icon: MailOutlined, group: 'two-letters-one-order' }
  },
  {
    path: '/two-letters-one-order/supervise',
    name: 'TwoLettersSupervise',
    component: () => import('@/views/two-letters-one-order/supervise/index.vue'),
    meta: { title: '督办函', icon: MailOutlined, group: 'two-letters-one-order' }
  },
  {
    path: '/alert-management',
    name: 'AlertManagement',
    component: () => import('@/views/alert-management/index.vue'),
    meta: { title: '预警管理', icon: AlertOutlined, group: 'alert-management' }
  },
  {
    path: '/data-management/unit-fixed-investment',
    name: 'UnitFixedInvestment',
    component: () => import('@/views/data-management/unit-fixed-investment/index.vue'),
    meta: { title: '责任单位固投', icon: TableOutlined, group: 'data-management' }
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('@/views/workbench/index.vue'),
    meta: { title: '工作台', icon: ReadOutlined, group: 'workbench' }
  }
];
