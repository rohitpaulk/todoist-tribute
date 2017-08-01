import * as _ from 'lodash';
import * as Mousetrap from 'mousetrap';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../models';
import { API } from '../API';
import { ReorderTasksPayload } from '../store';
import { DragEventHandlers, DragState, getOrderedItems } from '../helpers/drag_state';

interface TaskList extends Vue {
    // data
    dragState?: DragState
    dragOperationInProgress: boolean
    isAddingTask: boolean
    taskBeingEdited: Task | null

    // props
    tasks: Task[]
    defaultProject: Project

    // computed
    localTasks: Task[]

    // methods
    openAddTaskForm: () => void
    hideTaskForm: () => void
}

let taskListOptions = {
    data: function() {
        return {
            dragState: undefined,
            dragOperationInProgress: false,
            isAddingTask: false,
            taskBeingEdited: null
        }
    },

    props: {
        tasks: { required: true },
        defaultProject: { required: true }
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
                    'is-dragged': dragState && (dragState.draggedItemId === task.id)
                };
            });

            return classObjectMap;
        }
    },

    created: function() {
        let taskList = this;

        Mousetrap.bind('a', function() {
            taskList.openAddTaskForm();

            return false;
        });
    },

    methods: {
        completeTask: function(task: Task): void {
            this.$store.dispatch('completeTask', task)
        },

        openAddTaskForm: function() {
            this.isAddingTask = true;
            this.taskBeingEdited = null;
        },

        hideTaskForm: function() {
            this.isAddingTask = false;
            this.taskBeingEdited = null;
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
                project: this.defaultProject
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
        },

        setTaskBeingEdited: function(task) {
            this.taskBeingEdited = task;
        }
    },

    template: `
        <div>
            <div class="task-list draggable-task-list">
                <template v-for="task in localTasks">
                    <task-editor
                        v-if="taskBeingEdited && (taskBeingEdited.id === task.id)"
                        @close="hideTaskForm()"
                        :initial-project="defaultProject"
                        :task-to-edit="task">
                    </task-editor>
                    <div v-else
                         class="drag-item"
                         @drop="onDrop($event)"
                         @dragover.prevent
                         @dragenter="onDragEnter($event, task)">

                        <span class="dragbars-holder"
                                draggable="true"
                                @dragstart="onDragStart($event, task)"
                                @dragend="onDragEnd()">
                            <i class="fa fa-bars drag-bars"></i>
                        </span>

                        <task-item :task="task"
                            @intentToEdit="setTaskBeingEdited"
                            @intentToComplete="completeTask">
                        </task-item>
                    </div>
                </template>
            </div>
            <task-editor
                v-if="isAddingTask"
                @close="hideTaskForm()"
                :initial-project="project">
            </task-editor>
            <div v-else class="add-task" @click="openAddTaskForm()">
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

export { taskListOptions as TaskListOptions };
export { TaskList };