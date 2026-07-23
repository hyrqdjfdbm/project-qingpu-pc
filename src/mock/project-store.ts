import { seedProjects } from '@/mock/seed-projects';
import type { OverviewStats } from '@/types/overview';
import type {
  AuditPayload,
  InvestRange,
  PoolStage,
  SupplementProjectForm,
  SupplementProjectItem,
  SupplementProjectQuery
} from '@/types/supplement-pool';
import { POOL_STAGE_LABEL } from '@/types/supplement-pool';

let idCounter = 100;
const projects: SupplementProjectItem[] = seedProjects.map((item) => ({ ...item }));

function matchInvestRange(amount: number, range?: InvestRange) {
  if (!range) return true;
  if (range === '0-1') return amount < 1;
  if (range === '1-5') return amount >= 1 && amount < 5;
  if (range === '5-10') return amount >= 5 && amount < 10;
  return amount >= 10;
}

function generateCode() {
  const ts = Date.now().toString().slice(-8);
  idCounter += 1;
  return `1321644${ts}I${String(idCounter).padStart(2, '0')}`;
}

function filterProjects(query: SupplementProjectQuery) {
  let result = [...projects];
  if (query.poolStage) {
    result = result.filter((p) => p.poolStage === query.poolStage);
  }
  if (query.projectAttribute) {
    result = result.filter((p) => p.projectAttribute === query.projectAttribute);
  }
  if (query.keyword) {
    const kw = query.keyword.toLowerCase();
    result = result.filter(
      (p) =>
        p.projectName.toLowerCase().includes(kw) ||
        p.projectCode.toLowerCase().includes(kw)
    );
  }
  if (query.projectType) {
    result = result.filter((p) => p.projectType === query.projectType);
  }
  if (query.streetTown) {
    result = result.filter((p) => p.projectLocation === query.streetTown);
  }
  if (query.responsibleUnit) {
    result = result.filter((p) => p.responsibleUnits.includes(query.responsibleUnit!));
  }
  if (query.status) {
    result = result.filter((p) => p.status === query.status);
  }
  if (query.investRange) {
    result = result.filter((p) => matchInvestRange(p.totalInvestment ?? 0, query.investRange));
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const projectStore = {
  list(query: SupplementProjectQuery = {}) {
    return filterProjects(query);
  },

  getById(id: string) {
    return projects.find((p) => p.id === id);
  },

  create(data: SupplementProjectForm & { poolStage?: PoolStage; declaredBy?: string }, poolStage: PoolStage = 'supplement') {
    const item: SupplementProjectItem = {
      ...data,
      id: String(++idCounter),
      projectCode: generateCode(),
      projectType: data.projectCategory || 'industry',
      projectNature: data.constructionNature || 'new',
      poolStage,
      totalInvestment: data.totalInvestment ?? 0,
      responsibleUnits: data.responsibleUnits || [],
      needConstructionPermit: data.needConstructionPermit ?? false,
      status: 'pending',
      declaredBy: data.declaredBy || '管理员',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    projects.unshift(item);
    return item;
  },

  update(id: string, data: Partial<SupplementProjectForm>) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    if (projects[idx].poolStage === 'supplement' && projects[idx].status === 'stored') {
      return null;
    }
    projects[idx] = {
      ...projects[idx],
      ...data,
      projectNature: data.constructionNature ?? projects[idx].projectNature
    };
    return projects[idx];
  },

  audit(id: string, { approved, remark }: AuditPayload) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    if (projects[idx].status !== 'pending') return null;

    projects[idx] = {
      ...projects[idx],
      status: approved ? 'stored' : 'returned',
      auditRemark: remark?.trim() || undefined
    };
    return projects[idx];
  },

  transferPool(id: string, poolStage: PoolStage) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    projects[idx] = { ...projects[idx], poolStage };
    return projects[idx];
  },

  getOverview(): OverviewStats {
    const totalInvestment = projects.reduce((sum, p) => sum + (p.totalInvestment ?? 0), 0);
    const byPoolStage = (Object.keys(POOL_STAGE_LABEL) as PoolStage[]).map((stage) => ({
      stage,
      label: POOL_STAGE_LABEL[stage],
      count: projects.filter((p) => p.poolStage === stage).length
    }));
    const townMap: Record<string, number> = {};
    for (const p of projects) {
      townMap[p.projectLocation] = (townMap[p.projectLocation] || 0) + 1;
    }
    const byStreetTown = Object.entries(townMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalProjects: projects.length,
      pendingAudit: projects.filter((p) => p.status === 'pending').length,
      inImplementation: projects.filter((p) => p.poolStage === 'implementation').length,
      totalInvestment: Math.round(totalInvestment * 100) / 100,
      byPoolStage,
      byStreetTown
    };
  }
};
