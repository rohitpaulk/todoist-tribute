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
        alert('error! check console');
    }

    getTasks(): Promise<Task[]> {
        let store = this;

        return new Promise(function(resolve, reject) {
            let axiosPromise = axios.get(store.url + "api/v1/tasks");

            let resolver = function(axiosResponse) {
                resolve(axiosResponse.data.map(function(item): Task {
                    return {
                        title: item.title,
                        id: item.id,
                        sortOrder: item.sort_order
                    };
                }));
            };

            axiosPromise.then(resolver, reject);
        })
    }

    createTask(title: string, sortOrder: number): Promise<Task> {
        let url = this.url + "api/v1/tasks";

        return new Promise(function(resolve, reject) {
            let axiosPromise = axios.post(url, {
                title: title,
                sort_order: sortOrder
            });

            let resolver = function(axiosResponse) {
                resolve({
                    title: axiosResponse.data.title,
                    id: axiosResponse.data.id,
                    sortOrder: axiosResponse.data.sort_order
                });
            };

            axiosPromise.then(resolver, reject);
        })
    }
}

export { Store };