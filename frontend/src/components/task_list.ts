import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { Store } from '../store';
import * as _ from 'lodash';

interface TaskList extends Vue {
    tasks: Task[],
    nextSortOrder: number,
}

let taskListOptions = {
    data: function() {
        return {
            tasks: [],
        }
    },

    computed: {
        // TODO: Change this to be active sortOrder?
        nextSortOrder(): number {
            if (_.isEmpty(this.tasks)) {
                return 0;
            }

            return _.last(this.tasks).sortOrder + 1;
        }
    },

    created: function() {
        let taskList = this;

        let store = new Store('http://localhost:3000/');
        store.getTasks().then(function(tasks) {
            taskList.tasks = tasks;
        });
    },

    methods: {
        addTask: function(task: Task): void {
            this.tasks.push(task);
        },

        completeTask: function(task: Task): void {
            let taskList = this;

            let store = new Store('http://localhost:3000/');
            store.updateTask(task.id, {is_completed: true}).then(function() {
                taskList.tasks = _.filter(taskList.tasks, function(x): boolean {
                    return x.id !== task.id;
                });
            });
        },
    },

    template: `
        <div>
            <ul class="task-list">
                <li v-for="task in tasks" class="task-item">
                    <span class="dragbars-holder">
                        <i class="fa fa-bars drag-bars"></i>
                    </span>
                    <span class="icon-holder">
                        <span class="checkbox" @click="completeTask(task)">
                        </span>
                    </span>
                    <span class="text-holder">
                        <span class="task-title">
                            {{ task.title }}
                        </span>
                    </span>
                </li>
            </ul>
            <task-editor
                ref='task-editor'
                :nextSortOrder="nextSortOrder"
                @addedTask="addTask">
            </task-editor>
        </div>
    `
} as ComponentOptions<TaskList>

export { taskListOptions as TaskListOptions }
export { TaskList }
