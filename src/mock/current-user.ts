/** 增补库 / 工作台演示用当前登录用户（无真实登录时模拟数据/按钮权限） */
export type AppRole =
  | 'projectSpecialist'
  | 'supervisor'
  | 'districtSpecialist'
  | 'cityLeader'
  | 'deptHead'
  | 'admin';

export const APP_ROLE_LABEL: Record<AppRole, string> = {
  projectSpecialist: '项目专员',
  supervisor: '分管领导',
  districtSpecialist: '片区专员',
  cityLeader: '市领导',
  deptHead: '部门一把手',
  admin: '系统管理员'
};

export const ROLE_PRESETS: Record<AppRole, { id: string; name: string; unit: string }> = {
  projectSpecialist: { id: 'u-specialist-lin', name: '林雨桐', unit: '区建管委' },
  supervisor: { id: 'u-supervisor-zhao', name: '赵文博', unit: '区建管委' },
  districtSpecialist: { id: 'u-district-1', name: '片区专员甲', unit: '区发改委' },
  cityLeader: { id: 'u-city-1', name: '周启明', unit: '市政府' },
  deptHead: { id: 'u-dept-head-1', name: '陈立峰', unit: '区建管委' },
  admin: { id: 'u-admin', name: '系统管理员', unit: '系统' }
};

export interface CurrentUser {
  id: string;
  name: string;
  unit: string;
  role: AppRole;
}

/** 默认以项目专员身份演示；可在页面切换身份验证权限 */
let currentUser: CurrentUser = {
  role: 'projectSpecialist',
  ...ROLE_PRESETS.projectSpecialist
};

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(patch: Partial<CurrentUser>) {
  currentUser = { ...currentUser, ...patch };
}

export function switchRole(role: AppRole) {
  setCurrentUser({ role, ...ROLE_PRESETS[role] });
  return getCurrentUser();
}

/** 项目增补列表：专员仅本人；片区专员/市领导/管理员看全部 */
export function canViewAllSupplementApplications(role: AppRole) {
  return (
    role === 'districtSpecialist' ||
    role === 'cityLeader' ||
    role === 'admin'
  );
}

/** 修改/撤销：仅申请的项目专员（本人） */
export function canManageOwnSupplementApplication(
  role: AppRole,
  applicantId: string,
  userId: string
) {
  return role === 'projectSpecialist' && applicantId === userId;
}

/** 增补初审：分管领导看待自己审的；管理员可看全部待审（便于演示） */
export function canFirstAuditAll(role: AppRole) {
  return role === 'admin';
}

/** 增补终审：片区专员看全部待终审；管理员同 */
export function canFinalAuditAll(role: AppRole) {
  return role === 'districtSpecialist' || role === 'admin';
}
