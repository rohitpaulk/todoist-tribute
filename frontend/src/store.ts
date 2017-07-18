import { Task } from './models';
import * as $ from 'jquery';

class Store {
    url: string

    constructor(url: string) {
        this.url = url;
    }

    static error() {
        console.log(arguments);
        alert('error! check console');
    }

    getTasks(cb: (data: Task[]) => void): void {
        let store = this;
        $.ajax({
            method: "GET",
            url: store.url + "api/v1/tasks",
            success: function(data: any[]) {
                let tasks = data.map(function(item) {
                    return {title: item.title};
                });

                cb(tasks);
            },
            error: Store.error
        });
    }

    createTask(title: string, sort_order: number, cb: (data: Task) => void): void {
        let store = this;
        $.ajax({
            method: "POST",
            url: store.url + "api/v1/tasks",
            data: {
                title: title,
                sort_order: sort_order
            },
            success: function(data: any) {
                cb({title: data.title});
            },
            error: Store.error
        });
    }
}

export { Store };