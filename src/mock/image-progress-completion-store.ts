import type {
  ImageProgressProject,
  ImageProgressQuery,
  MonthlyFundPayload,
  MonthlyImagePayload,
  MonthlyProgressTarget,
  WeeklyImagePayload,
  YearTargetPayload
} from '@/types/image-progress-completion';
import { createEmptyMonthlyTargets, getWeekInfo } from '@/types/image-progress-completion';

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

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const thisWeek = getWeekInfo();
const lastWeek = getWeekInfo(new Date(Date.now() - 7 * 86400000));

let fundSeq = 20;
let imageMonthSeq = 20;
let weekSeq = 20;

function defaultMonthlyTargets(): MonthlyProgressTarget[] {
  const base = createEmptyMonthlyTargets();
  const fundPlan = [1800, 2000, 2200, 2400, 2500, 2600, 2700, 2500, 2300, 2200, 2000, 1800];
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
  return base.map((item, i) => ({
    month: item.month,
    fundTarget: fundPlan[i],
    imageProgressTarget: imagePlan[i]
  }));
}

const projects: ImageProgressProject[] = [
  {
    id: 'ip1',
    projectName: '青浦新城中央商务区综合提升工程',
    projectCode: 'QP2026-XX-001',
    responsibleUnit: '区建设管理委员会',
    constructionUnit: '青浦新城建设发展有限公司',
    totalInvestment: 12.6,
    currentStage: '主体施工',
    yearTarget: {
      year: currentYear,
      fundTarget: 28000,
      imageProgressTarget: '主体结构封顶，地下车库完成装修，市政配套完成 80%',
      monthlyTargets: defaultMonthlyTargets(),
      submittedAt: offsetTime(-90),
      submittedBy: '周佳宁'
    },
    monthlyFundReports: [
      {
        id: 'mf1',
        year: currentYear,
        month: Math.max(1, currentMonth - 2),
        completedAmount: 2100,
        cumulativeAmount: 6200,
        remark: '完成土建节点计量支付',
        reportedAt: offsetTime(-55),
        reportedBy: '刘洋'
      },
      {
        id: 'mf2',
        year: currentYear,
        month: Math.max(1, currentMonth - 1),
        completedAmount: 2450,
        cumulativeAmount: 8650,
        remark: '安装工程进度款拨付',
        reportedAt: offsetTime(-25),
        reportedBy: '刘洋'
      },
      {
        id: 'mf3',
        year: currentYear,
        month: currentMonth,
        completedAmount: 1800,
        cumulativeAmount: 10450,
        remark: '本月完成主体施工节点结算',
        reportedAt: offsetTime(-3),
        reportedBy: '陈静'
      }
    ],
    monthlyImageReports: [
      {
        id: 'mi1',
        year: currentYear,
        month: Math.max(1, currentMonth - 1),
        content: '主体结构爬升至计划层数，机电管线预埋按节点推进',
        progressPercent: 58,
        reportedAt: offsetTime(-20),
        reportedBy: '何志强'
      },
      {
        id: 'mi2',
        year: currentYear,
        month: currentMonth,
        content: '核心筒爬升至 18 层，地下室机电管线敷设完成约 40%',
        progressPercent: 65,
        reportedAt: offsetTime(-2),
        reportedBy: '何志强'
      }
    ],
    weeklyImageReports: [
      {
        id: 'wi1',
        year: lastWeek.year,
        week: lastWeek.week,
        weekStart: lastWeek.weekStart,
        weekEnd: lastWeek.weekEnd,
        content: '完成东侧裙房结构浇筑，塔吊拆除方案已审批',
        progressPercent: 62,
        reportedAt: offsetTime(-6),
        reportedBy: '何志强'
      },
      {
        id: 'wi2',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '核心筒爬升至 18 层，地下室机电管线敷设完成约 40%',
        progressPercent: 65,
        reportedAt: offsetTime(-1),
        reportedBy: '何志强'
      }
    ],
    updatedAt: offsetTime(-1)
  },
  {
    id: 'ip2',
    projectName: '淀山湖大道环境品质提升项目',
    projectCode: 'QP2026-XX-002',
    responsibleUnit: '区绿化市容局',
    constructionUnit: '青浦市政工程有限公司',
    totalInvestment: 3.8,
    currentStage: '路面改造',
    yearTarget: {
      year: currentYear,
      fundTarget: 8600,
      imageProgressTarget: '全线路面改造完工，绿化迁移及补种完成，沿线照明全覆盖',
      monthlyTargets: createEmptyMonthlyTargets().map((item, i) => ({
        month: item.month,
        fundTarget: [600, 700, 750, 800, 850, 800, 750, 700, 650, 600, 550, 500][i],
        imageProgressTarget: [
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
        ][i]
      })),
      submittedAt: offsetTime(-85),
      submittedBy: '吴芳'
    },
    monthlyFundReports: [
      {
        id: 'mf4',
        year: currentYear,
        month: currentMonth,
        completedAmount: 920,
        cumulativeAmount: 3180,
        remark: '路面摊铺与绿化迁移费用',
        reportedAt: offsetTime(-4),
        reportedBy: '孙丽娜'
      }
    ],
    monthlyImageReports: [
      {
        id: 'mi3',
        year: currentYear,
        month: currentMonth,
        content: '西段非机动车道铺装完成，东段人行道铺装推进中',
        progressPercent: 48,
        reportedAt: offsetTime(-2),
        reportedBy: '林雨桐'
      }
    ],
    weeklyImageReports: [
      {
        id: 'wi3',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '西段非机动车道铺装完成，东段人行道铺装推进中',
        progressPercent: 48,
        reportedAt: offsetTime(-2),
        reportedBy: '林雨桐'
      }
    ],
    updatedAt: offsetTime(-2)
  },
  {
    id: 'ip3',
    projectName: '徐泾北社区公共服务设施补短板项目',
    projectCode: 'QP2026-XX-003',
    responsibleUnit: '徐泾镇人民政府',
    constructionUnit: '徐泾城镇建设投资有限公司',
    totalInvestment: 2.1,
    currentStage: '主体施工',
    yearTarget: {
      year: currentYear,
      fundTarget: 5200,
      imageProgressTarget: '综合服务中心主体完工，室外配套及景观基本完成',
      monthlyTargets: createEmptyMonthlyTargets().map((item) => ({
        month: item.month,
        fundTarget: 430,
        imageProgressTarget: `${item.month}月形象进度节点按计划推进`
      })),
      submittedAt: offsetTime(-70),
      submittedBy: '马文博'
    },
    monthlyFundReports: [],
    monthlyImageReports: [
      {
        id: 'mi4',
        year: currentYear,
        month: currentMonth,
        content: '主体三层梁板浇筑完成，外围降噪围挡加高验收通过',
        progressPercent: 55,
        reportedAt: offsetTime(-1, -2),
        reportedBy: '徐天宇'
      }
    ],
    weeklyImageReports: [
      {
        id: 'wi4',
        year: thisWeek.year,
        week: thisWeek.week,
        weekStart: thisWeek.weekStart,
        weekEnd: thisWeek.weekEnd,
        content: '主体三层梁板浇筑完成，外围降噪围挡加高验收通过',
        progressPercent: 55,
        reportedAt: offsetTime(-1, -2),
        reportedBy: '徐天宇'
      }
    ],
    updatedAt: offsetTime(-1, -2)
  },
  {
    id: 'ip4',
    projectName: '朱家角古镇基础设施改造工程',
    projectCode: 'QP2026-XX-004',
    responsibleUnit: '朱家角镇人民政府',
    constructionUnit: '朱家角旅游发展有限公司',
    totalInvestment: 1.6,
    currentStage: '方案深化',
    yearTarget: undefined,
    monthlyFundReports: [],
    monthlyImageReports: [],
    weeklyImageReports: [],
    updatedAt: offsetTime(-40)
  }
];

function touch(project: ImageProgressProject) {
  project.updatedAt = formatDateTime(new Date());
}

function filterByYear(project: ImageProgressProject, year: number): ImageProgressProject {
  return {
    ...project,
    yearTarget: project.yearTarget?.year === year ? project.yearTarget : undefined,
    monthlyFundReports: project.monthlyFundReports.filter((r) => r.year === year),
    monthlyImageReports: project.monthlyImageReports.filter((r) => r.year === year),
    weeklyImageReports: project.weeklyImageReports.filter((r) => r.year === year)
  };
}

export const imageProgressCompletionStore = {
  list(params: ImageProgressQuery = {}) {
    let list = [...projects];
    const keyword = params.keyword?.trim();
    if (keyword) {
      list = list.filter(
        (p) =>
          p.projectName.includes(keyword) ||
          p.projectCode.includes(keyword) ||
          p.responsibleUnit.includes(keyword) ||
          p.constructionUnit.includes(keyword)
      );
    }
    const year = params.year ?? currentYear;
    return list
      .map((p) => filterByYear(p, year))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  getById(id: string, year = currentYear) {
    const project = projects.find((p) => p.id === id);
    if (!project) return null;
    return filterByYear(project, year);
  },

  listOptions() {
    return projects.map((p) => ({
      value: p.id,
      label: `${p.projectName}（${p.projectCode}）`
    }));
  },

  saveYearTarget(payload: YearTargetPayload) {
    const project = projects.find((p) => p.id === payload.projectId);
    if (!project) return null;
    project.yearTarget = {
      year: payload.year,
      fundTarget: payload.fundTarget,
      imageProgressTarget: payload.imageProgressTarget,
      monthlyTargets: payload.monthlyTargets.map((m) => ({ ...m })),
      submittedAt: formatDateTime(new Date()),
      submittedBy: '当前用户'
    };
    touch(project);
    return filterByYear(project, payload.year);
  },

  saveMonthlyFund(payload: MonthlyFundPayload) {
    const project = projects.find((p) => p.id === payload.projectId);
    if (!project) return null;
    const existing = project.monthlyFundReports.find(
      (r) => r.year === payload.year && r.month === payload.month
    );
    if (existing) {
      existing.completedAmount = payload.completedAmount;
      existing.cumulativeAmount = payload.cumulativeAmount;
      existing.remark = payload.remark;
      existing.reportedAt = formatDateTime(new Date());
      existing.reportedBy = '当前用户';
    } else {
      project.monthlyFundReports.push({
        id: `mf${++fundSeq}`,
        year: payload.year,
        month: payload.month,
        completedAmount: payload.completedAmount,
        cumulativeAmount: payload.cumulativeAmount,
        remark: payload.remark,
        reportedAt: formatDateTime(new Date()),
        reportedBy: '当前用户'
      });
    }
    touch(project);
    return filterByYear(project, payload.year);
  },

  saveMonthlyImage(payload: MonthlyImagePayload) {
    const project = projects.find((p) => p.id === payload.projectId);
    if (!project) return null;
    const existing = project.monthlyImageReports.find(
      (r) => r.year === payload.year && r.month === payload.month
    );
    if (existing) {
      existing.content = payload.content;
      existing.progressPercent = payload.progressPercent;
      existing.reportedAt = formatDateTime(new Date());
      existing.reportedBy = '当前用户';
    } else {
      project.monthlyImageReports.push({
        id: `mi${++imageMonthSeq}`,
        year: payload.year,
        month: payload.month,
        content: payload.content,
        progressPercent: payload.progressPercent,
        reportedAt: formatDateTime(new Date()),
        reportedBy: '当前用户'
      });
    }
    touch(project);
    return filterByYear(project, payload.year);
  },

  saveWeeklyImage(payload: WeeklyImagePayload) {
    const project = projects.find((p) => p.id === payload.projectId);
    if (!project) return null;
    const existing = project.weeklyImageReports.find(
      (r) => r.year === payload.year && r.week === payload.week
    );
    if (existing) {
      existing.weekStart = payload.weekStart;
      existing.weekEnd = payload.weekEnd;
      existing.content = payload.content;
      existing.progressPercent = payload.progressPercent;
      existing.reportedAt = formatDateTime(new Date());
      existing.reportedBy = '当前用户';
    } else {
      project.weeklyImageReports.push({
        id: `wi${++weekSeq}`,
        year: payload.year,
        week: payload.week,
        weekStart: payload.weekStart,
        weekEnd: payload.weekEnd,
        content: payload.content,
        progressPercent: payload.progressPercent,
        reportedAt: formatDateTime(new Date()),
        reportedBy: '当前用户'
      });
    }
    // 同步写入当月形象进度完成（取最新周报）
    const month = Number(payload.weekStart.slice(5, 7));
    const mi = project.monthlyImageReports.find(
      (r) => r.year === payload.year && r.month === month
    );
    if (mi) {
      mi.content = payload.content;
      mi.progressPercent = payload.progressPercent;
      mi.reportedAt = formatDateTime(new Date());
      mi.reportedBy = '当前用户';
    } else {
      project.monthlyImageReports.push({
        id: `mi${++imageMonthSeq}`,
        year: payload.year,
        month,
        content: payload.content,
        progressPercent: payload.progressPercent,
        reportedAt: formatDateTime(new Date()),
        reportedBy: '当前用户'
      });
    }
    touch(project);
    return filterByYear(project, payload.year);
  }
};
