import * as _ from 'lodash';
import * as Mousetrap from 'mousetrap';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../../models';
import { API } from '../../API';
import { ReorderTasksPayload } from '../../store';
import { DragEventHandlers, DragState, getOrderedItems } from '../../helpers/drag_state';

interface TaskList extends Vue {
    // data
    dragState?: DragState
    dragOperationInProgress: boolean

    // A hash for the new task creator. Needed to prevent picking up old editor
    // instances when a new one is rendered as soon as the old one is closed.
    taskCreatorHash: string | null

    taskBeingEdited: Task | null

    // props
    tasks: Task[]
    defaultProject: Project

    // computed
    localTasks: Task[]
    isAddingTask: boolean

    // methods
    openAddTaskForm: () => void
    closeAddTaskForm: () => void

    openEditTaskForm(task): void
    closeEditTaskForm(): void
}

let taskListOptions = {
    data: function() {
        return {
            dragState: undefined,
            dragOperationInProgress: false,
            taskCreatorHash: null,
            taskBeingEdited: null
        }
    },

    props: {
        tasks: { required: true },
        defaultProject: { required: true }
    },

    computed: {
        isAddingTask(): boolean {
            return this.taskCreatorHash !== null;
        },

        localTasks(): Task[] {
            if (this.dragState === undefined) {
                return this.tasks;
            } else {
                return getOrderedItems(this.tasks, this.dragState) as Task[];
            }
        },

        dragItemClasses(): {[key: string]: any} {
            let classObjectMap = {};
            // TODO: Is there a more functional way to do this?
            //       i.e. return [task_id, {}] and then turn into a Map?
            let dragState = this.dragState;
            _.forEach(this.tasks, function(task: Task) {
                classObjectMap[task.id] = {
                    'drag-item': true,
                    'is-dragged': dragState && (dragState.draggedItemId === task.id)
                };
            });

            return classObjectMap;
        },

        autocompleteDefinitions() {
            return this.$store.getters.autocompleteDefinitions;
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
            this.closeEditTaskForm(); // Only keep a single editor open at a time
            this.taskCreatorHash = Math.random().toString(36);
        },

        closeAddTaskForm: function() {
            this.taskCreatorHash = null;
        },

        openEditTaskForm: function(task) {
            this.closeAddTaskForm(); // Only keep a single editor open at a time
            this.taskBeingEdited = task;
        },

        closeEditTaskForm: function() {
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
        }
    },

    template: `
        <div class="task-list-container">
            <div class="task-list draggable-task-list">
                <task-editor
                    v-for="task in localTasks"
                    :key="'editor-editing-' + task.id"
                    v-if="taskBeingEdited && (taskBeingEdited.id === task.id)"
                    @close="closeEditTaskForm()"
                    :initial-project="defaultProject"
                    :task-to-edit="task"
                    :autocomplete-definitions="autocompleteDefinitions">
                </task-editor>
                <div v-else
                     :class="dragItemClasses[task.id]"
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
                        :showProjectTag="false"
                        @intentToEdit="openEditTaskForm"
                        @intentToComplete="completeTask">
                    </task-item>
                </div>
            </div>
            <task-editor
                v-if="isAddingTask"
                :key="'editor-creating-' + taskCreatorHash"
                @close="closeAddTaskForm()"
                @closeAndOpenBelow="closeAddTaskForm(); openAddTaskForm()"
                :initial-project="defaultProject"
                :autocomplete-definitions="autocompleteDefinitions">
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
