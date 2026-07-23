<script setup lang="ts">
import { DeleteOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message, Upload } from 'ant-design-vue';
import type { UploadFile, UploadProps } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { meetingCoordinationApi } from '@/api/meeting-coordination';
import { routePlanningApi } from '@/api/route-planning';
import type {
  MeetingCoordinationRecord,
  MeetingProjectLink,
  MeetingSchemeFile,
  MeetingTaskItem
} from '@/types/meeting-coordination';
import type { RouteProjectTask, RouteRelateProject } from '@/types/route-planning';

const props = defineProps<{
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  record: MeetingCoordinationRecord | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const relateProjects = ref<RouteRelateProject[]>([]);
const schemeFileList = ref<UploadFile[]>([]);
const linkedProjects = ref<MeetingProjectLink[]>([]);
const showDraftPanel = ref(false);

const form = reactive({
  meetingContent: '',
  meetingTime: undefined as string | undefined,
  coordinationLevel: ''
});

/** 当前草稿：选中的交办事项（含进展字段） */
const draft = reactive({
  projectId: undefined as string | undefined,
  tasks: {} as Record<string, MeetingTaskItem>
});

const isView = computed(() => props.mode === 'view');
/** 目前进展 / 完成时间仅在编辑、查看时展示，新增时不填 */
const showTaskProgress = computed(() => props.mode === 'edit' || props.mode === 'view');
const title = computed(() => {
  if (props.mode === 'create') return '新增会议协调事项';
  if (props.mode === 'edit') return '编辑会议协调事项';
  return '查看会议协调事项';
});

const availableProjectOptions = computed(() => {
  const linkedIds = new Set(linkedProjects.value.map((p) => p.projectId));
  return relateProjects.value
    .filter((p) => !linkedIds.has(p.id) || p.id === draft.projectId)
    .map((p) => ({ value: p.id, label: `${p.projectName}（${p.projectCode}）` }));
});

const draftProject = computed(() =>
  relateProjects.value.find((p) => p.id === draft.projectId) ?? null
);

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const ok = /\.(pdf|doc|docx)$/i.test(file.name);
  if (!ok) {
    message.error('方案仅支持上传 pdf / doc / docx 文件');
    return Upload.LIST_IGNORE;
  }
  return false;
};

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    relateProjects.value = await routePlanningApi.listRelateProjects();
    resetForm();
    if (props.record && props.mode !== 'create') {
      fillForm(props.record);
    } else if (!isView.value) {
      showDraftPanel.value = true;
    }
  }
);

watch(
  () => draft.projectId,
  () => {
    draft.tasks = {};
  }
);

function resetForm() {
  form.meetingContent = '';
  form.meetingTime = undefined;
  form.coordinationLevel = '';
  linkedProjects.value = [];
  schemeFileList.value = [];
  resetDraft();
  showDraftPanel.value = false;
}

function resetDraft() {
  draft.projectId = undefined;
  draft.tasks = {};
}

function fillForm(record: MeetingCoordinationRecord) {
  form.meetingContent = record.meetingContent;
  form.meetingTime = record.meetingTime;
  form.coordinationLevel = record.coordinationLevel;
  linkedProjects.value = record.projects.map((p) => ({
    projectId: p.projectId,
    projectName: p.projectName,
    tasks: p.tasks.map((t) => ({ ...t }))
  }));
  schemeFileList.value = record.schemeFiles.map((f, i) => ({
    uid: `scheme-${i}`,
    name: f.name,
    status: 'done',
    size: f.size,
    url: f.url
  }));
  showDraftPanel.value = false;
}

function isTaskChecked(taskId: string) {
  return Boolean(draft.tasks[taskId]);
}

function toggleDraftTask(task: RouteProjectTask, checked: boolean) {
  if (checked) {
    draft.tasks[task.id] = {
      taskId: task.id,
      assignLeader: task.assignLeader,
      assignContent: task.assignContent,
      responsibleEntity: task.responsibleEntity,
      progress: '',
      expectedCompleteTime: undefined,
      actualCompleteTime: undefined
    };
  } else {
    const next = { ...draft.tasks };
    delete next[task.id];
    draft.tasks = next;
  }
}

function openDraftPanel() {
  if (isView.value) return;
  if (showDraftPanel.value) {
    message.info('请先完成当前项目的填写并确认添加');
    return;
  }
  if (!availableProjectOptions.value.length) {
    message.warning('没有可继续关联的项目');
    return;
  }
  resetDraft();
  showDraftPanel.value = true;
}

function cancelDraft() {
  resetDraft();
  showDraftPanel.value = false;
}

function confirmAddProject() {
  if (!draft.projectId || !draftProject.value) {
    message.warning('请先选择一个关联项目');
    return;
  }
  const selected = Object.values(draft.tasks);
  if (!selected.length) {
    message.warning('请至少勾选一个交办事项');
    return;
  }

  linkedProjects.value.push({
    projectId: draft.projectId,
    projectName: draftProject.value.projectName,
    tasks: selected.map((t) => ({ ...t }))
  });

  message.success(`已添加「${draftProject.value.projectName}」`);
  resetDraft();
  showDraftPanel.value = false;
}

function removeLinkedProject(projectId: string) {
  linkedProjects.value = linkedProjects.value.filter((p) => p.projectId !== projectId);
}

function toSchemeFiles(list: UploadFile[]): MeetingSchemeFile[] {
  return list.map((file) => ({
    name: file.name,
    size: file.size ?? 0,
    url: file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj as File) : undefined)
  }));
}

function close() {
  emit('update:open', false);
}

async function handleSubmit() {
  if (isView.value) {
    close();
    return;
  }
  if (showDraftPanel.value) {
    message.warning('请先确认添加当前正在填写的项目，或取消填写后再保存');
    return;
  }
  if (!form.meetingContent.trim()) {
    message.warning('请填写会议内容');
    return;
  }
  if (!form.meetingTime) {
    message.warning('请选择会议时间');
    return;
  }
  if (!schemeFileList.value.length) {
    message.warning('请上传方案');
    return;
  }
  if (!form.coordinationLevel.trim()) {
    message.warning('请填写协调层级');
    return;
  }
  if (!linkedProjects.value.length) {
    message.warning('请至少关联并确认添加一个项目');
    return;
  }

  const payload = {
    meetingContent: form.meetingContent.trim(),
    meetingTime: form.meetingTime,
    schemeFiles: toSchemeFiles(schemeFileList.value),
    coordinationLevel: form.coordinationLevel.trim(),
    projects: linkedProjects.value.map((p) => ({
      projectId: p.projectId,
      projectName: p.projectName,
      tasks: p.tasks.map((t) => ({ ...t }))
    }))
  };

  submitting.value = true;
  try {
    if (props.mode === 'edit' && props.record) {
      await meetingCoordinationApi.update(props.record.id, payload);
      message.success('会议协调事项已更新');
    } else {
      await meetingCoordinationApi.create(payload);
      message.success('会议协调事项已新增');
    }
    emit('saved');
    close();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <a-modal
    :open="open"
    :title="title"
    :width="860"
    destroy-on-close
    :confirm-loading="submitting"
    :ok-text="isView ? '关闭' : '保存'"
    @ok="handleSubmit"
    @cancel="close"
  >
    <template v-if="isView" #footer>
      <a-button type="primary" @click="close">关闭</a-button>
    </template>

    <a-form layout="vertical" class="meeting-form">
      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 16px"
        message="关联项目请逐个添加：选一个项目 → 勾选交办事项 → 确认添加 → 再添加下一个。目前进展与完成时间请在编辑时填写。"
      />

      <a-form-item label="会议内容" required>
        <a-input
          v-model:value="form.meetingContent"
          :disabled="isView"
          placeholder="请输入会议内容"
          allow-clear
          :maxlength="100"
          show-count
        />
      </a-form-item>

      <a-form-item label="会议时间" required>
        <a-date-picker
          v-model:value="form.meetingTime"
          show-time
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
          :disabled="isView"
          placeholder="请选择会议时间"
        />
      </a-form-item>

      <a-form-item label="方案（上传文件）" required>
        <a-upload-dragger
          v-model:file-list="schemeFileList"
          :before-upload="beforeUpload"
          :multiple="true"
          :disabled="isView"
          :max-count="5"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        >
          <p class="ant-upload-drag-icon"><InboxOutlined /></p>
          <p class="ant-upload-text">点击或拖拽上传会议方案文件</p>
          <p class="ant-upload-hint">仅支持 pdf / doc / docx 文件，最多 5 个</p>
        </a-upload-dragger>
      </a-form-item>

      <a-form-item label="协调层级" required>
        <a-input
          v-model:value="form.coordinationLevel"
          :disabled="isView"
          placeholder="请自行填写，如：区级专题协调、街镇级协调"
          allow-clear
          :maxlength="50"
        />
      </a-form-item>

      <div class="linked-section">
        <div class="linked-section__head">
          <span class="linked-section__title">关联项目与交办事项</span>
          <a-button v-if="!isView" type="dashed" size="small" @click="openDraftPanel">
            <template #icon><PlusOutlined /></template>
            添加关联项目
          </a-button>
        </div>

        <div v-if="!linkedProjects.length && !showDraftPanel" class="empty-tip">
          暂无关联项目，请点击「添加关联项目」逐个添加
        </div>

        <div
          v-for="(link, index) in linkedProjects"
          :key="link.projectId"
          class="project-block project-block--done"
        >
          <div class="project-block__head">
            <div class="project-block__title">
              <span class="project-block__index">{{ index + 1 }}</span>
              {{ link.projectName }}
            </div>
            <a-button
              v-if="!isView"
              type="link"
              danger
              size="small"
              @click="removeLinkedProject(link.projectId)"
            >
              <DeleteOutlined /> 移除
            </a-button>
          </div>
          <div class="project-block__section">
            <div class="project-block__label">
              {{ showTaskProgress ? '已勾选交办事项（每项进展与完成时间各自独立）' : '已勾选交办事项' }}
            </div>
            <div
              v-for="(item, taskIndex) in link.tasks"
              :key="item.taskId"
              class="issue-card issue-card--readonly"
            >
              <div class="issue-card__badge">事项 {{ taskIndex + 1 }}</div>
              <div class="issue-card__grid">
                <div><em>交办领导</em><span>{{ item.assignLeader }}</span></div>
                <div><em>责任主体</em><span>{{ item.responsibleEntity }}</span></div>
                <div class="issue-card__full"><em>交办内容</em><span>{{ item.assignContent }}</span></div>
              </div>
              <template v-if="showTaskProgress">
                <div v-if="isView" class="task-extra task-extra--readonly">
                  <div class="issue-card__grid">
                    <div class="issue-card__full"><em>目前进展</em><span>{{ item.progress || '—' }}</span></div>
                    <div><em>预计完成</em><span>{{ item.expectedCompleteTime || '—' }}</span></div>
                    <div><em>实际完成</em><span>{{ item.actualCompleteTime || '—' }}</span></div>
                  </div>
                </div>
                <div v-else class="task-extra" @click.stop>
                  <a-form-item :label="`事项${taskIndex + 1} · 目前进展`" class="task-extra__item">
                    <a-textarea
                      v-model:value="item.progress"
                      :rows="2"
                      placeholder="请填写该事项的目前进展"
                    />
                  </a-form-item>
                  <div class="task-extra__row">
                    <a-form-item :label="`事项${taskIndex + 1} · 预计完成时间`" class="task-extra__item">
                      <a-date-picker
                        v-model:value="item.expectedCompleteTime"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                        placeholder="该事项预计完成时间"
                      />
                    </a-form-item>
                    <a-form-item :label="`事项${taskIndex + 1} · 实际完成时间`" class="task-extra__item">
                      <a-date-picker
                        v-model:value="item.actualCompleteTime"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                        placeholder="该事项实际完成时间"
                      />
                    </a-form-item>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div v-if="showDraftPanel && !isView" class="project-block project-block--draft">
          <div class="project-block__title">正在添加第 {{ linkedProjects.length + 1 }} 个项目</div>

          <a-form-item label="选择项目" required>
            <a-select
              v-model:value="draft.projectId"
              placeholder="请选择一个项目"
              :options="availableProjectOptions"
              style="width: 100%"
              allow-clear
              show-search
              option-filter-prop="label"
            />
          </a-form-item>

          <template v-if="draftProject">
            <a-form-item label="交办事项（勾选本次关联）">
              <div v-if="!draftProject.tasks.length" class="empty-tip">该项目暂无交办事项</div>
              <div
                v-for="item in draftProject.tasks"
                :key="item.id"
                class="issue-card"
                :class="{ 'issue-card--checked': isTaskChecked(item.id) }"
              >
                <a-checkbox
                  :checked="isTaskChecked(item.id)"
                  @change="(e: any) => toggleDraftTask(item, e.target.checked)"
                />
                <div class="issue-card__body">
                  <div class="issue-card__grid" @click="toggleDraftTask(item, !isTaskChecked(item.id))">
                    <div><em>交办领导</em><span>{{ item.assignLeader }}</span></div>
                    <div><em>责任主体</em><span>{{ item.responsibleEntity }}</span></div>
                    <div class="issue-card__full"><em>交办内容</em><span>{{ item.assignContent }}</span></div>
                  </div>
                </div>
              </div>
            </a-form-item>
          </template>

          <div class="draft-actions">
            <a-button @click="cancelDraft">取消</a-button>
            <a-button type="primary" @click="confirmAddProject">确认添加该项目</a-button>
          </div>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<style scoped>
.linked-section {
  margin-top: 8px;
}

.linked-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.linked-section__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #1f1f1f);
}

.project-block {
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid var(--color-border-secondary, #e8e8e8);
  border-radius: 6px;
  background: #fafafa;
}

.project-block--done {
  background: #fff;
}

.project-block--draft {
  border-color: var(--color-primary);
  background: #f7faff;
}

.project-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.project-block__title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-block__head .project-block__title {
  margin-bottom: 0;
}

.project-block__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 12px;
}

.project-block__section {
  margin-top: 10px;
}

.project-block__label {
  color: var(--color-text-secondary, #8c8c8c);
  font-size: 13px;
  margin-bottom: 6px;
}

.issue-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--color-border-secondary, #e8e8e8);
  border-radius: 6px;
  background: #fff;
  transition: border-color 0.2s, background 0.2s;
}

.issue-card--checked {
  border-color: var(--color-primary);
  background: #f5f8ff;
}

.issue-card--readonly {
  cursor: default;
  flex-direction: column;
  gap: 8px;
}

.issue-card__badge {
  align-self: flex-start;
  padding: 0 8px;
  height: 22px;
  line-height: 22px;
  border-radius: 4px;
  background: #eef2ff;
  color: var(--color-primary, #2f54eb);
  font-size: 12px;
  font-weight: 600;
}

.issue-card__body {
  flex: 1;
  min-width: 0;
}

.issue-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}

.issue-card--readonly .issue-card__grid {
  cursor: default;
}

.issue-card__grid em {
  display: inline-block;
  min-width: 64px;
  margin-right: 6px;
  font-style: normal;
  color: var(--color-text-secondary, #8c8c8c);
}

.issue-card__grid span {
  color: var(--color-text-primary, #1f1f1f);
  word-break: break-word;
}

.issue-card__full {
  grid-column: 1 / -1;
}

.task-extra {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-border-secondary, #e8e8e8);
  width: 100%;
}

.task-extra--readonly {
  margin-top: 0;
}

.task-extra__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.task-extra__item {
  margin-bottom: 8px;
}

.draft-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.empty-tip {
  font-size: 12px;
  color: var(--color-text-tertiary, #8c8c8c);
}
</style>
