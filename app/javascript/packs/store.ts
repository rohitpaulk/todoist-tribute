import Vuex, { StoreOptions } from 'vuex';
import * as _ from 'lodash';

import { Label, Project, Task } from './models';
import { API } from './API'

interface Scope {
    type: "project" | "label"
    resource: Project | Label
}

interface TuduStoreOptions {
    tasks: Task[]
    projects: Project[]

    // 'Scope' is what the user has currently filtered tasks by. This could be
    // a project, label, filter etc.
    activeScope: Scope

    // URL of the backend API. This is injected by the application.
    // TODO: Convert this to an API object instead?
    apiUrl: string
}

interface CreateTaskPayload {
    title: string
    project: Project
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

function filterTasksByScope(tasks: Task[], scope: Scope): Task[] {
    if (scope.type === 'project') {
        return tasks.filter(function(task: Task) {
            return task.projectId === scope.resource.id;
        });
    } else {
        throw "Labels not implemented yet!";
    }
}

let storeOptions = {
    strict: true, // Disable on production?

    state: {
        tasks: [],
        projects: [],
        // TODO: Look into avoiding hardcoding this
        activeScope: {
            type:'project',
            resource: {id: '1', name: 'Inbox', colorHex: "000000", sortOrder: 1 }
        },
        apiUrl: '' // Filled by the application
    },

    getters: {
        tasksForActiveScope: function(state): Task[] {
            return filterTasksByScope(state.tasks, state.activeScope);
        },

        activeProject: function(state): Project | null {
            if (state.activeScope.type === 'project') {
                return state.activeScope.resource;
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

        api: function(state): API {
            return new API(state.apiUrl);
        }
    },

    mutations: {
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

        setActiveProject(state, project: Project) {
            state.activeScope = {type: "project", resource: project};
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
    },
    actions: { // TODO: Return promises?
        refreshTasks({commit, getters}) {
            getters.api.getTasks().then(function(tasks: Task[]) {
                commit('setTasks', tasks);
            });
        },

        createTask({commit, getters}, payload: CreateTaskPayload) {
            getters.api.createTask(payload.title, payload.project.id).then(function(task: Task) {
                commit('addTask', task)
            });
        },

        updateTask({commit, getters}, payload: UpdateTaskPayload) {
            let id = payload.id;
            delete payload.id;

            let apiPayload = {
                title: payload.title,
                project_id: payload.project.id
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

        deleteProject({commit, getters}, id: string) {
            getters.api.deleteProject(id).then(function() {
                commit('removeProject', id);
            });
        },
    }
} as StoreOptions<TuduStoreOptions>

export { storeOptions as TuduStoreOptions }
export { CreateTaskPayload, UpdateTaskPayload, ReorderTasksPayload }
export { CreateProjectPayload, UpdateProjectPayload }