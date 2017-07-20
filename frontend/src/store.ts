import { Task } from './models';
import * as $ from 'jquery';
import axios from 'axios';

class Store {
    url: string

    constructor(url: string) {
        this.url = url;
    }

    static error() {
        console.log(arguments);
        alert('Error contacting backend! Check console.');
    }

    getTasks(): Promise<Task[]> {
        let url = this.url + "api/v1/tasks.json";
        let axiosPromise = axios.get(url);

        return Store.PromiseForMultipleTasks(axiosPromise);
    }

    createTask(title: string): Promise<Task> {
        let url = this.url + "api/v1/tasks.json";
        let axiosPromise = axios.post(url, {
            title: title
        });

        return Store.PromiseForSingleTask(axiosPromise);
    }

    updateTask(id: string, properties: {[ key: string]: any}): Promise<Task> {
        let url = this.url + "api/v1/tasks/" + id + ".json";
        let axiosPromise = axios.put(url, properties);

        return Store.PromiseForSingleTask(axiosPromise);
    }

    reorderTasks(tasks: Task[]): Promise<Task[]> {
        let url = this.url + "api/v1/tasks/reorder.json";
        let axiosPromise = axios.post(url, {task_ids: tasks.map(x => Number(x.id))});

        return Store.PromiseForMultipleTasks(axiosPromise);
    }

    static PromiseForMultipleTasks(axiosPromise): Promise<Task[]> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(axiosResponse.data.map(Store.TaskFromAPI));
            };

            axiosPromise.then(resolver, Store.error);
        })
    }

    static PromiseForSingleTask(axiosPromise): Promise<Task> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(Store.TaskFromAPI(axiosResponse.data));
            };

            axiosPromise.then(resolver, Store.error);
        })
    }

    static TaskFromAPI(data: {[key: string]: any}): Task {
        return {
            title: data.title,
            id: String(data.id), // TODO: Make API return string
            sortOrder: data.sort_order
        };
    }
}

export { Store };