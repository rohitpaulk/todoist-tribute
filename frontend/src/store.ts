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

        return new Promise(function(resolve, reject) {
            let axiosPromise = axios.get(url);

            let resolver = function(axiosResponse) {
                resolve(axiosResponse.data.map(Store.TaskFromAPI));
            };

            axiosPromise.then(resolver, Store.error);
        })
    }

    createTask(title: string): Promise<Task> {
        let url = this.url + "api/v1/tasks.json";

        return new Promise(function(resolve, reject) {
            let axiosPromise = axios.post(url, {
                title: title
            });

            let resolver = function(axiosResponse) {
                resolve(Store.TaskFromAPI(axiosResponse.data));
            };

            axiosPromise.then(resolver, Store.error);
        })
    }

    updateTask(id: string, properties: {[ key: string]: any}): Promise<Task> {
        let url = this.url + "api/v1/tasks/" + id + ".json";

        return new Promise(function(resolve, reject) {
            let axiosPromise = axios.put(url, properties);

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