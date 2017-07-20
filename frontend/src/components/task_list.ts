import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { API } from '../API';
import * as _ from 'lodash';

interface TaskList extends Vue {
    // data
    dragState?: {
        draggedTask: Task,
        orderBeforeDrag: string[] // Array of IDs
        currentOrder: string[] // Array of IDs
    }

    // computed
    nextSortOrder: number,
    tasks: Task[] // Pulled from global store
    tasksOrderedLocally: Task[]
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
            let taskList = this;
            if (_.isNull(this.dragState)) {
                return this.$store.state.tasks;
            } else {
                // Order locally, according to drag state
                return _.sortBy(taskList.$store.state.tasks, function (task: Task) {
                    return _.indexOf(taskList.dragState.currentOrder, task.id);
                });
            }
        },
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
                draggedTask: task,
                orderBeforeDrag: this.tasks.map(x => x.id),
                currentOrder: this.tasks.map(x => x.id)
            };

            return false;
        },

        endDrag: function() {
            if (!_.isNull(this.dragState)) {
                // The drag was aborted halfway
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

            let taskOrder = this.dragState.currentOrder.slice();
            let draggedTask = this.dragState.draggedTask;

            let currentTaskPosition = _.indexOf(taskOrder, currentTask.id);
            let draggedTaskPosition = _.indexOf(taskOrder, draggedTask.id);

            let cp = currentTaskPosition;
            let dp = draggedTaskPosition;

            let newOrder = taskOrder.slice();
            newOrder[cp] = taskOrder[dp];
            newOrder[dp] = taskOrder[cp];

            this.dragState.currentOrder = newOrder;

            return false;
        },

        droppedTask(event, task: Task) {
            // TODO: Wait for result via promise!
            this.$store.dispatch('reorderTasks', this.dragState.currentOrder);

            this.dragState = null;
        },

        taskItemClass(task: Task) {
            // Note: This has to be manually forced to updated!
            // TODO: Convert to dict for ALL tasks, only picked required.
            return {
                'task-item': true,
                'is-dragged': this.dragState && (this.dragState.draggedTask.id === task.id),
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