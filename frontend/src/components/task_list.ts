import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { API } from '../API';
import * as _ from 'lodash';

interface TaskList extends Vue {
    // data
    dragState: null | {
        currentDraggedTask: Task,
        orderBeforeDrag: string[]
        currentOrder: string[] // Array of IDs
    }

    // computed
    nextSortOrder: number,
    tasks: Task[] // Pulled from global store
}

let taskListOptions = {
    data: function() {
        return {
            dragState: null
        }
    },

    computed: {
        // TODO: Change this to be active sortOrder?
        nextSortOrder(): number {
            if (_.isEmpty(this.tasks)) {
                return 0;
            }

            return _.last(this.tasks).sortOrder + 1;
        },

        // Might have to filter by something?
        tasks(): Task[] {
            return this.$store.state.tasks;
        }
    },

    created: function() {
        this.$store.dispatch('refreshTasks');
    },

    methods: {
        completeTask: function(task: Task): void {
            this.$store.dispatch('completeTask', task)
        },

        startDrag: function(event, task: Task): boolean {
            event.dataTransfer.setData('tudu/x-task', task.id);
            event.dataTransfer.setDragImage(event.target.parentNode, 0, 0);

            this.dragState = {
                currentDraggedTask: task,
                tasksBeforeDrag: this.tasks.slice() // Copy, not reference!
            };

            return false;
        },

        endDrag: function() {
            if (!_.isNull(this.dragState)) {
                // The drag was aborted halfway
                this.tasks = this.dragState.tasksBeforeDrag;
                this.dragState = null;
            } else {
                // Nothing to do, the drop successfully happened.
            }
        },

        dragEnter: function(event, currentTask: Task): boolean {
            let taskList = this;
            if (!_.includes(event.dataTransfer.types, 'tudu/x-task')) {
                return true;
            }

            let currentTaskPosition = _.findIndex(this.tasks, function(x) {
                return x.id === currentTask.id;
            });

            let draggedTaskPosition = _.findIndex(this.tasks, function(x) {
                return x.id === taskList.dragState.currentDraggedTask.id;
            });

            let cp = currentTaskPosition;
            let dp = draggedTaskPosition;

            [this.tasks[cp], this.tasks[dp]] = [this.tasks[dp], this.tasks[cp]]
            this.$forceUpdate(); // TODO: Figure out why?

            return false;
        },

        droppedTask(event, task: Task) {
            let taskList = this;
            this.dragState = null;

            this.$store.dispatch('reorderTasks', this.tasks);

            let store = new API('http://localhost:3000/');
            store.reorderTasks(this.tasks).then(function(tasks) {
                taskList.tasks = tasks;
            });
        },

        taskItemClass(task: Task) {
            // Note: This has to be manually forced to updated!
            return {
                'task-item': true,
                'is-dragged': this.dragState && (this.dragState.currentDraggedTask.id === task.id),
                'indent-1': task.indentLevel == 1,
                'indent-2': task.indentLevel == 2,
                'indent-3': task.indentLevel == 3,
                'indent-4': task.indentLevel == 4
            };
        }
    },

    template: `
        <div>
            <ul class="task-list">
                <li v-for="task in tasks"
                    v-bind:class="taskItemClass(task)"
                    @drop="droppedTask($event, task)"
                    @dragover.prevent
                    @dragenter="dragEnter($event, task)">

                    <span class="dragbars-holder"
                          draggable="true"
                          @dragstart="startDrag($event, task)"
                          @dragend="endDrag()">
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
                :nextSortOrder="nextSortOrder">
            </task-editor>
        </div>
    `
} as ComponentOptions<TaskList>

export { taskListOptions as TaskListOptions }