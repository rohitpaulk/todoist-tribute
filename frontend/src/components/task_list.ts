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
        nextSortOrder(): number {
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
        addTask: function(task) {
            this.tasks.push(task);
        }
    },

    template: `
        <div>
            <ul class="task-list">
                <li v-for="task in tasks" class="task-item">
                    <span class="icon-holder">
                        <span class="checkbox"></span>
                    </span>
                    <span class="text-holder">
                        <span class="task-title">
                            {{ task.title }}
                        </span>
                    </span>
                </li>
            </ul>
            <task-creator
                ref='task-creator'
                :nextSortOrder="nextSortOrder"
                @addedTask="addTask(task)">
            </task-creator>
        </div>
    `
} as ComponentOptions<TaskList>

export { taskListOptions as TaskListOptions }
export { TaskList }
