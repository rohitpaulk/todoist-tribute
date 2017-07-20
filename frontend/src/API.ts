import { Task } from './models';
import * as $ from 'jquery';
import axios from 'axios';

interface APITask {
    title: string,
    id: number, // TODO: Change this to id on backend?
    sort_order: number,
    indent_level: number
}

class API {
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

        return API.PromiseForMultipleTasks(axiosPromise);
    }

    createTask(title: string): Promise<Task> {
        let url = this.url + "api/v1/tasks.json";
        let axiosPromise = axios.post(url, {
            title: title
        });

        return API.PromiseForSingleTask(axiosPromise);
    }

    updateTask(id: string, properties: {[ key: string]: any}): Promise<Task> {
        let url = this.url + "api/v1/tasks/" + id + ".json";
        let axiosPromise = axios.put(url, properties);

        return API.PromiseForSingleTask(axiosPromise);
    }

    reorderTasks(tasks: Task[]): Promise<Task[]> {
        let url = this.url + "api/v1/tasks/reorder.json";
        let axiosPromise = axios.post(url, {task_ids: tasks.map(x => Number(x.id))});

        return API.PromiseForMultipleTasks(axiosPromise);
    }

    static PromiseForMultipleTasks(axiosPromise): Promise<Task[]> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(axiosResponse.data.map(API.TaskFromAPI));
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static PromiseForSingleTask(axiosPromise): Promise<Task> {
        return new Promise(function(resolve, reject) {
            let resolver = function(axiosResponse) {
                resolve(API.TaskFromAPI(axiosResponse.data));
            };

            axiosPromise.then(resolver, API.error);
        })
    }

    static TaskFromAPI(data: APITask): Task {
        return {
            title: data.title,
            id: String(data.id), // TODO: Make API return string
            sortOrder: data.sort_order,
            indentLevel: data.indent_level
        };
    }
}

export { API };