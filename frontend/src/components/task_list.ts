import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../models';
import { API } from '../API';
import { ReorderTasksPayload } from '../store';
import { DragEventHandlers, DragState, getOrderedItems } from '../helpers/drag_state';
import * as _ from 'lodash';
import * as Mousetrap from 'mousetrap';

interface TaskList extends Vue {
    // data
    dragState?: DragState
    dragOperationInProgress: boolean
    isAddingTask: boolean

    // props
    tasks: Task[]
    project: Project

    // computed
    localTasks: Task[]

    // methods
    showTaskForm: () => void
    hideTaskForm: () => void
}

let taskListOptions = {
    data: function() {
        return {
            dragState: undefined,
            dragOperationInProgress: false,
            isAddingTask: false,
        }
    },

    props: {
        tasks: { required: true },
        project: { required: true }
    },

    computed: {
        localTasks(): Task[] {
            if (this.dragState === undefined) {
                return this.tasks;
            } else {
                return getOrderedItems(this.tasks, this.dragState) as Task[];
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
                    'is-dragged': dragState && (dragState.draggedItem.id === task.id)
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

        onDragStart: function(event, draggedTask: Task): boolean {
            event.dataTransfer.setData('tudu/x-task', draggedTask.id);
            event.dataTransfer.setDragImage(event.target.parentNode, 0, 0);

            this.dragState = DragEventHandlers.dragStart(this.tasks, draggedTask);

            return false;
        },

        onDragEnter: function(event, currentTask: Task): boolean {
            let taskList = this;
            if (!_.includes(event.dataTransfer.types, 'tudu/x-task')) {
                return true;
            }

            this.dragState = DragEventHandlers.dragEnter(this.dragState!, currentTask);

            return false;
        },

        onDrop(event) {
            let taskList = this;

            let payload: ReorderTasksPayload = {
                task_ids: this.dragState!.currentOrder,
                project: this.project
            };

            taskList.dragOperationInProgress = true;
            this.$store.dispatch('reorderTasks', payload).then(function() {
                taskList.dragState = undefined;
                taskList.dragOperationInProgress = false;
            });
        },

        onDragEnd: function() {
            if ((this.dragState === undefined) || (this.dragOperationInProgress)) {
                // The drop either sucessfully happened, or is in progress.
            } else {
                // The drag was aborted halfway
                this.dragState = undefined;
            }
        }
    },

    template: `
        <div>
            <ul class="task-list resource-list">
                <li v-for="task in localTasks"
                    v-bind:class="taskItemClasses[task.id]"
                    @drop="onDrop($event)"
                    @dragover.prevent
                    @dragenter="onDragEnter($event, task)">

                    <span class="dragbars-holder"
                          draggable="true"
                          @dragstart="onDragStart($event, task)"
                          @dragend="onDragEnd()">
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
                v-if="isAddingTask"
                @close="hideTaskForm()"
                :initialProject="project">
            </task-editor>
            <div v-else class="add-task" @click="showTaskForm()">
                <span class="icon-holder">
                    <span class="add-icon">
                        +
                    </span>
                </span>
                <span class="text-holder">
                    <a href="#" class="add-task-link">Add Task</a>
                </span>
            </div>
        </div>
    `
} as ComponentOptions<TaskList>

export { taskListOptions as TaskListOptions }