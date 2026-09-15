import { RESPONSIBLE_UNIT_OPTIONS } from '@/types/supplement-pool';
import type {
  ImportConfirmPayload,
  ImportPreviewResult,
  ImportPreviewRow,
  UnitFixedInvestmentAuditLog,
  UnitFixedInvestmentMatrixRow,
  UnitFixedInvestmentRecord
} from '@/types/unit-fixed-investment';
import { getCurrentUser } from '@/mock/current-user';

export const UNIT_FIXED_INVESTMENT_UPDATED_EVENT = 'unit-fixed-investment:updated';

const DEMO_CURRENT_YEAR = 2026;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateTime(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export function getAllowedYears() {
  return [DEMO_CURRENT_YEAR, DEMO_CURRENT_YEAR - 1];
}

export function isMonthEditable(year: number, month: number, now = new Date()) {
  if (month < 1 || month > 12) return false;
  if (year > now.getFullYear()) return false;
  if (year === now.getFullYear() && month > now.getMonth() + 1) return false;
  return getAllowedYears().includes(year);
}

export function roundAmountWan(value: number) {
  return Math.round(value * 100) / 100;
}

export function validateAmountWan(raw: string | number | null | undefined) {
  if (raw === null || raw === undefined || raw === '') {
    return { ok: false as const, message: '请填写金额' };
  }
  const num = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim());
  if (!Number.isFinite(num) || num < 0) {
    return { ok: false as const, message: '请填写不小于 0 的金额' };
  }
  const rounded = roundAmountWan(num);
  if (Math.abs(rounded - num) > 1e-9 && String(raw).includes('.')) {
    const decimals = String(raw).split('.')[1]?.length ?? 0;
    if (decimals > 2) {
      return { ok: false as const, message: '金额最多保留 2 位小数' };
    }
  }
  return { ok: true as const, value: rounded };
}

export const IMPORT_TEMPLATE_HEADERS = [
  '年份',
  '责任单位',
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
] as const;

let idSeq = 100;
let logSeq = 500;

const unitNames = RESPONSIBLE_UNIT_OPTIONS.map((o) => o.label);

const records: UnitFixedInvestmentRecord[] = [];
const auditLogs: UnitFixedInvestmentAuditLog[] = [];

function pushLog(
  action: UnitFixedInvestmentAuditLog['action'],
  year: number,
  month: number,
  unitName: string,
  newAmountWan: number,
  oldAmountWan?: number,
  batchId?: string
) {
  auditLogs.unshift({
    id: `ufi-log-${++logSeq}`,
    action,
    year,
    month,
    unitName,
    oldAmountWan,
    newAmountWan,
    operator: getCurrentUser().name,
    operatedAt: formatDateTime(),
    batchId
  });
}

function seed() {
  const seeds: Array<{ unit: string; month: number; wan: number }> = [
    { unit: '区发改委', month: 8, wan: 86500.25 },
    { unit: '区经信委', month: 8, wan: 74230.5 },
    { unit: '区建管委', month: 8, wan: 92180.0 },
    { unit: '区科委', month: 8, wan: 35640.75 },
    { unit: '区发改委', month: 7, wan: 80120.0 },
    { unit: '区建管委', month: 7, wan: 85600.5 },
    { unit: '区商务委', month: 6, wan: 52340.0 }
  ];
  const now = formatDateTime();
  for (const s of seeds) {
    records.push({
      id: `ufi-${++idSeq}`,
      year: DEMO_CURRENT_YEAR,
      month: s.month,
      unitName: s.unit,
      amountWan: s.wan,
      updatedAt: now,
      updatedBy: '吴芳'
    });
  }
}

seed();

function getRecord(year: number, month: number, unitName: string) {
  return records.find((r) => r.year === year && r.month === month && r.unitName === unitName);
}

function notifyUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UNIT_FIXED_INVESTMENT_UPDATED_EVENT));
  }
}

export const unitFixedInvestmentStore = {
  listUnitNames() {
    return [...unitNames];
  },

  getMatrix(year: number): UnitFixedInvestmentMatrixRow[] {
    return unitNames.map((unitName) => {
      const months: Record<number, number | undefined> = {};
      for (let m = 1; m <= 12; m += 1) {
        months[m] = getRecord(year, m, unitName)?.amountWan;
      }
      return { unitName, months };
    });
  },

  /** 图表用：万元 → 亿元；无记录返回 null */
  getAmountYiOrNull(year: number, month: number, unitName: string) {
    const rec = getRecord(year, month, unitName);
    if (!rec) return null;
    return Math.round((rec.amountWan / 10000) * 1000) / 1000;
  },

  /** 某年某月全部单位固投（亿元），未填按 0 */
  getFixedInvestmentMapYi(year: number, month: number) {
    const map = new Map<string, number>();
    for (const unitName of unitNames) {
      map.set(unitName, unitFixedInvestmentStore.getAmountYiOrNull(year, month, unitName) ?? 0);
    }
    return map;
  },

  upsertCell(
    year: number,
    month: number,
    unitName: string,
    amountWan: number,
    opts?: { auditAction?: UnitFixedInvestmentAuditLog['action']; batchId?: string; skipNotify?: boolean }
  ) {
    if (!unitNames.includes(unitName)) throw new Error('责任单位不在字典内');
    if (!getAllowedYears().includes(year)) throw new Error('仅可维护当年或上一年');
    if (!isMonthEditable(year, month)) throw new Error('不可填写晚于当前月的数据');

    const existing = getRecord(year, month, unitName);
    const now = formatDateTime();
    const operator = getCurrentUser().name;
    const rounded = roundAmountWan(amountWan);

    if (existing) {
      if (existing.amountWan === rounded) return existing;
      const oldAmount = existing.amountWan;
      existing.amountWan = rounded;
      existing.updatedAt = now;
      existing.updatedBy = operator;
      pushLog(
        opts?.auditAction || 'update',
        year,
        month,
        unitName,
        rounded,
        oldAmount,
        opts?.batchId
      );
      if (!opts?.skipNotify) notifyUpdated();
      return existing;
    }

    const created: UnitFixedInvestmentRecord = {
      id: `ufi-${++idSeq}`,
      year,
      month,
      unitName,
      amountWan: rounded,
      updatedAt: now,
      updatedBy: operator
    };
    records.push(created);
    pushLog(opts?.auditAction || 'create', year, month, unitName, rounded, undefined, opts?.batchId);
    if (!opts?.skipNotify) notifyUpdated();
    return created;
  },

  listAuditLogs(limit = 100) {
    return auditLogs.slice(0, limit);
  },

  buildImportTemplateCsv(year: number) {
    const header = IMPORT_TEMPLATE_HEADERS.join(',');
    const lines = unitNames.map((unitName) => {
      const months = Array.from({ length: 12 }, (_, i) => {
        const rec = getRecord(year, i + 1, unitName);
        return rec ? String(rec.amountWan) : '';
      });
      return [year, unitName, ...months].join(',');
    });
    return `\uFEFF${header}\n${lines.join('\n')}\n`;
  },

  parseImportText(text: string, now = new Date()): ImportPreviewResult {
    const lines = text
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      return { rows: [], validCount: 0, conflictCount: 0, invalidCount: 0 };
    }

    const header = lines[0].split(/[,\t]/).map((h) => h.trim().replace(/\s/g, ''));
    const expected = IMPORT_TEMPLATE_HEADERS.map((h) => h.replace(/\s/g, ''));
    const headerOk = expected.every((e, i) => header[i] === e);

    const dataLines = headerOk ? lines.slice(1) : [];
    const rows: ImportPreviewRow[] = [];

    if (!headerOk) {
      rows.push({
        rowNo: 1,
        year: 0,
        month: 0,
        unitName: '',
        newAmountWan: 0,
        action: 'invalid',
        error: '请使用系统下载的模板（年份、责任单位、1月～12月）'
      });
      return { rows, validCount: 0, conflictCount: 0, invalidCount: 1 };
    }

    dataLines.forEach((line, index) => {
      const rowNo = index + 2;
      const cols = line.split(/[,\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));
      const year = Number(cols[0]);
      const unitName = cols[1] || '';

      if (!getAllowedYears().includes(year)) {
        rows.push({
          rowNo,
          year,
          month: 0,
          unitName,
          newAmountWan: 0,
          action: 'invalid',
          error: '年份仅允许当年或上一年'
        });
        return;
      }
      if (!unitNames.includes(unitName)) {
        rows.push({
          rowNo,
          year,
          month: 0,
          unitName,
          newAmountWan: 0,
          action: 'invalid',
          error: '责任单位不在字典内'
        });
        return;
      }

      for (let month = 1; month <= 12; month += 1) {
        const raw = cols[month + 1];
        if (raw == null || raw === '') continue;

        if (!isMonthEditable(year, month, now)) {
          rows.push({
            rowNo,
            year,
            month,
            unitName,
            newAmountWan: 0,
            action: 'invalid',
            error: `${month}月不可填写晚于当前月的数据`
          });
          continue;
        }

        const amountCheck = validateAmountWan(raw);
        if (!amountCheck.ok) {
          rows.push({
            rowNo,
            year,
            month,
            unitName,
            newAmountWan: 0,
            action: 'invalid',
            error: `${month}月：${amountCheck.message}`
          });
          continue;
        }

        const existing = getRecord(year, month, unitName);
        if (existing) {
          rows.push({
            rowNo,
            year,
            month,
            unitName,
            newAmountWan: amountCheck.value,
            oldAmountWan: existing.amountWan,
            action: 'overwrite'
          });
        } else {
          rows.push({
            rowNo,
            year,
            month,
            unitName,
            newAmountWan: amountCheck.value,
            action: 'insert'
          });
        }
      }
    });

    return {
      rows,
      validCount: rows.filter((r) => r.action === 'insert' || r.action === 'overwrite').length,
      conflictCount: rows.filter((r) => r.action === 'overwrite').length,
      invalidCount: rows.filter((r) => r.action === 'invalid').length
    };
  },

  confirmImport(payload: ImportConfirmPayload) {
    const batchId = payload.batchId || `batch-${Date.now()}`;
    let written = 0;
    for (const row of payload.rows) {
      if (row.action === 'insert') {
        if (getRecord(row.year, row.month, row.unitName)) continue;
        unitFixedInvestmentStore.upsertCell(row.year, row.month, row.unitName, row.amountWan, {
          auditAction: 'import_insert',
          batchId,
          skipNotify: true
        });
        written += 1;
      } else if (row.action === 'overwrite') {
        unitFixedInvestmentStore.upsertCell(row.year, row.month, row.unitName, row.amountWan, {
          auditAction: 'import_overwrite',
          batchId,
          skipNotify: true
        });
        written += 1;
      }
    }
    notifyUpdated();
    return { batchId, written };
  }
};
