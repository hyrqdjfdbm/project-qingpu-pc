import { qingpuWithdrawStore } from '@/mock/qingpu-withdraw-store';
import type { QingpuAuditChannel } from '@/types/qingpu-supplement';
import type {
  QingpuRestoreAuditPayload,
  QingpuRestoreForm,
  QingpuRestoreItem,
  QingpuRestoreQuery,
  QingpuWithdrawnProject
} from '@/types/qingpu-restore';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function nowText(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function offsetDays(days: number, hours = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return nowText(d);
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

let idSeq = 8;

const records: QingpuRestoreItem[] = [
  {
    id: 'qr1',
    withdrawId: 'qw6',
    projectId: 'p-qw6',
    projectName: '朱家角水乡客厅商业配套设施项目',
    projectCode: '132164445310118S11',
    totalInvestment: 0,
    statisticalBelonging: '朱家角镇',
    responsibleUnits: ['区商务委', '朱家角镇'],
    withdrawReason: '业态方案重大调整',
    restoreReason: '业态方案已调整到位，申请恢复入库继续推进',
    status: 'pendingReview',
    auditChannel: 'jingwei',
    applicant: '孙丽娜',
    applicantId: 'u-specialist-sun',
    applicantUnit: '区商务委',
    submittedAt: offsetDays(-3, -1),
    createdAt: offsetDays(-3, -1),
    updatedAt: offsetDays(-3, -1)
  },
  {
    id: 'qr2',
    withdrawId: 'qw8',
    projectId: 'p-qw8',
    projectName: '练塘镇商贸物流园一期',
    projectCode: '132164445310118S13',
    totalInvestment: 2.78,
    statisticalBelonging: '练塘镇',
    responsibleUnits: ['区商务委', '练塘镇'],
    withdrawReason: '土地供应节奏延后',
    restoreReason: '土地供应节点已明确，申请恢复入库',
    status: 'returned',
    auditChannel: 'jingwei',
    applicant: '周佳宁',
    applicantId: 'u-specialist-zhou',
    applicantUnit: '区商务委',
    submittedAt: offsetDays(-8),
    createdAt: offsetDays(-8),
    updatedAt: offsetDays(-5),
    auditedAt: offsetDays(-5),
    auditedBy: '沈若兰',
    auditOpinion: '土地出让合同尚未签署，请补充材料后重报'
  },
  {
    id: 'qr3',
    withdrawId: 'qw7',
    projectId: '7',
    projectName: '赫格纳斯青浦新建厂房项目',
    projectCode: '132164445310118M02',
    totalInvestment: 3.41,
    statisticalBelonging: '工业园区',
    responsibleUnits: ['区经信委', '工业园区'],
    withdrawReason: '业主调整建设时序，申请退库；后续可恢复入库',
    restoreReason: '建设时序已理顺，申请恢复入库继续实施',
    status: 'pendingReview',
    auditChannel: 'jingwei',
    applicant: '林雨桐',
    applicantId: 'u-specialist-lin',
    applicantUnit: '区建管委',
    submittedAt: offsetDays(-1, -4),
    createdAt: offsetDays(-1, -4),
    updatedAt: offsetDays(-1, -4)
  }
];

function latestByWithdrawId(withdrawId: string) {
  return records
    .filter((r) => r.withdrawId === withdrawId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

function toPoolItem(withdrawId: string): QingpuWithdrawnProject | null {
  const w = qingpuWithdrawStore.getById(withdrawId);
  if (!w || w.status !== 'withdrawn' || w.restoredAt) return null;
  const restore = latestByWithdrawId(withdrawId);
  const liveRestore = restore && restore.status !== 'restored' ? restore : null;
  return {
    withdrawId: w.id,
    projectId: w.projectId,
    projectName: w.projectName,
    projectCode: w.projectCode,
    projectAbbr: w.projectAbbr,
    totalInvestment: w.totalInvestment,
    statisticalBelonging: w.statisticalBelonging,
    responsibleUnits: [...w.responsibleUnits],
    withdrawReason: w.reason,
    withdrawnAt: w.auditedAt || w.updatedAt,
    withdrawApplicant: w.applicant,
    withdrawApplicantUnit: w.applicantUnit,
    auditChannel: w.auditChannel,
    restore: liveRestore ? clone(liveRestore) : null
  };
}

function matchPool(item: QingpuWithdrawnProject, params: QingpuRestoreQuery) {
  if (params.statisticalBelonging && item.statisticalBelonging !== params.statisticalBelonging) {
    return false;
  }
  if (params.responsibleUnit && !item.responsibleUnits.includes(params.responsibleUnit)) {
    return false;
  }
  if (params.auditChannel && item.auditChannel !== params.auditChannel) return false;
  if (params.restoreStatus === 'none') {
    if (item.restore && item.restore.status !== 'revoked') return false;
  }
  if (params.restoreStatus && params.restoreStatus !== 'none') {
    if (item.restore?.status !== params.restoreStatus) return false;
  }
  if (params.keyword) {
    const kw = params.keyword.trim();
    if (
      !item.projectName.includes(kw) &&
      !item.projectCode.includes(kw) &&
      !(item.projectAbbr || '').includes(kw)
    ) {
      return false;
    }
  }
  return true;
}

function matchRestore(item: QingpuRestoreItem, params: QingpuRestoreQuery) {
  if (params.statisticalBelonging && item.statisticalBelonging !== params.statisticalBelonging) {
    return false;
  }
  if (params.responsibleUnit && !item.responsibleUnits.includes(params.responsibleUnit)) {
    return false;
  }
  if (params.auditChannel && item.auditChannel !== params.auditChannel) return false;
  if (params.keyword) {
    const kw = params.keyword.trim();
    if (
      !item.projectName.includes(kw) &&
      !item.projectCode.includes(kw) &&
      !(item.projectAbbr || '').includes(kw)
    ) {
      return false;
    }
  }
  return true;
}

export const qingpuRestoreStore = {
  listPool(params: QingpuRestoreQuery = {}): QingpuWithdrawnProject[] {
    return qingpuWithdrawStore
      .list({ status: 'withdrawn' })
      .map((w) => toPoolItem(w.id))
      .filter((item): item is QingpuWithdrawnProject => Boolean(item))
      .filter((item) => matchPool(item, params))
      .sort((a, b) => b.withdrawnAt.localeCompare(a.withdrawnAt));
  },

  getPoolItem(withdrawId: string) {
    return toPoolItem(withdrawId);
  },

  listAuditTodos(params: QingpuRestoreQuery = {}) {
    return records
      .filter((r) => r.status === 'pendingReview')
      .filter((r) => matchRestore(r, params))
      .map(clone)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },

  getRestoreById(id: string) {
    const item = records.find((r) => r.id === id);
    return item ? clone(item) : null;
  },

  isBusy(withdrawId: string) {
    return records.some((r) => r.withdrawId === withdrawId && r.status === 'pendingReview');
  },

  create(
    data: QingpuRestoreForm,
    meta?: {
      applicant?: string;
      applicantId?: string;
      applicantUnit?: string;
    }
  ) {
    const pool = toPoolItem(data.withdrawId);
    if (!pool) throw new Error('仅已退库项目可申请恢复');
    if (this.isBusy(data.withdrawId)) {
      throw new Error('该项目已有在途恢复申请，请勿重复申报');
    }
    if (!data.restoreReason.trim()) {
      throw new Error('请填写恢复原因');
    }
    const now = nowText();
    const item: QingpuRestoreItem = {
      id: `qr${++idSeq}`,
      withdrawId: pool.withdrawId,
      projectId: pool.projectId,
      projectName: pool.projectName,
      projectCode: pool.projectCode,
      projectAbbr: pool.projectAbbr,
      totalInvestment: pool.totalInvestment,
      statisticalBelonging: pool.statisticalBelonging,
      responsibleUnits: [...pool.responsibleUnits],
      withdrawReason: pool.withdrawReason,
      restoreReason: data.restoreReason.trim(),
      status: 'pendingReview',
      auditChannel: pool.auditChannel,
      applicant: meta?.applicant || '项目专员',
      applicantId: meta?.applicantId || 'u-specialist-lin',
      applicantUnit: meta?.applicantUnit || '责任单位',
      submittedAt: now,
      createdAt: now,
      updatedAt: now
    };
    records.unshift(item);
    return clone(item);
  },

  audit(id: string, payload: QingpuRestoreAuditPayload, auditor = '审核专员') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'pendingReview') return null;
    const now = nowText();
    item.auditOpinion = payload.opinion.trim();
    item.auditedAt = now;
    item.auditedBy = auditor;
    item.updatedAt = now;
    if (!payload.approved) {
      item.status = 'returned';
      return clone(item);
    }
    const restored = qingpuWithdrawStore.restore(item.withdrawId);
    if (!restored) {
      throw new Error('项目当前不可恢复入库');
    }
    item.status = 'restored';
    return clone(item);
  },

  revoke(id: string, reason?: string) {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    if (item.status !== 'pendingReview' && item.status !== 'returned') return null;
    if (item.status !== 'pendingReview' && !reason?.trim()) {
      throw new Error('非待审核状态撤销须填写撤销原因');
    }
    item.status = 'revoked';
    item.revokeReason = reason?.trim() || undefined;
    item.updatedAt = nowText();
    return clone(item);
  }
};

export type { QingpuAuditChannel };
