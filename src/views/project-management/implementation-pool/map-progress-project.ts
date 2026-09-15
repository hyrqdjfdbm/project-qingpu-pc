import type { ProgressFundProject } from '@/types/progress-fund-report';
import { latestWeekly } from '@/types/progress-fund-report';
import type { SupplementProjectItem } from '@/types/supplement-pool';

export function mapProgressToPool(project: ProgressFundProject): SupplementProjectItem {
  const year = new Date().getFullYear();
  const week = latestWeekly(project.imageWeeklyReports, year);
  return {
    id: project.id,
    projectCode: project.projectCode,
    projectName: project.projectName,
    projectType: 'other',
    projectLocation: project.responsibleUnit,
    projectNature: 'new',
    poolStage: 'implementation',
    responsibleUnits: project.responsibleUnit ? [project.responsibleUnit] : [],
    totalInvestment: project.totalInvestment,
    status: 'stored',
    unitName: project.constructionUnit,
    constructionSite: '',
    constructionAddress: '',
    constructionScale: '',
    constructionProgress: project.currentStage,
    needConstructionPermit: false,
    createdAt: project.updatedAt,
    progressPercent: week?.progressPercent
  };
}
