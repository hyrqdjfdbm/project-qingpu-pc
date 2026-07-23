import type { ProjectType } from '@/types/supplement-pool';

/** 各项目类型对应的审核部门（单部门审核） */
export const AUDIT_DEPT_BY_TYPE: Record<ProjectType, string> = {
  real_estate: '区发改委',
  industry: '区经信委',
  other: '区发改委'
};

export function getAuditDepartment(projectType: ProjectType): string {
  return AUDIT_DEPT_BY_TYPE[projectType];
}
