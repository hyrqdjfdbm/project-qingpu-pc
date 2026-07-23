import type {
  MeetingCoordinationFormPayload,
  MeetingCoordinationQuery,
  MeetingCoordinationRecord
} from '@/types/meeting-coordination';

function padTime(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

let idSeq = 10;

const records: MeetingCoordinationRecord[] = [
  {
    id: 'mc1',
    meetingContent: '中央商务区征收推进专题协调会',
    meetingTime: '2026-03-18 14:00:00',
    schemeFiles: [{ name: '征收推进协调会议方案.pdf', size: 186000 }],
    coordinationLevel: '区级专题协调',
    projects: [
      {
        projectId: 'rp1',
        projectName: '青浦新城中央商务区综合提升工程',
        tasks: [
          {
            taskId: 't1-1',
            assignLeader: '赵副区长',
            assignContent: '协调区规资局加快征收手续办理，明确清场节点',
            responsibleEntity: '区规划资源局',
            progress: '规资局已出具阶段性意见，清场节点拟定为 4 月底',
            expectedCompleteTime: '2026-04-30',
            actualCompleteTime: undefined
          }
        ]
      }
    ],
    createdAt: '2026-03-18 17:30:00',
    updatedAt: '2026-03-18 17:30:00'
  },
  {
    id: 'mc2',
    meetingContent: '淀山湖大道商户通行保障协调会',
    meetingTime: '2026-03-22 09:30:00',
    schemeFiles: [{ name: '商户通行保障会议方案.docx', size: 92000 }],
    coordinationLevel: '街镇级协调',
    projects: [
      {
        projectId: 'rp2',
        projectName: '淀山湖大道环境品质提升项目',
        tasks: [
          {
            taskId: 't2-1',
            assignLeader: '李秘书长',
            assignContent: '制定商户临时通行保障方案，并张贴告知',
            responsibleEntity: '金泽镇人民政府',
            progress: '临时通行方案已张贴，商户反馈基本平稳',
            expectedCompleteTime: '2026-03-28',
            actualCompleteTime: '2026-03-27'
          },
          {
            taskId: 't2-2',
            assignLeader: '李秘书长',
            assignContent: '明确绿化迁移时间窗口，报区重大办备案',
            responsibleEntity: '区绿化市容局',
            progress: '迁移窗口拟安排在 4 月上旬',
            expectedCompleteTime: '2026-04-10',
            actualCompleteTime: undefined
          }
        ]
      }
    ],
    createdAt: '2026-03-22 16:00:00',
    updatedAt: '2026-03-22 16:00:00'
  }
];

function cloneProjects(projects: MeetingCoordinationFormPayload['projects']) {
  return projects.map((p) => ({
    projectId: p.projectId,
    projectName: p.projectName,
    tasks: p.tasks.map((t) => ({ ...t }))
  }));
}

export const meetingCoordinationStore = {
  list(params: MeetingCoordinationQuery = {}) {
    let list = [...records];
    const keyword = params.keyword?.trim();
    if (keyword) {
      list = list.filter(
        (r) =>
          r.meetingContent.includes(keyword) ||
          r.coordinationLevel.includes(keyword) ||
          r.meetingTime.includes(keyword) ||
          r.projects.some(
            (p) =>
              p.projectName.includes(keyword) ||
              p.tasks.some((t) => t.assignContent.includes(keyword))
          ) ||
          r.schemeFiles.some((f) => f.name.includes(keyword))
      );
    }
    return list.sort((a, b) => b.meetingTime.localeCompare(a.meetingTime));
  },

  getById(id: string) {
    return records.find((r) => r.id === id) ?? null;
  },

  create(payload: MeetingCoordinationFormPayload) {
    const now = padTime();
    const item: MeetingCoordinationRecord = {
      id: `mc${++idSeq}`,
      meetingContent: payload.meetingContent,
      meetingTime: payload.meetingTime,
      schemeFiles: [...payload.schemeFiles],
      coordinationLevel: payload.coordinationLevel,
      projects: cloneProjects(payload.projects),
      createdAt: now,
      updatedAt: now
    };
    records.unshift(item);
    return item;
  },

  update(id: string, payload: MeetingCoordinationFormPayload) {
    const item = records.find((r) => r.id === id);
    if (!item) return null;
    item.meetingContent = payload.meetingContent;
    item.meetingTime = payload.meetingTime;
    item.schemeFiles = [...payload.schemeFiles];
    item.coordinationLevel = payload.coordinationLevel;
    item.projects = cloneProjects(payload.projects);
    item.updatedAt = padTime();
    return item;
  },

  remove(id: string) {
    const idx = records.findIndex((r) => r.id === id);
    if (idx < 0) return false;
    records.splice(idx, 1);
    return true;
  }
};
