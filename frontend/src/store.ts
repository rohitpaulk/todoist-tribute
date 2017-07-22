import Vuex, { StoreOptions } from 'vuex';
import * as _ from 'lodash';

import { Task, Project } from './models';
import { API } from './API'


interface TuduStoreOptions {
    tasks: Task[],
    projects: Project[],
    activeProject: Project,
}

interface CreateTaskPayload {
    title: string,
    project: Project
}

interface ReorderTasksPayload {
    task_ids: string[],
    project: Project
}

let api = new API('http://localhost:3000/');

let storeOptions = {
    strict: true, // Disable on production?

    state: {
        tasks: [],
        projects: [],
        // TODO: Look into avoiding hardcoding this
        activeProject: {id: '1', name: 'Inbox', colorHex: "000000" }
    },

    getters: {
        tasksForActiveProject: function(state): Task[] {
            return state.tasks.filter(function(task: Task) {
                return task.projectId === state.activeProject.id
            });
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
        }
    },

    mutations: {
        setActiveProject(state, project: Project) {
            state.activeProject = project;
        },

        addTask(state, task: Task) {
            state.tasks.push(task);
        },

        removeTask(state, task: Task) {
            state.tasks = _.filter(state.tasks, (x) => x.id !== task.id);
        },

        setTasks(state, tasks: Task[]) {
            state.tasks = tasks;
        },

        setProjects(state, projects: Project[]) {
            state.projects = projects;
        }
    },
    actions: { // TODO: Return promises?
        createTask(context, payload: CreateTaskPayload) {
            api.createTask(payload.title, payload.project.id).then(function(task: Task) {
                context.commit('addTask', task)
            });
        },

        refreshTasks(context) {
            api.getTasks().then(function(tasks: Task[]) {
                context.commit('setTasks', tasks);
            });
        },

        completeTask(context, task: Task) {
            api.updateTask(task.id, {is_completed: true}).then(function() {
                context.commit('removeTask', task);
            });
        },

        reorderTasks(context, payload: ReorderTasksPayload): Promise<void> {
            return new Promise(function(resolve, reject) {
                api.reorderTasks(payload.project, payload.task_ids).then(function(tasksFromAPI) {
                    context.commit('setTasks', tasksFromAPI);
                    resolve();
                });
            });
        },

        refreshProjects(context) {
            api.getProjects().then(function(projects: Project[]) {
                context.commit('setProjects', projects);
            });
        },
    }
} as StoreOptions<TuduStoreOptions>

export { storeOptions as TuduStoreOptions }
export { ReorderTasksPayload }