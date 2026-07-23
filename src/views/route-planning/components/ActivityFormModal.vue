<script setup lang="ts">
import { DeleteOutlined, EyeOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { UploadFile, UploadProps } from 'ant-design-vue';
import { computed, reactive, ref, watch } from 'vue';
import { routePlanningApi } from '@/api/route-planning';
import type {
  ActivityProjectLink,
  LeaderLevel,
  RouteActivityFile,
  RouteActivityKind,
  RouteActivityRecord,
  RouteProjectProblem,
  RouteProjectTask,
  RouteRelateProject
} from '@/types/route-planning';
import { LEADER_LEVEL_LABEL, ROUTE_ACTIVITY_KIND_LABEL } from '@/types/route-planning';
import IssueDetailModal from './IssueDetailModal.vue';

const props = defineProps<{
  open: boolean;
  kind: RouteActivityKind;
  mode: 'create' | 'edit' | 'view';
  record: RouteActivityRecord | null;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  saved: [];
}>();

const submitting = ref(false);
const relateProjects = ref<RouteRelateProject[]>([]);
const schemeFileList = ref<UploadFile[]>([]);
const siteFileList = ref<UploadFile[]>([]);

/** 已确认加入的关联项目（逐个添加） */
const linkedProjects = ref<ActivityProjectLink[]>([]);

const form = reactive({
  activityName: '',
  leaderLevel: undefined as LeaderLevel | undefined,
  visitTime: undefined as string | undefined
});

/** 当前正在填写的单个项目草稿 */
const draft = reactive({
  projectId: undefined as string | undefined,
  situation: '',
  selectedProblemIds: [] as string[],
  selectedTaskIds: [] as string[]
});

const showDraftPanel = ref(false);

const issueDetailOpen = ref(false);
const issueDetailType = ref<'problem' | 'task'>('problem');
const issueDetailItem = ref<RouteProjectProblem | RouteProjectTask | null>(null);
const issueDetailProjectName = ref('');

const isView = computed(() => props.mode === 'view');
const activityNameLabel = computed(() =>
  props.kind === 'saturday' ? '活动主题名称' : '活动名称'
);
const title = computed(() => {
  const name = ROUTE_ACTIVITY_KIND_LABEL[props.kind];
  if (props.mode === 'create') return `新增${name}活动`;
  if (props.mode === 'edit') return `编辑${name}活动`;
  return `查看${name}活动`;
});

const leaderOptions = Object.entries(LEADER_LEVEL_LABEL).map(([value, label]) => ({
  value,
  label
}));

const availableProjectOptions = computed(() => {
  const linkedIds = new Set(linkedProjects.value.map((p) => p.projectId));
  return relateProjects.value
    .filter((p) => !linkedIds.has(p.id) || p.id === draft.projectId)
    .map((p) => ({ value: p.id, label: `${p.projectName}（${p.projectCode}）` }));
});

const draftProject = computed(() =>
  relateProjects.value.find((p) => p.id === draft.projectId) ?? null
);

const beforeUpload: UploadProps['beforeUpload'] = () => false;

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    relateProjects.value = await routePlanningApi.listRelateProjects();
    resetForm();
    if (props.record && props.mode !== 'create') {
      fillForm(props.record);
    } else if (!isView.value) {
      // 新增时默认打开第一个项目填写区
      showDraftPanel.value = true;
    }
  }
);

watch(
  () => draft.projectId,
  () => {
    draft.situation = '';
    draft.selectedProblemIds = [];
    draft.selectedTaskIds = [];
  }
);

function resetForm() {
  form.activityName = '';
  form.leaderLevel = undefined;
  form.visitTime = undefined;
  linkedProjects.value = [];
  schemeFileList.value = [];
  siteFileList.value = [];
  resetDraft();
  showDraftPanel.value = false;
}

function resetDraft() {
  draft.projectId = undefined;
  draft.situation = '';
  draft.selectedProblemIds = [];
  draft.selectedTaskIds = [];
}

function fillForm(record: RouteActivityRecord) {
  form.activityName = record.activityName;
  form.leaderLevel = record.leaderLevel;
  form.visitTime = record.visitTime;
  linkedProjects.value = record.projects.map((p) => ({
    projectId: p.projectId,
    projectName: p.projectName,
    situation: p.situation,
    selectedProblemIds: [...p.selectedProblemIds],
    selectedTaskIds: [...p.selectedTaskIds]
  }));
  schemeFileList.value = record.schemeFiles.map((f, i) => ({
    uid: `scheme-${i}`,
    name: f.name,
    status: 'done',
    size: f.size,
    url: f.url
  }));
  siteFileList.value = (record.siteImages ?? []).map((f, i) => ({
    uid: `site-${i}`,
    name: f.name,
    status: 'done',
    size: f.size,
    url: f.url
  }));
  showDraftPanel.value = false;
}

function getProjectMeta(projectId: string) {
  return relateProjects.value.find((p) => p.id === projectId);
}

function selectedProblems(link: ActivityProjectLink) {
  const meta = getProjectMeta(link.projectId);
  if (!meta) return [];
  return meta.problems.filter((p) => link.selectedProblemIds.includes(p.id));
}

function selectedTasks(link: ActivityProjectLink) {
  const meta = getProjectMeta(link.projectId);
  if (!meta) return [];
  return meta.tasks.filter((t) => link.selectedTaskIds.includes(t.id));
}

function toggleDraftProblem(id: string, checked: boolean) {
  if (checked) {
    if (!draft.selectedProblemIds.includes(id)) draft.selectedProblemIds.push(id);
  } else {
    draft.selectedProblemIds = draft.selectedProblemIds.filter((x) => x !== id);
  }
}

function toggleDraftTask(id: string, checked: boolean) {
  if (checked) {
    if (!draft.selectedTaskIds.includes(id)) draft.selectedTaskIds.push(id);
  } else {
    draft.selectedTaskIds = draft.selectedTaskIds.filter((x) => x !== id);
  }
}

function openIssueDetail(
  type: 'problem' | 'task',
  item: RouteProjectProblem | RouteProjectTask,
  projectName: string
) {
  issueDetailType.value = type;
  issueDetailItem.value = item;
  issueDetailProjectName.value = projectName;
  issueDetailOpen.value = true;
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
  if (!draft.situation.trim()) {
    message.warning('请填写走访项目情况');
    return;
  }

  linkedProjects.value.push({
    projectId: draft.projectId,
    projectName: draftProject.value.projectName,
    situation: draft.situation.trim(),
    selectedProblemIds: [...draft.selectedProblemIds],
    selectedTaskIds: [...draft.selectedTaskIds]
  });

  message.success(`已添加「${draftProject.value.projectName}」`);
  resetDraft();
  showDraftPanel.value = false;
}

function removeLinkedProject(projectId: string) {
  linkedProjects.value = linkedProjects.value.filter((p) => p.projectId !== projectId);
}

function toActivityFiles(list: UploadFile[]): RouteActivityFile[] {
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
  if (!form.activityName.trim()) {
    message.warning(`请填写${activityNameLabel.value}`);
    return;
  }
  if (!schemeFileList.value.length) {
    message.warning('请先上传方案');
    return;
  }
  if (props.kind === 'cityLeader' && !form.leaderLevel) {
    message.warning('请选择领导层级');
    return;
  }
  if (!form.visitTime) {
    message.warning('请填写走访时间');
    return;
  }
  if (!linkedProjects.value.length) {
    message.warning('请至少关联并确认添加一个项目');
    return;
  }
  if (props.kind === 'projectOffice' && !siteFileList.value.length) {
    message.warning('请上传现场图片');
    return;
  }

  const payload = {
    kind: props.kind,
    activityName: form.activityName.trim(),
    schemeFiles: toActivityFiles(schemeFileList.value),
    visitTime: form.visitTime,
    projects: linkedProjects.value.map((p) => ({
      ...p,
      selectedProblemIds: [...p.selectedProblemIds],
      selectedTaskIds: [...p.selectedTaskIds]
    })),
    leaderLevel: props.kind === 'cityLeader' ? form.leaderLevel : undefined,
    siteImages: props.kind === 'projectOffice' ? toActivityFiles(siteFileList.value) : undefined
  };

  submitting.value = true;
  try {
    if (props.mode === 'edit' && props.record) {
      await routePlanningApi.update(props.record.id, payload);
      message.success('活动已更新');
    } else {
      await routePlanningApi.create(payload);
      message.success('活动已新增');
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

    <a-form layout="vertical" class="activity-form">
      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 16px"
        :message="`建议顺序：先填写${activityNameLabel} → 上传方案 → 选择一个关联项目并填完情况/勾选事项 → 确认添加 → 如需再点「添加关联项目」继续下一个`"
      />

      <a-form-item :label="activityNameLabel" required>
        <a-input
          v-model:value="form.activityName"
          :disabled="isView"
          :placeholder="`请输入${activityNameLabel}`"
          allow-clear
          :maxlength="100"
          show-count
        />
      </a-form-item>

      <a-form-item label="上传方案" required>
        <a-upload-dragger
          v-model:file-list="schemeFileList"
          :before-upload="beforeUpload"
          :multiple="true"
          :disabled="isView"
          :max-count="5"
        >
          <p class="ant-upload-drag-icon"><InboxOutlined /></p>
          <p class="ant-upload-text">点击或拖拽上传活动方案</p>
          <p class="ant-upload-hint">支持 pdf / doc / docx，最多 5 个文件</p>
        </a-upload-dragger>
      </a-form-item>

      <a-form-item v-if="kind === 'cityLeader'" label="领导层级" required>
        <a-radio-group v-model:value="form.leaderLevel" :disabled="isView" :options="leaderOptions" />
      </a-form-item>

      <a-form-item label="走访时间" required>
        <a-date-picker
          v-model:value="form.visitTime"
          show-time
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
          :disabled="isView"
          placeholder="请选择走访时间"
        />
      </a-form-item>

      <a-form-item v-if="kind === 'projectOffice'" label="现场图片" required>
        <a-upload
          v-model:file-list="siteFileList"
          list-type="picture-card"
          :before-upload="beforeUpload"
          :disabled="isView"
          accept="image/*"
          :max-count="9"
        >
          <div v-if="siteFileList.length < 9 && !isView">
            <PlusOutlined />
            <div style="margin-top: 8px">上传</div>
          </div>
        </a-upload>
      </a-form-item>

      <div class="linked-section">
        <div class="linked-section__head">
          <span class="linked-section__title">关联项目（{{ linkedProjects.length }}）</span>
          <a-button
            v-if="!isView"
            type="dashed"
            size="small"
            :disabled="showDraftPanel || !availableProjectOptions.length"
            @click="openDraftPanel"
          >
            <PlusOutlined /> 添加关联项目
          </a-button>
        </div>

        <div v-if="!linkedProjects.length && !showDraftPanel" class="empty-tip">
          暂无关联项目，请点击「添加关联项目」逐个添加
        </div>

        <div v-for="(link, index) in linkedProjects" :key="link.projectId" class="project-block project-block--done">
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
          <div class="project-block__row">
            <span class="project-block__label">走访情况</span>
            <span>{{ link.situation }}</span>
          </div>
          <div class="project-block__section">
            <div class="project-block__label">难题事项</div>
            <div v-if="!selectedProblems(link).length" class="empty-tip">未勾选</div>
            <div
              v-for="item in selectedProblems(link)"
              :key="item.id"
              class="issue-card issue-card--readonly"
            >
              <div class="issue-card__main">
                <div class="issue-card__grid">
                  <div><em>责任单位</em><span>{{ item.responsibleUnit }}</span></div>
                  <div><em>指派单位</em><span>{{ item.assignUnit }}</span></div>
                  <div class="issue-card__full"><em>协调内容</em><span>{{ item.coordinateContent }}</span></div>
                </div>
                <a-button
                  v-if="isView"
                  type="link"
                  size="small"
                  class="issue-card__action"
                  @click="openIssueDetail('problem', item, link.projectName)"
                >
                  <EyeOutlined /> 查看
                </a-button>
              </div>
            </div>
          </div>
          <div class="project-block__section">
            <div class="project-block__label">交办事项</div>
            <div v-if="!selectedTasks(link).length" class="empty-tip">未勾选</div>
            <div
              v-for="item in selectedTasks(link)"
              :key="item.id"
              class="issue-card issue-card--readonly"
            >
              <div class="issue-card__main">
                <div class="issue-card__grid">
                  <div><em>交办领导</em><span>{{ item.assignLeader }}</span></div>
                  <div><em>责任主体</em><span>{{ item.responsibleEntity }}</span></div>
                  <div class="issue-card__full"><em>交办内容</em><span>{{ item.assignContent }}</span></div>
                </div>
                <a-button
                  v-if="isView"
                  type="link"
                  size="small"
                  class="issue-card__action"
                  @click="openIssueDetail('task', item, link.projectName)"
                >
                  <EyeOutlined /> 查看
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 当前正在填写的一个项目 -->
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
            <a-form-item label="走访项目情况" required>
              <a-textarea
                v-model:value="draft.situation"
                :rows="3"
                placeholder="请填写该项目本次走访情况"
              />
            </a-form-item>

            <a-form-item label="难题事项（勾选本次关联）">
              <div v-if="!draftProject.problems.length" class="empty-tip">该项目暂无难题事项</div>
              <div
                v-for="item in draftProject.problems"
                :key="item.id"
                class="issue-card"
                :class="{ 'issue-card--checked': draft.selectedProblemIds.includes(item.id) }"
                @click="toggleDraftProblem(item.id, !draft.selectedProblemIds.includes(item.id))"
              >
                <a-checkbox
                  :checked="draft.selectedProblemIds.includes(item.id)"
                  @click.stop
                  @change="(e: any) => toggleDraftProblem(item.id, e.target.checked)"
                />
                <div class="issue-card__grid">
                  <div><em>责任单位</em><span>{{ item.responsibleUnit }}</span></div>
                  <div><em>指派单位</em><span>{{ item.assignUnit }}</span></div>
                  <div class="issue-card__full"><em>协调内容</em><span>{{ item.coordinateContent }}</span></div>
                </div>
              </div>
            </a-form-item>

            <a-form-item label="交办事项（勾选本次关联）">
              <div v-if="!draftProject.tasks.length" class="empty-tip">该项目暂无交办事项</div>
              <div
                v-for="item in draftProject.tasks"
                :key="item.id"
                class="issue-card"
                :class="{ 'issue-card--checked': draft.selectedTaskIds.includes(item.id) }"
                @click="toggleDraftTask(item.id, !draft.selectedTaskIds.includes(item.id))"
              >
                <a-checkbox
                  :checked="draft.selectedTaskIds.includes(item.id)"
                  @click.stop
                  @change="(e: any) => toggleDraftTask(item.id, e.target.checked)"
                />
                <div class="issue-card__grid">
                  <div><em>交办领导</em><span>{{ item.assignLeader }}</span></div>
                  <div><em>责任主体</em><span>{{ item.responsibleEntity }}</span></div>
                  <div class="issue-card__full"><em>交办内容</em><span>{{ item.assignContent }}</span></div>
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

  <IssueDetailModal
    v-model:open="issueDetailOpen"
    :issue-type="issueDetailType"
    :issue="issueDetailItem"
    :project-name="issueDetailProjectName"
  />
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

.project-block__row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
  margin-top: 4px;
}

.project-block__section {
  margin-top: 10px;
}

.project-block__label {
  color: var(--color-text-secondary, #8c8c8c);
  flex-shrink: 0;
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
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.issue-card:hover {
  border-color: #9db4f8;
}

.issue-card--checked {
  border-color: var(--color-primary);
  background: #f5f8ff;
}

.issue-card--readonly {
  cursor: default;
  padding-left: 12px;
}

.issue-card__main {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.issue-card__action {
  flex-shrink: 0;
  padding-inline: 4px;
}

.issue-card__grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
  font-size: 13px;
  line-height: 1.5;
  min-width: 0;
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
