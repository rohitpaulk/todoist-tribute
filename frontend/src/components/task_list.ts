import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { API } from '../API';
import * as _ from 'lodash';
import * as Mousetrap from 'mousetrap';

interface TaskList extends Vue {
    // data
    dragState?: {
        draggedTask: Task,
        orderBeforeDrag: string[] // Array of IDs
        currentOrder: string[] // Array of IDs
    },
    isAddingTask: boolean,

    // computed
    tasks: Task[] // Pulled from global store
    tasksOrderedLocally: Task[]

    // methods
    showTaskForm: () => void
    hideTaskForm: () => void
}

let taskListOptions = {
    data: function() {
        return {
            dragState: null,
            isAddingTask: false,
        }
    },

    computed: {
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

        taskItemClasses(): {[key: string]: any} {
            let classObjectMap = {};
            // TODO: Is there a more functional way to do this?
            //       i.e. return [task_id, {}] and then turn into a Map?
            let dragState = this.dragState;
            _.forEach(this.tasks, function(task: Task) {
                classObjectMap[task.id] = {
                    'task-item': true,
                    'resource-item': true,
                    'is-dragged': dragState && (dragState.draggedTask.id === task.id)
                };
            });

            return classObjectMap;
        }
    },

    created: function() {
        this.$store.dispatch('refreshTasks');
        let taskList = this;

        Mousetrap.bind('a', function() {
            taskList.showTaskForm();
        });
    },

    methods: {
        completeTask: function(task: Task): void {
            this.$store.dispatch('completeTask', task)
        },

        showTaskForm: function() {
            this.isAddingTask = true;
        },

        hideTaskForm: function() {
            this.isAddingTask = false;
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
    },

    template: `
        <div>
            <ul class="task-list resource-list">
                <li v-for="task in tasks"
                    v-bind:class="taskItemClasses[task.id]"
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
            <task-editor v-if="isAddingTask" @close="hideTaskForm()"></task-editor>
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
    `
} as ComponentOptions<TaskList>

export { taskListOptions as TaskListOptions }