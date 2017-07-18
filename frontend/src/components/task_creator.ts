import * as Handlebars from 'handlebars';
import * as $ from "jquery";

class TaskCreator {
    static template = `
        {{#if isAddingTask}}
            <div class="task-form">
                <form>
                    <input type="text">
                    <button type="submit">Add Task</button>
                    <a href="#" class="cancel-link">Cancel</a>
                </form>
            </div>
        {{else}}
            <div class="add-task">
                <span class="icon-holder">
                    <span class="add-icon">
                        +
                    </span>
                </span>
                <span class="text-holder">
                    <a href="#" class="add-task-link">Add Task</a>
                </span>
            </div>
        {{/if}}
    `

    isAddingTask: boolean
    createTaskFunc: (title: string, sortOrder: number, cb: any) => void

    constructor(createTaskFunc: (title: string, sortOrder: number, cb: any) => void) {
        this.isAddingTask = false;
        this.createTaskFunc = createTaskFunc;
    }

    render(container: JQuery<HTMLElement>) {
        let template = Handlebars.compile(TaskCreator.template);
        let html = template({isAddingTask: this.isAddingTask});

        container.html(html);
        this.wireUp(container);
    }

    hideForm(container: JQuery<HTMLElement>) {
        this.isAddingTask = false;
        this.render(container);
    }

    showForm(container: JQuery<HTMLElement>) {
        this.isAddingTask = true;
        this.render(container);
        container.find('input').focus();
    }

    wireUp(container: JQuery<HTMLElement>) {
        if (this.isAddingTask) {
            this.wireUpTaskForm(container);
        } else {
            this.wireUpAddTask(container);
        }
    }

    wireUpAddTask(container: JQuery<HTMLElement>) {
        let taskCreator = this;

        container.find('.add-task').click(function (e) {
            e.preventDefault();

            taskCreator.showForm(container);
        });
    }

    wireUpTaskForm(container: JQuery<HTMLElement>) {
        let taskCreator = this;

        container.find('.task-form form').submit(function (e) {
            e.preventDefault();

            let title = 'Testing 2';
            let sortOrder = 32;

            taskCreator.createTaskFunc(title, sortOrder, function (task) {
                alert('got something back!');
                // Send event upwards?
            });

            alert('Submitting form!');
        });

        container.find('.task-form a.cancel-link').click(function (e) {
            e.preventDefault();

            taskCreator.hideForm(container);
        });

        container.find('.task-form input').keydown(function(e) {
            if (e.which == 27) { taskCreator.hideForm(container) }
        });
    }
}

export { TaskCreator };