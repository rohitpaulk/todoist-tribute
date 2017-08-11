import Vuex, { StoreOptions } from 'vuex';
import * as _ from 'lodash';

import { Label, Project, Task } from './models';
import { API } from './API'
import { AutocompleteDefinition } from './helpers/autocomplete';

type ScopeType = "project" | "label"

interface Scope {
    type: ScopeType
    resource: Project | Label
}

interface ScopeId {
    type: ScopeType
    resourceId: string
}

interface TuduStoreOptions {
    tasks: Task[]
    projects: Project[]
    labels: Label[]

    // 'ScopeId' is what the user has currently filtered tasks by. This could be
    // a project, label, filter etc.
    //
    // Callers use the `activeScope` getter to get a hydrated resource rather
    // than just an ID.
    activeScopeId: ScopeId

    // URL of the backend API. This is injected by the application.
    // TODO: Convert this to an API object instead?
    apiUrl: string
}

interface CreateTaskPayload {
    title: string
    projectId: string
    labelIds: string[]
}

interface UpdateTaskPayload extends CreateTaskPayload {
    id: string
}

interface ReorderTasksPayload {
    task_ids: string[], // TODO: Change this to camelCase
    project: Project
}

interface CreateProjectPayload {
    name: string
    colorHex: string
}

interface UpdateProjectPayload extends CreateProjectPayload {
    id: string
}

// Both have the same interface for now, change when needed.
type CreateLabelPayload = CreateProjectPayload;
type UpdateLabelPayload = UpdateProjectPayload;

const CHAR_CODE_POUND_SIGN = 35;
const CHAR_CODE_AT_SIGN = 64;

function filterTasksByScopeId(tasks: Task[], scopeId: ScopeId): Task[] {
    if (scopeId.type === 'project') {
        return tasks.filter(function(task: Task) {
            return task.projectId === scopeId.resourceId;
        });
    } else {
        return tasks.filter(function(task: Task) {
            return _.includes(task.labelIds, scopeId.resourceId);
        });
    }
}

let storeOptions = {
    strict: true, // Disable on production?

    state: {
        tasks: [],
        projects: [
            // TODO: Look into avoiding hardcoding this
            {name: "Inbox", id: "1", sortOrder: 1, colorHex: "000000"}
        ],
        labels: [],
        activeScopeId: {
            type:'project',
            resourceId: '1'
        },
        apiUrl: '' // Filled by the application
    },

    getters: {
        autocompleteDefinitions: function(state): AutocompleteDefinition[] {
            return [
                {
                    type: "project",
                    triggerCharCode: CHAR_CODE_POUND_SIGN,
                    suggestions: state.projects
                },
                {
                    type: "label",
                    triggerCharCode: CHAR_CODE_AT_SIGN,
                    suggestions: state.labels
                }
            ];
        },

        tasksForActiveScope: function(state): Task[] {
            return filterTasksByScopeId(state.tasks, state.activeScopeId);
        },

        activeScopeName: function(state, getters): string {
            return getters.activeScope.resource.name;
        },

        activeScope: function(state, getters): Scope {
            if (state.activeScopeId.type === 'project') {
                return {
                    type: 'project',
                    resource: getters.projectFromId(state.activeScopeId.resourceId)
                }
            } else if (state.activeScopeId.type === 'label') {
                return {
                    type: 'label',
                    resource: getters.labelFromId(state.activeScopeId.resourceId)
                }
            } else {
                // TODO: Check this
                throw "Typescript doesn't catch this?";
            }
        },

        // Move active* to individual components?

        activeProject: function(state, getters): Project | null {
            if (state.activeScopeId.type === 'project') {
                return getters.activeScope.resource;
            } else {
                return null;
            }
        },

        activeProjectId: function(state): string | null {
            if (state.activeScopeId.type === 'project') {
                return state.activeScopeId.resourceId;
            } else {
                return null;
            }
        },

        activeLabel: function(state, getters): Label | null {
            if (state.activeScopeId.type === 'label') {
                return getters.activeScope.resource;
            } else {
                return null;
            }
        },

        inboxProject: function(state): Project | undefined {
            return state.projects.find((x) => x.id === '1')!;
        },

        inboxProjectTaskCount: function(state, getters): number {
            if (getters.inboxProject === undefined) {
                return 0;
            }

            return state.tasks.filter(function(task: Task) {
                return task.projectId === getters.inboxProject.id
            }).length;
        },

        projectsWithoutInbox: function(state): Project[] {
            return state.projects.filter(function(project: Project) {
                return project.id !== '1'; // TODO: use is_inbox instead
            });
        },

        // TODO: Either move to backend or decorate the project with counts?
        projectTaskCounts: function(state): {[key: string]: number} {
            // TODO: A more functional way?
            let result = {};

            _.forEach(state.projects, function(project: Project) {
                result[project.id] = _.filter(state.tasks, function(task: Task) {
                    return task.projectId === project.id;
                }).length;
            })

            return result;
        },

        labelTaskCounts: function(state): {[key: string]: number} {
            // TODO: A more functional way?
            let result = {};

            _.forEach(state.labels, function(label: Label) {
                result[label.id] = _.filter(state.tasks, function(task: Task) {
                    return _.includes(task.labelIds, label.id)
                }).length;
            });

            return result;
        },

        labelsFromIds(state): (idList: string[]) => Label[] {
            return function(idList: string[]) {
                return state.labels.filter((x) => _.includes(idList, x.id));
            };
        },

        labelFromId(state): (string) => Label {
            return function(id: string) {
                return state.labels.find((x) => x.id === id)!;
            };
        },

        projectFromId(state): (string) => Project {
            return function(id: string) {
                return state.projects.find((x) => x.id === id)!;
            };
        },

        api: function(state): API {
            return new API(state.apiUrl);
        }
    },

    mutations: {
        setActiveScope(state, scope: Scope) {
            state.activeScopeId = {type: scope.type, resourceId: scope.resource.id};
        },

        resetActiveScope(state) {
            state.activeScopeId = {type: 'project', resourceId: '1'};
        },

        setTasks(state, tasks: Task[]) {
            state.tasks = tasks;
        },

        addTask(state, task: Task) {
            state.tasks.push(task);
        },

        removeTask(state, task: Task) {
            state.tasks = _.filter(state.tasks, (x) => x.id !== task.id);
        },

        updateTask(state, task: Task) {
            let index = _.findIndex(state.tasks, (x: Task) => (x.id === task.id));
            let newTasks = state.tasks.slice();
            newTasks[index] = task;
            state.tasks = newTasks;
        },

        setProjects(state, projects: Project[]) {
            state.projects = projects;
        },

        addProject(state, project: Project) {
            state.projects.push(project)
        },

        updateProject(state, project: Project) {
            let index = _.findIndex(state.projects, (x: Project) => (x.id === project.id));
            let newProjects = state.projects.slice();
            newProjects[index] = project;
            state.projects = newProjects;
        },

        removeProject(state, id: string) {
            state.projects = _.filter(state.projects, (x) => x.id !== id);
        },

        setLabels(state, labels: Label[]) {
            state.labels = labels;
        },

        addLabel(state, label: Label) {
            state.labels.push(label)
        },

        updateLabel(state, label: Label) {
            let index = _.findIndex(state.labels, (x: Label) => (x.id === label.id));
            let newLabels = state.labels.slice();
            newLabels[index] = label;
            state.labels = newLabels;
        },

        removeLabel(state, id: string) {
            state.labels = _.filter(state.labels, (x) => x.id !== id);
        },
    },
    actions: { // TODO: Return promises?
        refreshTasks({commit, getters}) {
            getters.api.getTasks().then(function(tasks: Task[]) {
                commit('setTasks', tasks);
            });
        },

        createTask({commit, getters}, payload: CreateTaskPayload) {
            getters.api.createTask(payload.title, payload.projectId, payload.labelIds).then(function(task: Task) {
                commit('addTask', task)
            });
        },

        updateTask({commit, getters}, payload: UpdateTaskPayload) {
            let id = payload.id;
            delete payload.id;

            let apiPayload = {
                title: payload.title,
                project_id: payload.projectId,
                label_ids: payload.labelIds
            };

            getters.api.updateTask(id, apiPayload).then(function(task: Task) {
                commit('updateTask', task);
            });
        },

        completeTask({commit, getters}, task: Task) {
            getters.api.updateTask(task.id, {is_completed: true}).then(function() {
                commit('removeTask', task);
            });
        },

        reorderTasks({commit, getters}, payload: ReorderTasksPayload): Promise<void> {
            return new Promise(function(resolve, reject) {
                getters.api.reorderTasks(payload.project, payload.task_ids).then(function(tasksFromAPI) {
                    commit('setTasks', tasksFromAPI);
                    resolve();
                });
            });
        },

        refreshProjects({commit, getters}) {
            getters.api.getProjects().then(function(projects: Project[]) {
                commit('setProjects', projects);
            });
        },

        createProject({commit, getters}, payload: CreateProjectPayload) {
            getters.api.createProject(payload.name, payload.colorHex).then(function(project: Project) {
                commit('addProject', project);
            });
        },

        updateProject({commit, getters}, payload: UpdateProjectPayload) {
            getters.api.updateProject(payload.id, payload.name, payload.colorHex).then(function(project: Project) {
                commit('updateProject', project);
            });
        },

        reorderProjects({commit, getters}, project_ids: string[]): Promise<void> {
            return new Promise(function(resolve, reject) {
                getters.api.reorderProjects(project_ids).then(function(projectsFromAPI) {
                    commit('setProjects', projectsFromAPI);
                    resolve();
                });
            });
        },

        deleteProject({state, commit, getters}, id: string) {
            getters.api.deleteProject(id).then(function() {
                if (state.activeScopeId.type === 'project' && state.activeScopeId.resourceId === id) {
                    commit('resetActiveScope');
                }

                commit('removeProject', id);
            });
            // TODO: Refresh tasks too? Could contain null references
        },

        refreshLabels({commit, getters}) {
            getters.api.getLabels().then(function(labels: Label[]) {
                commit('setLabels', labels);
            });
        },

        createLabel({commit, getters}, payload: CreateLabelPayload) {
            getters.api.createLabel(payload.name, payload.colorHex).then(function(label: Label) {
                commit('addLabel', label);
            });
        },

        updateLabel({commit, getters}, payload: UpdateLabelPayload) {
            getters.api.updateLabel(payload.id, payload.name, payload.colorHex).then(function(label: Label) {
                commit('updateLabel', label);
            });
        },

        reorderLabels({commit, getters}, label_ids: string[]): Promise<void> {
            return new Promise(function(resolve, reject) {
                getters.api.reorderLabels(label_ids).then(function(labelsFromAPI) {
                    commit('setLabels', labelsFromAPI);
                    resolve();
                });
            });
        },

        deleteLabel({state, commit, getters}, id: string) {
            getters.api.deleteLabel(id).then(function() {
                if (state.activeScopeId.type === 'label' && state.activeScopeId.resourceId === id) {
                    commit('resetActiveScope');
                }

                commit('removeLabel', id);
            });
        },
    }
} as StoreOptions<TuduStoreOptions>

export { storeOptions as TuduStoreOptions }
export { CreateTaskPayload, UpdateTaskPayload, ReorderTasksPayload }
export { CreateProjectPayload, UpdateProjectPayload }
export { CreateLabelPayload, UpdateLabelPayload }
export { Scope, ScopeType }