import { ref } from 'vue';

/** 增补库 / 工作台演示用当前登录用户（无真实登录时模拟数据/按钮权限） */
export type AppRole =
  | 'projectSpecialist'
  | 'supervisor'
  | 'districtSpecialist'
  | 'jingweiAuditor'
  | 'fagaiAuditor'
  | 'cityLeader'
  | 'deptHead'
  | 'investmentMgmt'
  | 'admin';

export const APP_ROLE_LABEL: Record<AppRole, string> = {
  projectSpecialist: '项目专员',
  supervisor: '分管领导',
  districtSpecialist: '片区专员',
  jingweiAuditor: '区经委审核专员',
  fagaiAuditor: '区发改审核专员',
  cityLeader: '市领导',
  deptHead: '部门一把手',
  investmentMgmt: '投管科',
  admin: '系统管理员'
};

export const ROLE_PRESETS: Record<AppRole, { id: string; name: string; unit: string }> = {
  projectSpecialist: { id: 'u-specialist-lin', name: '林雨桐', unit: '区建管委' },
  supervisor: { id: 'u-supervisor-zhao', name: '赵文博', unit: '区建管委' },
  districtSpecialist: { id: 'u-district-1', name: '片区专员甲', unit: '区发改委' },
  jingweiAuditor: { id: 'u-jingwei-shen', name: '沈若兰', unit: '区经委' },
  fagaiAuditor: { id: 'u-fagai-zheng', name: '郑昊然', unit: '区发改委' },
  cityLeader: { id: 'u-city-1', name: '周启明', unit: '市政府' },
  deptHead: { id: 'u-dept-head-1', name: '陈立峰', unit: '区建管委' },
  investmentMgmt: { id: 'u-invest-wu', name: '吴芳', unit: '区发改委' },
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

/** 角色切换后递增，页面用 computed 依赖它以刷新权限按钮 */
export const currentUserVersion = ref(0);

export function setCurrentUser(patch: Partial<CurrentUser>) {
  currentUser = { ...currentUser, ...patch };
  currentUserVersion.value += 1;
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

/** 数据管理 · 责任单位固投：仅投管科 */
export function isInvestmentMgmtRole(role: AppRole) {
  return role === 'investmentMgmt';
}

/** 形象进度 / 上级资金填报：项目专员、管理员 */
export function canFillProgressFund(role: AppRole) {
  return role === 'projectSpecialist' || role === 'admin';
}

/** 形象进度 / 上级资金审核：分管领导、投管科、片区专员、管理员 */
export function canAuditProgressFund(role: AppRole) {
  return (
    role === 'supervisor' ||
    role === 'investmentMgmt' ||
    role === 'districtSpecialist' ||
    role === 'admin'
  );
}

/** 青浦增补库申报：项目专员、管理员 */
export function canDeclareQingpuSupplement(role: AppRole) {
  return role === 'projectSpecialist' || role === 'admin';
}

/** 青浦增补列表：管理员 / 区经委 / 区发改看全部，专员仅本人 */
export function canViewAllQingpuSupplement(role: AppRole) {
  return role === 'admin' || role === 'jingweiAuditor' || role === 'fagaiAuditor';
}

/** 青浦增补审核：社会投资→区经委；政府投资/其他→区发改；管理员可审全部 */
export function canAuditQingpuSupplement(
  role: AppRole,
  channel: 'jingwei' | 'fagai'
) {
  if (role === 'admin') return true;
  if (channel === 'jingwei') return role === 'jingweiAuditor';
  return role === 'fagaiAuditor';
}
