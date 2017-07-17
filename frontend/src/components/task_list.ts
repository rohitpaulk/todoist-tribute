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

    constructor(tasks: Task[]) {
        this.tasks = tasks;
    }

    render(container: JQuery<HTMLElement>) {
        let template = Handlebars.compile(TaskList.taskListTemplate);
        let html = template({tasks: this.tasks});

        container.html(html);
    }
}

export { TaskList };