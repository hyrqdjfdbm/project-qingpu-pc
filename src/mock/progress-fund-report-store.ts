import { getCurrentUser } from '@/mock/current-user';
import type { SupplementProjectItem } from '@/types/supplement-pool';
import type {
  AuditKind,
  AuditPayload,
  ImageMonthlyFund,
  ImageMonthlyPayload,
  ImageWeeklyPayload,
  ImageYearPayload,
  ImageYearTarget,
  PendingAuditItem,
  PendingAuditScope,
  ProgressFundProject,
  ProgressFundQuery,
  SuperiorPolicyKey,
  SuperiorWeeklyPayload,
  SuperiorYearPayload,
  SuperiorYearTarget
} from '@/types/progress-fund-report';
import {
  AUDIT_KIND_LABEL,
  emptySuperiorMonths,
  getWeekInfo,
  SUPERIOR_POLICY_KEYS,
  SUPERIOR_POLICY_LABEL
} from '@/types/progress-fund-report';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateTime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function offsetTime(days: number, hours = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return formatDateTime(d);
}

function nowText() {
  return formatDateTime(new Date());
}

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const thisWeek = getWeekInfo();
const lastWeek = getWeekInfo(new Date(Date.now() - 7 * 86400000));

let monthlySeq = 40;
let weeklySeq = 40;
let superiorWeekSeq = 40;

function months(fund: number[], image: string[]): ImageYearTarget['monthlyTargets'] {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    fundTarget: fund[i],
    imageProgressTarget: image[i]
  }));
}

function superiorMonths(values: number[]): SuperiorYearTarget['monthlyTargets'] {
  return values.map((target, i) => ({ month: i + 1, target: target || undefined }));
}

function emptySuperior(): ProgressFundProject['superior'] {
  return {
    twoHeavy: { weeklyReports: [] },
    twoNew: { weeklyReports: [] },
    specialBond: { weeklyReports: [] }
  };
}

const imagePlan = [
  '完成基坑支护与土方开挖',
  '地下室底板浇筑完成',
  '地下室结构完成 50%',
  '地下室结构封顶',
  '主体结构开始爬升',
  '主体结构完成至 8 层',
  '主体结构完成至 15 层',
  '主体结构完成至 22 层',
  '主体结构封顶',
  '幕墙及机电安装推进',
  '精装修及室外配套启动',
  '年度节点验收准备'
];

const projects: ProgressFundProject[] = [
  {
    id: 'pf1',
    projectName: '青浦新城中央商务区综合提升工程',
    projectCode: 'QP2026-XX-001',
    responsibleUnit: '区建设管理委员会',
    constructionUnit: '青浦新城建设发展有限公司',
    totalInvestment: 12.6,
    currentStage: '主体施工',
    imageYearTarget: {
      year,
      fundTarget: 28000,
      imageProgressTarget: '主体结构封顶，地下车库完成装修，市政配套完成 80%',
      monthlyTargets: months(
        [1800, 2000, 2200, 2400, 2500, 2600, 2700, 2500, 2300, 2200, 2000, 1800],
        imagePlan
      ),
      status: 'approved',
      submittedBy: '周佳宁',
      submittedAt: offsetTime(-88),
      auditor: '赵文博',
      auditedAt: offsetTime(-80),
      auditComment: '目标分解合理，同意按此执行。'
    },
    imageMonthlyFunds: [
      {
        id: 'imf1',
        year,
        month: Math.max(1, month - 1),
        completedAmount: 2450,
        cumulativeAmount: 8650,
        remark: '安装工程进度款拨付',
        status: 'approved',
        submittedBy: '刘洋',
        submittedAt: offsetTime(-28),
        auditor: '吴芳',
        auditedAt: offsetTime(-24)
      },
      {
        id: 'imf2',
        year,
        month,
        completedAmount: 1800,
        cumulativeAmount: 10450,
        remark: '本月完成主体施工节点结算',
        status: 'pending',
        submittedBy: '陈静',
        submittedAt: offsetTime(-2)
      }
    ],
    imageWeeklyReports: [
      {
        id: 'iw1',
        year: lastWeek.year,
        week: lastWeek.week,
        weekStart: lastWeek.weekStart,
        weekEnd: lastWeek.weekEnd,
        content: '完成东侧裙房结构浇筑，塔吊拆除方案已审批',
        progressPercent: 62,
        status: 'approved',
        submittedBy: '何志强',
        submittedAt: offsetTime(-8),
        auditor: '赵文博',
        auditedAt: offsetTime(-6)
      },
      {
        id: 'iw2',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '核心筒爬升至 18 层，地下室机电管线敷设完成约 40%',
        progressPercent: 65,
        status: 'pending',
        submittedBy: '何志强',
        submittedAt: offsetTime(-1)
      }
    ],
    superior: {
      specialBond: {
        yearTarget: {
          year,
          annualTarget: 12310,
          monthlyTargets: superiorMonths([1230, 980, 1100, 1050, 1200, 980, 1020, 1150, 900, 860, 840, 1000]),
          status: 'approved',
          submittedBy: '周佳宁',
          submittedAt: offsetTime(-86),
          auditor: '吴芳',
          auditedAt: offsetTime(-79)
        },
        weeklyReports: [
          {
            id: 'sw1',
            year: thisWeek.year,
            week: thisWeek.week,
            weekStart: thisWeek.weekStart,
            weekEnd: thisWeek.weekEnd,
            completedAmount: 268,
            cumulativeAmount: 4120,
            remark: '专项债资金本周到账并完成计量支付',
            status: 'pending',
            submittedBy: '刘洋',
            submittedAt: offsetTime(-1, -3)
          }
        ]
      },
      twoHeavy: {
        yearTarget: {
          year,
          annualTarget: 8600,
          monthlyTargets: superiorMonths([800, 720, 680, 700, 760, 740, 710, 690, 650, 640, 620, 890]),
          status: 'pending',
          submittedBy: '周佳宁',
          submittedAt: offsetTime(-5)
        },
        weeklyReports: []
      },
      twoNew: { weeklyReports: [] }
    },
    updatedAt: offsetTime(-1)
  },
  {
    id: 'pf2',
    projectName: '淀山湖大道环境品质提升项目',
    projectCode: 'QP2026-XX-002',
    responsibleUnit: '区绿化市容局',
    constructionUnit: '青浦市政工程有限公司',
    totalInvestment: 3.8,
    currentStage: '路面改造',
    imageYearTarget: {
      year,
      fundTarget: 8600,
      imageProgressTarget: '全线路面改造完工，绿化迁移及补种完成，沿线照明全覆盖',
      monthlyTargets: months(
        [600, 700, 750, 800, 850, 800, 750, 700, 650, 600, 550, 500],
        [
          '西段路基处理',
          '西段基层摊铺',
          '西段面层完成',
          '中段路基处理',
          '中段面层推进',
          '东段路基处理',
          '东段面层推进',
          '全线人行道铺装',
          '绿化迁移补种',
          '照明设施安装',
          '交通标线施划',
          '竣工验收准备'
        ]
      ),
      status: 'pending',
      submittedBy: '吴芳',
      submittedAt: offsetTime(-4)
    },
    imageMonthlyFunds: [],
    imageWeeklyReports: [
      {
        id: 'iw3',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '西段非机动车道铺装完成，东段人行道铺装推进中',
        progressPercent: 48,
        status: 'rejected',
        submittedBy: '林雨桐',
        submittedAt: offsetTime(-3),
        auditor: '赵文博',
        auditedAt: offsetTime(-2),
        auditComment: '请补充完成比例对应的现场照片说明。'
      }
    ],
    superior: {
      specialBond: {
        yearTarget: {
          year,
          annualTarget: 4200,
          monthlyTargets: superiorMonths([350, 360, 370, 380, 390, 360, 350, 340, 330, 320, 310, 340]),
          status: 'approved',
          submittedBy: '孙丽娜',
          submittedAt: offsetTime(-70),
          auditor: '吴芳',
          auditedAt: offsetTime(-65)
        },
        weeklyReports: [
          {
            id: 'sw2',
            year: thisWeek.year,
            week: thisWeek.week,
            weekStart: thisWeek.weekStart,
            weekEnd: thisWeek.weekEnd,
            completedAmount: 86,
            cumulativeAmount: 1280,
            status: 'approved',
            submittedBy: '孙丽娜',
            submittedAt: offsetTime(-2),
            auditor: '赵文博',
            auditedAt: offsetTime(-1)
          }
        ]
      },
      twoHeavy: { weeklyReports: [] },
      twoNew: { weeklyReports: [] }
    },
    updatedAt: offsetTime(-1)
  },
  {
    id: 'pf3',
    projectName: '徐泾北社区公共服务设施补短板项目',
    projectCode: 'QP2026-XX-003',
    responsibleUnit: '徐泾镇人民政府',
    constructionUnit: '徐泾城镇建设投资有限公司',
    totalInvestment: 2.1,
    currentStage: '主体施工',
    imageYearTarget: {
      year,
      fundTarget: 5200,
      imageProgressTarget: '综合服务中心主体完工，室外配套及景观基本完成',
      monthlyTargets: months(Array(12).fill(430), imagePlan.map((_, i) => `${i + 1}月形象进度节点按计划推进`)),
      status: 'approved',
      submittedBy: '马文博',
      submittedAt: offsetTime(-60),
      auditor: '赵文博',
      auditedAt: offsetTime(-55)
    },
    imageMonthlyFunds: [
      {
        id: 'imf3',
        year,
        month,
        completedAmount: 410,
        cumulativeAmount: 1680,
        status: 'rejected',
        submittedBy: '徐天宇',
        submittedAt: offsetTime(-3),
        auditor: '吴芳',
        auditedAt: offsetTime(-1),
        auditComment: '累计完成与上月台账不一致，请核对后重报。'
      }
    ],
    imageWeeklyReports: [
      {
        id: 'iw4',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '主体三层梁板浇筑完成，外围降噪围挡加高验收通过',
        progressPercent: 55,
        status: 'approved',
        submittedBy: '徐天宇',
        submittedAt: offsetTime(-2),
        auditor: '赵文博',
        auditedAt: offsetTime(-1)
      }
    ],
    superior: emptySuperior(),
    updatedAt: offsetTime(-1)
  },
  {
    id: 'pf4',
    projectName: '赵巷镇安置房配套市政工程',
    projectCode: 'QP2026-XX-004',
    responsibleUnit: '赵巷镇人民政府',
    constructionUnit: '青浦城投建设有限公司',
    totalInvestment: 4.5,
    currentStage: '管网施工',
    imageMonthlyFunds: [],
    imageWeeklyReports: [],
    superior: {
      specialBond: {
        yearTarget: {
          year,
          annualTarget: 6800,
          monthlyTargets: emptySuperiorMonths(),
          status: 'rejected',
          submittedBy: '郭晓彤',
          submittedAt: offsetTime(-6),
          auditor: '吴芳',
          auditedAt: offsetTime(-3),
          auditComment: '年度目标与专项债发行计划不一致，请按最新批次调整。'
        },
        weeklyReports: []
      },
      twoHeavy: { weeklyReports: [] },
      twoNew: { weeklyReports: [] }
    },
    updatedAt: offsetTime(-3)
  },
  {
    id: 'pf5',
    projectName: '朱家角古镇风貌保护修缮工程',
    projectCode: 'QP2026-XX-005',
    responsibleUnit: '朱家角镇人民政府',
    constructionUnit: '朱家角文旅发展有限公司',
    totalInvestment: 1.9,
    currentStage: '修缮施工',
    imageYearTarget: {
      year,
      fundTarget: 3100,
      imageProgressTarget: '沿河立面修缮完成，基础设施管线入地',
      monthlyTargets: months(Array(12).fill(250), imagePlan),
      status: 'approved',
      submittedBy: '罗雅婷',
      submittedAt: offsetTime(-50),
      auditor: '赵文博',
      auditedAt: offsetTime(-46)
    },
    imageMonthlyFunds: [
      {
        id: 'imf4',
        year,
        month,
        completedAmount: 260,
        cumulativeAmount: 980,
        status: 'pending',
        submittedBy: '高晨阳',
        submittedAt: offsetTime(-1, -5)
      }
    ],
    imageWeeklyReports: [],
    superior: {
      specialBond: { weeklyReports: [] },
      twoHeavy: { weeklyReports: [] },
      twoNew: {
        yearTarget: {
          year,
          annualTarget: 1500,
          monthlyTargets: emptySuperiorMonths(),
          status: 'approved',
          submittedBy: '罗雅婷',
          submittedAt: offsetTime(-48),
          auditor: '吴芳',
          auditedAt: offsetTime(-44)
        },
        weeklyReports: [
          {
            id: 'sw3',
            year: thisWeek.year,
            week: thisWeek.week,
            weekStart: thisWeek.weekStart,
            weekEnd: thisWeek.weekEnd,
            completedAmount: 42,
            cumulativeAmount: 360,
            status: 'pending',
            submittedBy: '高晨阳',
            submittedAt: offsetTime(-1, -2)
          }
        ]
      }
    },
    updatedAt: offsetTime(-1, -2)
  },
  {
    id: 'pf6',
    projectName: '夏阳街道社区卫生服务中心改扩建',
    projectCode: 'QP2026-XX-006',
    responsibleUnit: '区卫生健康委员会',
    constructionUnit: '青浦卫生基建管理中心',
    totalInvestment: 2.8,
    currentStage: '装饰装修',
    imageMonthlyFunds: [],
    imageWeeklyReports: [],
    superior: emptySuperior(),
    updatedAt: offsetTime(-20)
  },
  {
    id: 'pf7',
    projectName: '重固镇污水管网完善工程',
    projectCode: 'QP2026-XX-007',
    responsibleUnit: '重固镇人民政府',
    constructionUnit: '青浦水务建设有限公司',
    totalInvestment: 1.6,
    currentStage: '管道敷设',
    imageYearTarget: {
      year,
      fundTarget: 2400,
      imageProgressTarget: '主干管贯通，支管接入率达到 90%',
      monthlyTargets: months(Array(12).fill(200), imagePlan),
      status: 'approved',
      submittedBy: '胡文涛',
      submittedAt: offsetTime(-40),
      auditor: '赵文博',
      auditedAt: offsetTime(-36)
    },
    imageMonthlyFunds: [
      {
        id: 'imf5',
        year,
        month,
        completedAmount: 210,
        cumulativeAmount: 760,
        status: 'approved',
        submittedBy: '朱敏慧',
        submittedAt: offsetTime(-10),
        auditor: '吴芳',
        auditedAt: offsetTime(-7)
      }
    ],
    imageWeeklyReports: [
      {
        id: 'iw5',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '赵重公路段管道敷设完成 320 米，检查井砌筑 8 座',
        progressPercent: 41,
        status: 'pending',
        submittedBy: '朱敏慧',
        submittedAt: offsetTime(-1, -6)
      }
    ],
    superior: {
      specialBond: {
        yearTarget: {
          year,
          annualTarget: 1800,
          monthlyTargets: emptySuperiorMonths(),
          status: 'pending',
          submittedBy: '胡文涛',
          submittedAt: offsetTime(-4)
        },
        weeklyReports: []
      },
      twoHeavy: { weeklyReports: [] },
      twoNew: { weeklyReports: [] }
    },
    updatedAt: offsetTime(-1, -6)
  },
  {
    id: 'pf8',
    projectName: '华新镇产业社区配套道路工程',
    projectCode: 'QP2026-XX-008',
    responsibleUnit: '华新镇人民政府',
    constructionUnit: '华新城镇建设发展有限公司',
    totalInvestment: 3.2,
    currentStage: '路基施工',
    imageMonthlyFunds: [],
    imageWeeklyReports: [],
    superior: emptySuperior(),
    updatedAt: offsetTime(-18)
  },
  {
    id: 'pf9',
    projectName: '白鹤镇农田水利设施提升项目',
    projectCode: 'QP2026-XX-009',
    responsibleUnit: '区农业农村委员会',
    constructionUnit: '青浦水利工程有限公司',
    totalInvestment: 1.1,
    currentStage: '沟渠整治',
    imageYearTarget: {
      year,
      fundTarget: 1600,
      imageProgressTarget: '灌排沟渠整治完工，泵站更新投用',
      monthlyTargets: months(Array(12).fill(130), imagePlan),
      status: 'rejected',
      submittedBy: '王建国',
      submittedAt: offsetTime(-7),
      auditor: '赵文博',
      auditedAt: offsetTime(-4),
      auditComment: '年度形象目标未与农水专项计划对齐，请修订后重报。'
    },
    imageMonthlyFunds: [],
    imageWeeklyReports: [],
    superior: emptySuperior(),
    updatedAt: offsetTime(-4)
  },
  {
    id: 'pf10',
    projectName: '盈浦街道老旧小区综合改造',
    projectCode: 'QP2026-XX-010',
    responsibleUnit: '盈浦街道办事处',
    constructionUnit: '青浦房屋修缮工程有限公司',
    totalInvestment: 2.4,
    currentStage: '外立面施工',
    imageYearTarget: {
      year,
      fundTarget: 3800,
      imageProgressTarget: '外立面及楼道改造完成，加装电梯开工过半',
      monthlyTargets: months(Array(12).fill(310), imagePlan),
      status: 'approved',
      submittedBy: '李俊杰',
      submittedAt: offsetTime(-42),
      auditor: '吴芳',
      auditedAt: offsetTime(-38)
    },
    imageMonthlyFunds: [
      {
        id: 'imf6',
        year,
        month,
        completedAmount: 305,
        cumulativeAmount: 1210,
        status: 'pending',
        submittedBy: '周敏',
        submittedAt: offsetTime(-1, -8)
      }
    ],
    imageWeeklyReports: [
      {
        id: 'iw6',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '3 号楼外立面涂料完成，5 号楼脚手架搭设完毕',
        progressPercent: 37,
        status: 'approved',
        submittedBy: '周敏',
        submittedAt: offsetTime(-5),
        auditor: '赵文博',
        auditedAt: offsetTime(-3)
      }
    ],
    superior: emptySuperior(),
    updatedAt: offsetTime(-1, -8)
  },
  {
    id: 'pf11',
    projectName: '香花桥街道邻里中心新建工程',
    projectCode: 'QP2026-XX-011',
    responsibleUnit: '香花桥街道办事处',
    constructionUnit: '青浦公建配套建设有限公司',
    totalInvestment: 3.6,
    currentStage: '桩基施工',
    imageMonthlyFunds: [],
    imageWeeklyReports: [],
    superior: {
      specialBond: { weeklyReports: [] },
      twoHeavy: {
        yearTarget: {
          year,
          annualTarget: 2200,
          monthlyTargets: emptySuperiorMonths(),
          status: 'pending',
          submittedBy: '陈静',
          submittedAt: offsetTime(-2)
        },
        weeklyReports: []
      },
      twoNew: { weeklyReports: [] }
    },
    updatedAt: offsetTime(-2)
  },
  {
    id: 'pf12',
    projectName: '金泽镇乡村振兴示范村基础设施工程',
    projectCode: 'QP2026-XX-012',
    responsibleUnit: '金泽镇人民政府',
    constructionUnit: '金泽城镇建设投资有限公司',
    totalInvestment: 1.4,
    currentStage: '道路硬化',
    imageYearTarget: {
      year,
      fundTarget: 1900,
      imageProgressTarget: '村内道路硬化完成，污水管网接通',
      monthlyTargets: months(Array(12).fill(155), imagePlan),
      status: 'approved',
      submittedBy: '赵磊',
      submittedAt: offsetTime(-33),
      auditor: '赵文博',
      auditedAt: offsetTime(-30)
    },
    imageMonthlyFunds: [],
    imageWeeklyReports: [
      {
        id: 'iw7',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '示范村东环路基层摊铺完成，雨水口安装 12 处',
        progressPercent: 29,
        status: 'pending',
        submittedBy: '赵磊',
        submittedAt: offsetTime(-1, -4)
      }
    ],
    superior: {
      specialBond: {
        yearTarget: {
          year,
          annualTarget: 960,
          monthlyTargets: emptySuperiorMonths(),
          status: 'approved',
          submittedBy: '赵磊',
          submittedAt: offsetTime(-32),
          auditor: '吴芳',
          auditedAt: offsetTime(-29)
        },
        weeklyReports: [
          {
            id: 'sw4',
            year: thisWeek.year,
            week: thisWeek.week,
            weekStart: thisWeek.weekStart,
            weekEnd: thisWeek.weekEnd,
            completedAmount: 28,
            cumulativeAmount: 210,
            status: 'rejected',
            submittedBy: '赵磊',
            submittedAt: offsetTime(-3),
            auditor: '吴芳',
            auditedAt: offsetTime(-1),
            auditComment: '本周完成额与支付凭证金额不符。'
          }
        ]
      },
      twoHeavy: { weeklyReports: [] },
      twoNew: { weeklyReports: [] }
    },
    updatedAt: offsetTime(-1, -4)
  }
];

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function touch(item: ProgressFundProject) {
  item.updatedAt = nowText();
}

function operatorName() {
  return getCurrentUser().name;
}

function periodLabel(kind: AuditKind, extra: { year?: number; month?: number; week?: number }) {
  const y = extra.year ?? year;
  if (kind === 'imageYear' || kind === 'superiorYear') return `${y}年`;
  if (kind === 'imageMonthly') return `${y}年${extra.month}月`;
  return `${y}年第${extra.week}周`;
}

function pushPending(
  items: PendingAuditItem[],
  project: ProgressFundProject,
  kind: AuditKind,
  extra: {
    year?: number;
    month?: number;
    week?: number;
    policy?: SuperiorPolicyKey;
    summary: string;
    submittedBy?: string;
    submittedAt?: string;
  }
) {
  items.push({
    id: `${project.id}-${kind}-${extra.policy ?? ''}-${extra.year ?? ''}-${extra.month ?? ''}-${extra.week ?? ''}`,
    projectId: project.id,
    projectName: project.projectName,
    projectCode: project.projectCode,
    responsibleUnit: project.responsibleUnit,
    kind,
    kindLabel: AUDIT_KIND_LABEL[kind],
    policy: extra.policy,
    policyLabel: extra.policy ? SUPERIOR_POLICY_LABEL[extra.policy] : undefined,
    year: extra.year,
    month: extra.month,
    week: extra.week,
    periodLabel: periodLabel(kind, extra),
    summary: extra.summary,
    submittedBy: extra.submittedBy,
    submittedAt: extra.submittedAt
  });
}

function isToday(text?: string) {
  if (!text) return false;
  const now = new Date();
  const prefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return text.startsWith(prefix);
}

function collectPending(scope?: PendingAuditScope) {
  const items: PendingAuditItem[] = [];
  for (const project of projects) {
    if (scope !== 'superior') {
      const yearTarget = project.imageYearTarget;
      if (yearTarget?.status === 'pending') {
        pushPending(items, project, 'imageYear', {
          year: yearTarget.year,
          summary: `资金目标 ${yearTarget.fundTarget.toLocaleString()} 万元`,
          submittedBy: yearTarget.submittedBy,
          submittedAt: yearTarget.submittedAt
        });
      }
      for (const row of project.imageMonthlyFunds) {
        if (row.status !== 'pending') continue;
        pushPending(items, project, 'imageMonthly', {
          year: row.year,
          month: row.month,
          summary: `本月完成 ${row.completedAmount.toLocaleString()} 万元`,
          submittedBy: row.submittedBy,
          submittedAt: row.submittedAt
        });
      }
      for (const row of project.imageWeeklyReports) {
        if (row.status !== 'pending') continue;
        pushPending(items, project, 'imageWeekly', {
          year: row.year,
          week: row.week,
          summary: row.content,
          submittedBy: row.submittedBy,
          submittedAt: row.submittedAt
        });
      }
    }
    if (scope !== 'image') {
      SUPERIOR_POLICY_KEYS.forEach((policy) => {
        const pack = project.superior[policy];
        if (pack.yearTarget?.status === 'pending') {
          pushPending(items, project, 'superiorYear', {
            year: pack.yearTarget.year,
            policy,
            summary: `年度目标 ${pack.yearTarget.annualTarget.toLocaleString()} 万元`,
            submittedBy: pack.yearTarget.submittedBy,
            submittedAt: pack.yearTarget.submittedAt
          });
        }
        for (const row of pack.weeklyReports) {
          if (row.status !== 'pending') continue;
          pushPending(items, project, 'superiorWeekly', {
            year: row.year,
            week: row.week,
            policy,
            summary: `本周完成 ${row.completedAmount.toLocaleString()} 万元`,
            submittedBy: row.submittedBy,
            submittedAt: row.submittedAt
          });
        }
      });
    }
  }
  return items.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
}

export const progressFundReportStore = {
  list(params?: ProgressFundQuery) {
    const keyword = params?.keyword?.trim();
    return clone(
      projects.filter((p) => {
        if (!keyword) return true;
        return (
          p.projectName.includes(keyword) ||
          p.projectCode.includes(keyword) ||
          p.responsibleUnit.includes(keyword)
        );
      })
    );
  },

  getById(id: string) {
    const item = projects.find((p) => p.id === id);
    return item ? clone(item) : null;
  },

  listOptions() {
    return projects.map((p) => ({ value: p.id, label: `${p.projectName}（${p.projectCode}）` }));
  },

  submitImageYear(payload: ImageYearPayload) {
    const item = projects.find((p) => p.id === payload.projectId);
    if (!item) return null;
    item.imageYearTarget = {
      year: payload.year,
      fundTarget: payload.fundTarget,
      imageProgressTarget: payload.imageProgressTarget,
      monthlyTargets: payload.monthlyTargets,
      status: 'pending',
      submittedBy: operatorName(),
      submittedAt: nowText()
    };
    touch(item);
    return clone(item);
  },

  submitImageMonthly(payload: ImageMonthlyPayload) {
    const item = projects.find((p) => p.id === payload.projectId);
    if (!item) return null;
    const exist = item.imageMonthlyFunds.find((r) => r.year === payload.year && r.month === payload.month);
    const row: ImageMonthlyFund = {
      id: exist?.id ?? `imf-${++monthlySeq}`,
      year: payload.year,
      month: payload.month,
      completedAmount: payload.completedAmount,
      cumulativeAmount: payload.cumulativeAmount,
      remark: payload.remark,
      status: 'pending',
      submittedBy: operatorName(),
      submittedAt: nowText()
    };
    if (exist) Object.assign(exist, row);
    else item.imageMonthlyFunds.push(row);
    touch(item);
    return clone(item);
  },

  submitImageWeekly(payload: ImageWeeklyPayload) {
    const item = projects.find((p) => p.id === payload.projectId);
    if (!item) return null;
    const exist = item.imageWeeklyReports.find((r) => r.year === payload.year && r.week === payload.week);
    const row: ProgressFundProject['imageWeeklyReports'][number] = {
      id: exist?.id ?? `iw-${++weeklySeq}`,
      year: payload.year,
      week: payload.week,
      weekStart: payload.weekStart,
      weekEnd: payload.weekEnd,
      content: payload.content,
      progressPercent: payload.progressPercent,
      status: 'pending',
      submittedBy: operatorName(),
      submittedAt: nowText()
    };
    if (exist) Object.assign(exist, row);
    else item.imageWeeklyReports.push(row);
    touch(item);
    return clone(item);
  },

  submitSuperiorYear(payload: SuperiorYearPayload) {
    const item = projects.find((p) => p.id === payload.projectId);
    if (!item) return null;
    item.superior[payload.policy].yearTarget = {
      year: payload.year,
      annualTarget: payload.annualTarget,
      monthlyTargets: payload.monthlyTargets,
      status: 'pending',
      submittedBy: operatorName(),
      submittedAt: nowText()
    };
    touch(item);
    return clone(item);
  },

  submitSuperiorWeekly(payload: SuperiorWeeklyPayload) {
    const item = projects.find((p) => p.id === payload.projectId);
    if (!item) return null;
    const pack = item.superior[payload.policy];
    const exist = pack.weeklyReports.find((r) => r.year === payload.year && r.week === payload.week);
    const row = {
      id: exist?.id ?? `sw-${++superiorWeekSeq}`,
      year: payload.year,
      week: payload.week,
      weekStart: payload.weekStart,
      weekEnd: payload.weekEnd,
      completedAmount: payload.completedAmount,
      cumulativeAmount: payload.cumulativeAmount,
      remark: payload.remark,
      status: 'pending' as const,
      submittedBy: operatorName(),
      submittedAt: nowText()
    };
    if (exist) Object.assign(exist, row);
    else pack.weeklyReports.push(row);
    touch(item);
    return clone(item);
  },

  audit(payload: AuditPayload) {
    const item = projects.find((p) => p.id === payload.projectId);
    if (!item) return null;
    const status = payload.passed ? 'approved' : 'rejected';
    const patch = {
      status,
      auditor: operatorName(),
      auditedAt: nowText(),
      auditComment: payload.comment
    };
    if (payload.kind === 'imageYear' && item.imageYearTarget) {
      Object.assign(item.imageYearTarget, patch);
    } else if (payload.kind === 'imageMonthly') {
      const row = item.imageMonthlyFunds.find((r) => r.year === payload.year && r.month === payload.month);
      if (row) Object.assign(row, patch);
    } else if (payload.kind === 'imageWeekly') {
      const row = item.imageWeeklyReports.find((r) => r.year === payload.year && r.week === payload.week);
      if (row) Object.assign(row, patch);
    } else if (payload.kind === 'superiorYear' && payload.policy) {
      const target = item.superior[payload.policy].yearTarget;
      if (target) Object.assign(target, patch);
    } else if (payload.kind === 'superiorWeekly' && payload.policy) {
      const row = item.superior[payload.policy].weeklyReports.find(
        (r) => r.year === payload.year && r.week === payload.week
      );
      if (row) Object.assign(row, patch);
    }
    touch(item);
    return clone(item);
  },

  ensureFromPool(pool: SupplementProjectItem) {
    const exist = projects.find((p) => p.id === pool.id || p.projectCode === pool.projectCode);
    if (exist) return clone(exist);
    const item: ProgressFundProject = {
      id: pool.id,
      projectName: pool.projectName,
      projectCode: pool.projectCode,
      responsibleUnit: pool.responsibleUnits.join('、'),
      constructionUnit: pool.unitName,
      totalInvestment: pool.totalInvestment ?? 0,
      currentStage: pool.constructionProgress || '实施中',
      imageMonthlyFunds: [],
      imageWeeklyReports: [],
      superior: emptySuperior(),
      updatedAt: nowText()
    };
    projects.push(item);
    return clone(item);
  },

  listPending(scope?: PendingAuditScope) {
    return clone(collectPending(scope));
  },

  auditStats(scope?: PendingAuditScope) {
    const pending = collectPending(scope);
    const pendingProjects = new Set(pending.map((item) => item.projectId)).size;
    let todayAudited = 0;
    for (const project of projects) {
      const metas = [
        project.imageYearTarget,
        ...project.imageMonthlyFunds,
        ...project.imageWeeklyReports,
        ...SUPERIOR_POLICY_KEYS.flatMap((policy) => [
          project.superior[policy].yearTarget,
          ...project.superior[policy].weeklyReports
        ])
      ];
      for (const meta of metas) {
        if (!meta) continue;
        if ((meta.status === 'approved' || meta.status === 'rejected') && isToday(meta.auditedAt)) {
          todayAudited += 1;
        }
      }
    }
    return {
      pendingProjects,
      pendingRecords: pending.length,
      todayAudited
    };
  }
};
