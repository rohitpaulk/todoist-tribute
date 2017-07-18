import { Task } from './models';
import * as $ from 'jquery';

class Store {
    url: string

    constructor(url: string) {
        this.url = url;
    }

    getTasks(cb: (data: Task[]) => void): void {
        $.ajax({
            method: "GET",
            url: this.url + "api/v1/tasks",
            success: function(data: any[]) {
                let tasks = data.map(function(item) {
                    return {title: item.title};
                });

                cb(tasks);
            },
            error: function() {
                console.log(arguments);
                alert('error!');
            }
        });
    }
}

export { Store };