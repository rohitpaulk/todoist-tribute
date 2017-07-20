import Vuex, { StoreOptions } from 'vuex';
import * as _ from 'lodash';

import { Task } from './models';
import { API } from './API'


interface TuduStoreOptions {
    tasks: Task[]
}

interface CreateTaskPayload {
    title: string
}

let api = new API('http://localhost:3000/');

let storeOptions = {
    strict: true, // Disable on production?
    state: {
        tasks: []
    },
    mutations: {
        addTask(state, task: Task) {
            state.tasks.push(task);
        },

        removeTask(state, task: Task) {
            state.tasks = _.filter(state.tasks, (x) => x.id !== task.id);
        },

        setTasks(state, tasks: Task[]) {
            state.tasks = tasks;
        }
    },
    actions: { // TODO: Return promises?
        createTask(context, payload: CreateTaskPayload) {
            api.createTask(payload.title).then(function(task: Task) {
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

        reorderTasks(context, task_ids: string[]) {
            api.reorderTasks(task_ids).then(function(tasksFromAPI) {
                context.commit('setTasks', tasksFromAPI);
            });
        }
    }
} as StoreOptions<TuduStoreOptions>

export { storeOptions as TuduStoreOptions }