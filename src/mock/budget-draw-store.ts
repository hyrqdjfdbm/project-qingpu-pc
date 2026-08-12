import type { BudgetDrawPayload, BudgetDrawRecord, BudgetUnit } from '@/types/budget-draw';

const units: BudgetUnit[] = [
  { id: 'u1', name: '兰溪市建经工程咨询有限公司', contactPerson: '张工', phone: '0579-59880001' },
  { id: 'u2', name: '兰溪市东方投资监理有限公司', contactPerson: '李工', phone: '0579-59880002' },
  { id: 'u3', name: '兰溪市第一测量师事务所', contactPerson: '王工', phone: '0579-59880003' },
  { id: 'u4', name: '兰溪市华安造价咨询有限公司', contactPerson: '赵工', phone: '0579-59880004' },
  { id: 'u5', name: '兰溪市工程咨询中心', contactPerson: '陈工', phone: '0579-59880005' },
  { id: 'u6', name: '兰溪市同济工程咨询有限公司', contactPerson: '刘工', phone: '0579-59880006' },
  { id: 'u7', name: '兰溪市申元造价咨询有限公司', contactPerson: '周工', phone: '0579-59880007' },
  { id: 'u8', name: '兰溪市建科造价咨询有限公司', contactPerson: '吴工', phone: '0579-59880008' }
];

const records: BudgetDrawRecord[] = [
  {
    id: 'd1',
    projectName: '兰溪市新城公共租赁住房项目',
    totalInvestment: 58000,
    constructionUnit: '兰溪市住房和城乡建设局',
    legalPerson: '陈伟民',
    handler: '徐晓燕',
    contactPhone: '0579-88881234',
    compileUnit: '兰溪市建筑设计院',
    compileContact: '周立新',
    compilePhone: '0579-88885678',
    constructionContent: '新建公共租赁住房3栋，总建筑面积约4.2万㎡',
    excludedDetails: [
      {
        unitName: '兰溪市建经工程咨询有限公司',
        reason: '该单位为本项目可研编制单位，按规定须回避'
      }
    ],
    attachments: [
      { category: 'applicationForm', name: '申请表.pdf', size: 102400 },
      { category: 'projectProposal', name: '项目建议书.pdf', size: 245760 },
      { category: 'feasibilityReport', name: '可行性研究报告.pdf', size: 512000 },
      { category: 'budgetEstimate', name: '工程概算书.xlsx', size: 128000 }
    ],
    winnerUnit: '兰溪市华安造价咨询有限公司',
    eligibleCount: 7,
    drawTime: '2025-05-18 14:30:00'
  },
  {
    id: 'd2',
    projectName: '兰溪市游埠镇河道综合整治工程',
    totalInvestment: 12000,
    constructionUnit: '兰溪市水利局',
    legalPerson: '黄志强',
    handler: '方雅琴',
    contactPhone: '0579-88889012',
    compileUnit: '兰溪市水利勘测设计所',
    compileContact: '吴国平',
    compilePhone: '0579-88883456',
    constructionContent: '河道清淤、护岸改造及景观提升，全长约2.8公里',
    excludedDetails: [
      {
        unitName: '兰溪市东方投资监理有限公司',
        reason: '近期承担同类项目概算审核，存在利益关联'
      },
      {
        unitName: '兰溪市工程咨询中心',
        reason: '单位负责人参与本项目前期论证'
      }
    ],
    attachments: [
      { category: 'applicationForm', name: '申请表.pdf', size: 86000 },
      { category: 'preliminaryDesign', name: '初步设计文本.pdf', size: 380000 },
      { category: 'quantityMeasure', name: '工程计量数.xlsx', size: 96000 }
    ],
    winnerUnit: '兰溪市第一测量师事务所',
    eligibleCount: 6,
    drawTime: '2025-04-02 10:15:00'
  }
];

let recordId = 100;

function formatNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const budgetDrawStore = {
  listUnits() {
    return [...units];
  },

  listRecords() {
    return [...records].sort((a, b) => b.drawTime.localeCompare(a.drawTime));
  },

  draw(payload: BudgetDrawPayload): BudgetDrawRecord {
    const excludedSet = new Set(payload.excludedUnitIds);
    const eligible = units.filter((u) => !excludedSet.has(u.id));

    if (eligible.length === 0) {
      throw new Error('排除后无可抽取单位，请减少不参与抽取的单位');
    }

    for (const unitId of payload.excludedUnitIds) {
      const reason = payload.excludedReasons[unitId]?.trim();
      if (!reason) {
        const unit = units.find((u) => u.id === unitId);
        throw new Error(`请填写「${unit?.name ?? '该单位'}」不参与抽取的原因`);
      }
    }

    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    const excludedDetails = units
      .filter((u) => excludedSet.has(u.id))
      .map((u) => ({
        unitName: u.name,
        reason: payload.excludedReasons[u.id].trim()
      }));

    const record: BudgetDrawRecord = {
      id: String(++recordId),
      projectName: payload.projectName.trim(),
      totalInvestment: payload.totalInvestment,
      constructionUnit: payload.constructionUnit.trim(),
      legalPerson: payload.legalPerson.trim(),
      handler: payload.handler.trim(),
      contactPhone: payload.contactPhone.trim(),
      compileUnit: payload.compileUnit.trim(),
      compileContact: payload.compileContact.trim(),
      compilePhone: payload.compilePhone.trim(),
      constructionContent: payload.constructionContent.trim(),
      excludedDetails,
      attachments: [...payload.attachments],
      winnerUnit: winner.name,
      eligibleCount: eligible.length,
      drawTime: formatNow()
    };

    records.unshift(record);
    return record;
  }
};
