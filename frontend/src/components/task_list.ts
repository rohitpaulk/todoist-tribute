import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { Store } from '../store';
import * as _ from 'lodash';

interface TaskList extends Vue {
    tasks: Task[],
    isAddingTask: boolean,
    inputFocusPending: boolean
}

export default {
    data: function() {
        return {
            tasks: [],
            isAddingTask: false
        }
    },

    computed: {
        nextSortOrder(): number {
            return _.last(this.tasks).sortOrder + 1;
        }
    },

    methods: {
        showTaskForm: function() {
            this.isAddingTask = true;

            // We need to trigger a focus event on the input element. It
            // will not be in the DOM as of this moment, so we mark this flag
            // so that .focus() is called after the component updates
            this.inputFocusPending = true;
        },

        hideTaskForm: function() {
            this.isAddingTask = false;
        }
    },

    created: function() {
        let taskList = this;
        let store = new Store('http://localhost:3000/');
        store.getTasks().then(function(tasks) {
            taskList.tasks = tasks;
        });
    },

    updated: function() {
        if (this.inputFocusPending) {
            (this.$refs['input'] as HTMLElement).focus();
        }

        this.inputFocusPending = false;
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
            <div class="task-creator">
                <div v-if="isAddingTask" class="task-form">
                    <form>
                        <input type="text" ref="input">
                        <button type="submit">Add Task</button>
                        <a href="#" class="cancel-link" @click="hideTaskForm()">Cancel</a>
                    </form>
                </div>
                <div v-else class="add-task" @click="showTaskForm()">
                    <span class="icon-holder">
                        <span class="add-icon">
                            +
                        </span>
                    </span>
                    <span class="text-holder">
                        <a href="#" class="add-task-link"">Add Task</a>
                    </span>
                </div>
            </div>
        </div>
    `
} as ComponentOptions<TaskList>
