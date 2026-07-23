import type {
  ImageProgressTargetPayload,
  KeyProjectItem,
  KeyProjectQuery,
  MonthlyCompletionPayload
} from '@/types/key-project-overview';
import { createEmptyMonthlyTargets } from '@/types/key-project-overview';

const currentYear = new Date().getFullYear();

function padTime(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function seedMonthly(
  year: number,
  targets: number[],
  actuals: number[],
  reportedAts: (string | undefined)[] = []
) {
  return createEmptyMonthlyTargets(year).map((item, index) => ({
    month: item.month,
    targetAmount: targets[index],
    actualAmount: actuals[index] > 0 ? actuals[index] : undefined,
    reportedAt: reportedAts[index]
  }));
}

const projects: KeyProjectItem[] = [
  {
    id: 'kp1',
    projectName: '青浦新城中央商务区综合提升工程',
    projectCode: 'QP2026-KJ-001',
    responsibleUnit: '青浦区建设管理委员会',
    agencyUnit: '青浦新城代建管理有限公司',
    totalInvestment: 28.6,
    currentStage: '已开工',
    imageProgress: {
      year: currentYear,
      annualTarget: 86000,
      targetSubmittedAt: '2026-01-08 09:30:00',
      targetSubmittedBy: '青浦新城代建管理有限公司',
      monthlyTargets: seedMonthly(
        currentYear,
        [5200, 6800, 7200, 8000, 8500, 9000, 9500, 10000, 8800, 7600, 7000, 6000],
        [5100, 6500, 7000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['2026-01-28 15:20:00', '2026-02-26 14:10:00', '2026-03-27 11:05:00']
      )
    },
    updatedAt: '2026-03-28 10:20:00'
  },
  {
    id: 'kp2',
    projectName: '淀山湖大道环境品质提升项目',
    projectCode: 'QP2026-KJ-002',
    responsibleUnit: '青浦区绿化市容局',
    agencyUnit: '青浦市政代建中心',
    totalInvestment: 12.3,
    currentStage: '施工许可',
    imageProgress: {
      year: currentYear,
      annualTarget: 42000,
      targetSubmittedAt: '2026-01-10 10:15:00',
      targetSubmittedBy: '青浦市政代建中心',
      monthlyTargets: seedMonthly(
        currentYear,
        [2800, 3200, 3600, 4000, 4200, 4500, 4800, 5000, 4500, 4000, 3500, 3000],
        [2700, 3100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['2026-01-29 16:40:00', '2026-02-27 09:50:00']
      )
    },
    updatedAt: '2026-03-25 16:40:00'
  },
  {
    id: 'kp3',
    projectName: '徐泾北社区公共服务设施补短板项目',
    projectCode: 'QP2026-KJ-003',
    responsibleUnit: '徐泾镇人民政府',
    agencyUnit: '徐泾镇代建服务部',
    totalInvestment: 6.8,
    currentStage: '初步设计',
    imageProgress: {
      year: currentYear,
      annualTarget: 18000,
      monthlyTargets: createEmptyMonthlyTargets(currentYear)
    },
    updatedAt: '2026-03-20 09:15:00'
  }
];

export const keyProjectStore = {
  list(params: KeyProjectQuery = {}) {
    let result = [...projects];
    const keyword = params.keyword?.trim();
    if (keyword) {
      result = result.filter(
        (item) =>
          item.projectName.includes(keyword) ||
          item.projectCode.includes(keyword) ||
          item.responsibleUnit.includes(keyword) ||
          item.agencyUnit.includes(keyword)
      );
    }
    if (params.responsibleUnit) {
      result = result.filter((item) => item.responsibleUnit === params.responsibleUnit);
    }
    if (params.year) {
      result = result.filter((item) => item.imageProgress.year === params.year);
    }
    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  getById(id: string) {
    return projects.find((item) => item.id === id) ?? null;
  },

  saveTarget(id: string, payload: ImageProgressTargetPayload) {
    const item = projects.find((p) => p.id === id);
    if (!item) return null;

    const monthlyTargets = createEmptyMonthlyTargets(payload.year).map((row) => {
      const found = payload.monthlyTargets.find((m) => m.month === row.month);
      const existing = item.imageProgress.monthlyTargets.find((m) => m.month === row.month);
      return {
        month: row.month,
        targetAmount: found?.targetAmount,
        actualAmount: existing?.actualAmount,
        remark: existing?.remark,
        reportedAt: existing?.reportedAt
      };
    });

    const now = padTime(new Date());
    item.imageProgress = {
      year: payload.year,
      annualTarget: payload.annualTarget,
      monthlyTargets,
      targetSubmittedAt: now,
      targetSubmittedBy: item.agencyUnit
    };
    item.updatedAt = now;
    return item;
  },

  saveMonthlyCompletion(id: string, payload: MonthlyCompletionPayload) {
    const item = projects.find((p) => p.id === id);
    if (!item) return null;

    if (item.imageProgress.year !== payload.year) {
      throw new Error('填报年度与项目目标年度不一致');
    }

    const monthRow = item.imageProgress.monthlyTargets.find((m) => m.month === payload.month);
    if (!monthRow) return null;

    monthRow.actualAmount = payload.actualAmount;
    monthRow.remark = payload.remark?.trim() || undefined;
    monthRow.reportedAt = padTime(new Date());
    item.updatedAt = monthRow.reportedAt;
    return item;
  }
};
