import * as Handlebars from 'handlebars';
import * as $ from "jquery";

import { Task } from '../models';

class TaskList {
    static taskListTemplate = `
        {{#each tasks}}
            <li class="task-item">
                <span class="icon-holder">
                    <span class="checkbox"></span>
                </span>
                <span class="text-holder">
                    <span class="task-title">
                        {{ title }}
                    </span>
                </span>
            </li>
        {{/each}}
    `

    tasks: Task[]
    container: JQuery<HTMLElement>

    constructor(tasks: Task[], container: JQuery<HTMLElement>) {
        this.tasks = tasks;
        this.container = container;
    }

    setTasks(tasks: Task[]) {
        this.tasks = tasks;
        this.render();
    }

    render() {
        let template = Handlebars.compile(TaskList.taskListTemplate);
        let html = template({tasks: this.tasks});

        this.container.html(html);
    }
}

export { TaskList };