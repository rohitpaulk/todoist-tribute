import { Task } from './models';

class Store {
    url: string

    constructor(url: string) {
        this.url = url;
    }

    getTasks(cb: (data: Task[]) => void): void {
        // Faking a network call
        setTimeout(function() {
            let data = [
                {title: 'This is the first task'},
                {title: 'This is the second task'}
            ]

            cb(data);
        }, 1500);
    }
}

export { Store };