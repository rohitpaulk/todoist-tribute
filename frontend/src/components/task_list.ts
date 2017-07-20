import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { Store } from '../store';
import * as _ from 'lodash';

interface TaskList extends Vue {
    // data
    tasks: Task[],
    dragState: null | {
        currentDraggedTask: Task,
        tasksBeforeDrag: Task[]
    }

    // computed
    nextSortOrder: number,
}

let taskListOptions = {
    data: function() {
        return {
            tasks: [],
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
            this.dragState = null;
        },

        taskItemClass(task: Task) {
            // Note: This has to be manually forced to updated!
            return {
                'task-item': true,
                'is-dragged': this.dragState && (this.dragState.currentDraggedTask.id === task.id)
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
                :nextSortOrder="nextSortOrder"
                @addedTask="addTask">
            </task-editor>
        </div>
    `
} as ComponentOptions<TaskList>

export { taskListOptions as TaskListOptions }
export { TaskList }
