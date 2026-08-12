import type {
  DailyStaffRecord,
  DailyStaffPayload,
  HolidayType,
  ResumeReportPayload,
  StopReportPayload,
  WorkSuspendItem,
  WorkSuspendQuery,
  WorkSuspendStatus
} from '@/types/work-suspend';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateTime(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function offsetTime(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDateTime(d);
}

function eachDate(start: string, end: string): string[] {
  const list: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    list.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return list;
}

/** 节假日默认区间（不停工时用于在岗人数填报日期） */
export function getHolidayDateRange(year: number, holiday: HolidayType): [string, string] {
  switch (holiday) {
    case 'mayDay':
      return [`${year}-05-01`, `${year}-05-05`];
    case 'nationalDay':
      return [`${year}-10-01`, `${year}-10-07`];
    case 'springFestival':
      return [`${year}-01-28`, `${year}-02-04`];
  }
}

/** 在岗人数填报日期区间：停工用停工区间，不停工用节假日默认区间 */
export function getDailyStaffDateRange(item: Pick<
  WorkSuspendItem,
  'isSuspended' | 'suspendStartDate' | 'suspendEndDate' | 'year' | 'holiday'
>): [string, string] | null {
  if (item.isSuspended && item.suspendStartDate && item.suspendEndDate) {
    return [item.suspendStartDate, item.suspendEndDate];
  }
  if (item.isSuspended === false) {
    return getHolidayDateRange(item.year, item.holiday);
  }
  return null;
}

const year = new Date().getFullYear();

let idSeq = 20;

function mockDaily(
  start: string,
  end: string,
  baseToday: number
): DailyStaffRecord[] {
  let cumulative = 0;
  return eachDate(start, end).map((date, i) => {
    const todayCount = baseToday + (i % 3);
    cumulative += todayCount;
    return { date, todayCount, cumulativeCount: cumulative };
  });
}

const records: WorkSuspendItem[] = [
  {
    id: 'ws1',
    year,
    holiday: 'mayDay',
    projectName: '青浦新城市政管网补短板工程',
    projectCode: 'QP-SS-2025-011',
    responsibleUnit: '区建管委',
    location: '夏阳街道、盈浦街道',
    status: 'pendingStop',
    dailyStaff: [],
    createdAt: offsetTime(-10),
    updatedAt: offsetTime(-10)
  },
  {
    id: 'ws2',
    year,
    holiday: 'mayDay',
    projectName: '淀山湖大道品质提升工程',
    projectCode: 'QP-SS-2025-021',
    responsibleUnit: '区建管委',
    location: '金泽镇淀山湖大道沿线',
    isSuspended: true,
    suspendStartDate: `${year}-05-01`,
    suspendEndDate: `${year}-05-05`,
    stopReportedAt: offsetTime(-5),
    stopReportedBy: '林雨桐',
    status: 'pendingDaily',
    dailyStaff: [],
    createdAt: offsetTime(-12),
    updatedAt: offsetTime(-5)
  },
  {
    id: 'ws3',
    year,
    holiday: 'nationalDay',
    projectName: '徐泾北社区公共服务综合体',
    projectCode: 'QP-SS-2025-031',
    responsibleUnit: '区农业农村委',
    location: '徐泾镇北区',
    isSuspended: true,
    suspendStartDate: `${year}-10-01`,
    suspendEndDate: `${year}-10-07`,
    stopReportedAt: offsetTime(-20),
    stopReportedBy: '孙丽娜',
    dailyStaff: mockDaily(`${year}-10-01`, `${year}-10-07`, 8),
    dailyReportedAt: offsetTime(-12),
    dailyReportedBy: '孙丽娜',
    status: 'pendingResume',
    createdAt: offsetTime(-30),
    updatedAt: offsetTime(-12)
  },
  {
    id: 'ws4',
    year,
    holiday: 'springFestival',
    projectName: '青浦新城中央商务区综合提升工程',
    projectCode: 'QP-SS-2025-041',
    responsibleUnit: '区发改委',
    location: '夏阳街道中央商务区',
    isSuspended: true,
    suspendStartDate: `${year}-01-28`,
    suspendEndDate: `${year}-02-04`,
    stopReportedAt: offsetTime(-60),
    stopReportedBy: '郭晓彤',
    dailyStaff: mockDaily(`${year}-01-28`, `${year}-02-04`, 5),
    dailyReportedAt: offsetTime(-50),
    dailyReportedBy: '郭晓彤',
    isResumed: true,
    resumeDate: `${year}-02-05`,
    resumeReportedAt: offsetTime(-45),
    resumeReportedBy: '郭晓彤',
    status: 'completed',
    createdAt: offsetTime(-70),
    updatedAt: offsetTime(-45)
  },
  {
    id: 'ws5',
    year,
    holiday: 'mayDay',
    projectName: '赵巷商贸枢纽配套提升项目',
    projectCode: 'QP-SS-2025-051',
    responsibleUnit: '区商务委',
    location: '赵巷镇',
    isSuspended: false,
    stopReportedAt: offsetTime(-4),
    stopReportedBy: '高晨阳',
    // 不停工也需填在岗人数；示例：已填待复工确认口径下直接完成
    dailyStaff: mockDaily(`${year}-05-01`, `${year}-05-05`, 12),
    dailyReportedAt: offsetTime(-3),
    dailyReportedBy: '高晨阳',
    isResumed: true,
    resumeDate: `${year}-05-06`,
    resumeReportedAt: offsetTime(-2),
    resumeReportedBy: '高晨阳',
    status: 'completed',
    createdAt: offsetTime(-8),
    updatedAt: offsetTime(-2)
  },
  {
    id: 'ws6',
    year,
    holiday: 'nationalDay',
    projectName: '华新镇先进制造园区配套道路工程',
    projectCode: 'QP-SS-2025-061',
    responsibleUnit: '区经信委',
    location: '华新镇工业园区',
    status: 'pendingStop',
    dailyStaff: [],
    createdAt: offsetTime(-2),
    updatedAt: offsetTime(-2)
  },
  {
    id: 'ws7',
    year,
    holiday: 'mayDay',
    projectName: '练塘镇水环境综合整治工程',
    projectCode: 'QP-SS-2025-071',
    responsibleUnit: '区水务局',
    location: '练塘镇',
    isSuspended: false,
    stopReportedAt: offsetTime(-1),
    stopReportedBy: '周启明',
    status: 'pendingDaily',
    dailyStaff: [],
    createdAt: offsetTime(-6),
    updatedAt: offsetTime(-1)
  }
];

function cloneItem(item: WorkSuspendItem): WorkSuspendItem {
  return JSON.parse(JSON.stringify(item));
}

function matchQuery(item: WorkSuspendItem, params: WorkSuspendQuery) {
  if (params.year && item.year !== params.year) return false;
  if (params.holiday && item.holiday !== params.holiday) return false;
  if (params.responsibleUnit && item.responsibleUnit !== params.responsibleUnit) return false;
  if (params.projectName && !item.projectName.includes(params.projectName)) return false;
  if (params.isSuspended !== undefined) {
    if (item.isSuspended !== params.isSuspended) return false;
  }
  if (params.isResumed !== undefined) {
    if (item.isResumed !== params.isResumed) return false;
  }
  return true;
}

export function buildDailyStaffTemplate(start: string, end: string): DailyStaffRecord[] {
  return eachDate(start, end).map((date) => ({
    date,
    cumulativeCount: 0,
    todayCount: 0
  }));
}

export const workSuspendStore = {
  list(params: WorkSuspendQuery = {}) {
    return records
      .filter((r) => matchQuery(r, params))
      .map(cloneItem)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  getById(id: string) {
    const item = records.find((r) => r.id === id);
    return item ? cloneItem(item) : null;
  },

  reportStop(id: string, payload: StopReportPayload, reporter = '项目专员') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'pendingStop') return null;

    const now = formatDateTime();
    item.isSuspended = payload.isSuspended;
    if (payload.isSuspended) {
      item.suspendStartDate = payload.suspendStartDate;
      item.suspendEndDate = payload.suspendEndDate;
    } else {
      item.suspendStartDate = undefined;
      item.suspendEndDate = undefined;
    }
    // 无论是否停工，未复工前均需填报在岗人数
    item.dailyStaff = [];
    item.isResumed = undefined;
    item.resumeDate = undefined;
    item.status = 'pendingDaily';
    item.stopReportedAt = now;
    item.stopReportedBy = reporter;
    item.updatedAt = now;
    return cloneItem(item);
  },

  reportDailyStaff(id: string, payload: DailyStaffPayload, reporter = '项目专员') {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    // 未复工可填（pendingDaily / pendingResume）
    if (item.status === 'pendingStop' || item.status === 'completed') return null;
    if (item.isResumed === true) return null;
    if (item.status !== 'pendingDaily' && item.status !== 'pendingResume') return null;

    const now = formatDateTime();
    const normalized = payload.dailyStaff.map((d) => ({
      date: d.date,
      cumulativeCount: Number(d.cumulativeCount) || 0,
      todayCount: Number(d.todayCount) || 0
    }));

    // 按日期合并进历史（同日覆盖）
    const map = new Map(item.dailyStaff.map((d) => [d.date, d]));
    for (const row of normalized) {
      map.set(row.date, row);
    }
    item.dailyStaff = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    item.dailyReportedAt = now;
    item.dailyReportedBy = reporter;

    // 首次填完从 pendingDaily 进入待复工；已在待复工则保持（可继续补报）
    if (item.status === 'pendingDaily') {
      item.status = 'pendingResume';
    }
    item.updatedAt = now;
    return cloneItem(item);
  },

  reportResume(id: string, payload: ResumeReportPayload, reporter = '项目专员') {
    const item = records.find((r) => r.id === id);
    if (!item || item.status !== 'pendingResume') return null;
    const now = formatDateTime();
    item.isResumed = payload.isResumed;
    item.resumeDate = payload.isResumed ? payload.resumeDate : undefined;
    item.resumeReportedAt = now;
    item.resumeReportedBy = reporter;
    // 确认复工后闭环；若填「未复工」则保持待复工，可继续填在岗人数
    if (payload.isResumed) {
      item.status = 'completed';
    }
    item.updatedAt = now;
    return cloneItem(item);
  },

  createSeed(
    data: Omit<WorkSuspendItem, 'id' | 'createdAt' | 'updatedAt' | 'dailyStaff' | 'status'> & {
      status?: WorkSuspendStatus;
      dailyStaff?: DailyStaffRecord[];
    }
  ) {
    const now = formatDateTime();
    const item: WorkSuspendItem = {
      id: `ws${++idSeq}`,
      dailyStaff: data.dailyStaff || [],
      status: data.status || 'pendingStop',
      createdAt: now,
      updatedAt: now,
      ...data
    };
    records.unshift(item);
    return cloneItem(item);
  }
};

export type { HolidayType };
