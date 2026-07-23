let idCounter = 100;

/** @type {import('./projects.js').Project[]} */
const projects = [
  {
    id: '1',
    projectCode: '132164445310118I01',
    projectName: '智能水表数字化迭代转型',
    projectAbbr: '智能水表',
    projectType: 'industry',
    projectLocation: '金泽镇',
    projectNature: 'new',
    poolStage: 'supplement',
    responsibleUnits: ['区经信委', '区发改委'],
    totalInvestment: 41.11,
    status: 'stored',
    unitName: '上海某某智能科技有限公司',
    projectAttribute: 'social',
    projectCategory: 'industry',
    constructionSite: '金泽镇',
    constructionAddress: '金泽镇工业园区某某路88号',
    constructionNature: 'new',
    constructionScale: '新建智能水表生产线，年产能500万只',
    constructionProgress: '方案已形成',
    needConstructionPermit: true,
    schemeCompleteDate: '2024-12-01',
    declaredBy: '张伟',
    createdAt: '2025-03-15'
  },
  {
    id: '2',
    projectCode: '132164445310118I02',
    projectName: '新能源汽车电池壳及储能箱体智能化生产线技术改造项目',
    projectAbbr: '新能源电池壳',
    projectType: 'industry',
    projectLocation: '华新镇',
    projectNature: 'expand',
    poolStage: 'supplement',
    responsibleUnits: ['区经信委'],
    totalInvestment: 2.34,
    status: 'pending',
    unitName: '上海某某新能源科技有限公司',
    projectAttribute: 'government',
    projectCategory: 'industry',
    constructionSite: '华新镇',
    constructionAddress: '华新镇某某工业区',
    constructionNature: 'expand',
    constructionScale: '扩建智能化生产线',
    needConstructionPermit: true,
    planningCompleteDate: '2025-01-15',
    proposalApprovalDate: '2025-02-20',
    declaredBy: '李娜',
    createdAt: '2025-04-01'
  },
  {
    id: '3',
    projectCode: '132164445310118I03',
    projectName: '青浦区公共卫生中心建设项目',
    projectAbbr: '公共卫生中心',
    projectType: 'other',
    projectLocation: '夏阳街道',
    projectNature: 'new',
    poolStage: 'supplement',
    responsibleUnits: ['区卫健委', '区发改委'],
    totalInvestment: 8.5,
    status: 'pending',
    unitName: '青浦区卫生健康委员会',
    projectAttribute: 'government',
    projectCategory: 'other',
    constructionSite: '夏阳街道',
    constructionAddress: '夏阳街道某某路',
    constructionNature: 'new',
    constructionScale: '新建公共卫生中心，建筑面积12000㎡',
    needConstructionPermit: true,
    declaredBy: '王强',
    createdAt: '2025-05-10'
  },
  {
    id: '4',
    projectCode: '132164445310118P01',
    projectName: '青浦新城商业综合体谋划项目',
    projectAbbr: '新城商业综合体',
    projectType: 'real_estate',
    projectLocation: '盈浦街道',
    projectNature: 'new',
    poolStage: 'planning',
    responsibleUnits: ['区商务委', '区发改委'],
    totalInvestment: 15.8,
    status: 'stored',
    unitName: '青浦新城开发集团有限公司',
    projectAttribute: 'social',
    projectCategory: 'real_estate',
    constructionSite: '盈浦街道',
    constructionAddress: '盈浦街道中央商务区',
    constructionNature: 'new',
    constructionScale: '商业综合体，建筑面积约8万㎡',
    needConstructionPermit: true,
    schemeCompleteDate: '2025-02-10',
    declaredBy: '陈静',
    createdAt: '2025-02-01'
  },
  {
    id: '5',
    projectCode: '132164445310118P02',
    projectName: '长三角一体化示范区绿道贯通工程',
    projectAbbr: '绿道贯通',
    projectType: 'other',
    projectLocation: '金泽镇',
    projectNature: 'new',
    poolStage: 'planning',
    responsibleUnits: ['区建管委'],
    totalInvestment: 3.2,
    status: 'stored',
    unitName: '青浦区建设和管理委员会',
    projectAttribute: 'government',
    projectCategory: 'other',
    constructionSite: '金泽镇',
    constructionAddress: '示范区河湖水网沿线',
    constructionNature: 'new',
    constructionScale: '绿道贯通约12公里',
    needConstructionPermit: false,
    planningCompleteDate: '2024-11-20',
    proposalApprovalDate: '2025-01-08',
    declaredBy: '刘洋',
    createdAt: '2025-01-15'
  },
  {
    id: '6',
    projectCode: '132164445310118M01',
    projectName: '上海山崎电路板有限公司二期项目',
    projectAbbr: '山崎电路板二期',
    projectType: 'industry',
    projectLocation: '华新镇',
    projectNature: 'expand',
    poolStage: 'implementation',
    progressPercent: 68,
    responsibleUnits: ['区经信委'],
    totalInvestment: 5.92,
    status: 'stored',
    unitName: '上海山崎电路板有限公司',
    projectAttribute: 'social',
    projectCategory: 'industry',
    constructionSite: '华新镇',
    constructionAddress: '华新镇工业园区',
    constructionNature: 'expand',
    constructionScale: '扩建PCB生产线',
    constructionProgress: '主体施工',
    needConstructionPermit: true,
    schemeCompleteDate: '2024-06-01',
    declaredBy: '赵敏',
    createdAt: '2024-08-01'
  },
  {
    id: '7',
    projectCode: '132164445310118M02',
    projectName: '赫格纳斯青浦新建厂房项目',
    projectAbbr: '赫格纳斯厂房',
    projectType: 'industry',
    projectLocation: '工业园区',
    projectNature: 'new',
    poolStage: 'implementation',
    progressPercent: 42,
    responsibleUnits: ['区经信委', '工业园区'],
    totalInvestment: 3.41,
    status: 'stored',
    unitName: '赫格纳斯（中国）有限公司',
    projectAttribute: 'social',
    projectCategory: 'industry',
    constructionSite: '工业园区',
    constructionAddress: '香花桥街道某某路',
    constructionNature: 'new',
    constructionScale: '新建厂房12000㎡',
    constructionProgress: '基础施工',
    needConstructionPermit: true,
    schemeCompleteDate: '2024-09-15',
    declaredBy: '孙磊',
    createdAt: '2024-10-01'
  },
  {
    id: '8',
    projectCode: '132164445310118G01',
    projectName: '青浦区污水处理厂提标改造工程',
    projectAbbr: '污水厂提标',
    projectType: 'other',
    projectLocation: '香花桥街道',
    projectNature: 'rebuild',
    poolStage: 'gov',
    progressPercent: 55,
    responsibleUnits: ['区建管委', '区发改委'],
    totalInvestment: 6.78,
    status: 'stored',
    unitName: '青浦区水务局',
    projectAttribute: 'government',
    projectCategory: 'other',
    constructionSite: '香花桥街道',
    constructionAddress: '香花桥街道污水处理厂',
    constructionNature: 'rebuild',
    constructionScale: '提标改造日处理量10万吨',
    constructionProgress: '设备安装',
    needConstructionPermit: true,
    planningCompleteDate: '2024-05-01',
    proposalApprovalDate: '2024-07-20',
    declaredBy: '周婷',
    createdAt: '2024-08-15'
  }
];

const POOL_STAGE_LABEL = {
  planning: '谋划库',
  supplement: '增补库',
  implementation: '实施库',
  gov: '政府投资项目库'
};

function matchInvestRange(amount, range) {
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

function filterProjects(query) {
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
    result = result.filter((p) => p.responsibleUnits.includes(query.responsibleUnit));
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
  list(query = {}) {
    return filterProjects(query);
  },

  getById(id) {
    return projects.find((p) => p.id === id);
  },

  create(data, poolStage = 'supplement') {
    const item = {
      ...data,
      id: String(++idCounter),
      projectCode: generateCode(),
      projectType: data.projectType || data.projectCategory || 'industry',
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

  update(id, data) {
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

  audit(id, { approved, remark }) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    projects[idx] = {
      ...projects[idx],
      status: approved ? 'stored' : 'returned',
      auditRemark: remark
    };
    return projects[idx];
  },

  transferPool(id, poolStage) {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    projects[idx] = { ...projects[idx], poolStage };
    return projects[idx];
  },

  getOverview() {
    const totalInvestment = projects.reduce((sum, p) => sum + (p.totalInvestment ?? 0), 0);
    const byPoolStage = Object.entries(POOL_STAGE_LABEL).map(([stage, label]) => ({
      stage,
      label,
      count: projects.filter((p) => p.poolStage === stage).length
    }));
    const townMap = {};
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
