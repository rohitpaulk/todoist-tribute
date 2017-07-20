import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { API } from '../API';
import * as _ from 'lodash';
import * as Mousetrap from 'mousetrap';

interface TaskEditor extends Vue {
    // data
    isAddingTask: boolean,
    inputFocusPending: boolean,
    newTask: {
        title: string
    },

    // props
    nextSortOrder: number,

    // methods
    hideTaskForm: () => void,
    showTaskForm: () => void
}

let taskEditorOptions = {
    name: 'task-editor',

    data: function() {
        return {
            isAddingTask: false,
            inputFocusPending: false,
            newTask: {
                title: ''
            },
        }
    },

    props: {
        nextSortOrder: {required: true}
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
        },

        createTask: function() {
            let taskEditor = this;

            this.$store.dispatch('createTask', {title: this.newTask.title});

            // TODO: Only after promise!
            taskEditor.newTask.title = '';
            taskEditor.hideTaskForm();
        }
    },

    created: function() {
        let taskEditor = this;

        Mousetrap.bind('a', function() {
            taskEditor.showTaskForm();
        });
    },

    updated: function() {
        if (this.inputFocusPending) {
            (this.$refs['input'] as HTMLElement).focus();
        }

        this.inputFocusPending = false;
    },

    template: `
        <div class="task-editor">
            <div v-if="isAddingTask" class="task-form">
                <form @submit.prevent="createTask()" @keydown.esc="hideTaskForm()">
                    <input type="text" ref="input" v-model="newTask.title">
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
    `
} as ComponentOptions<TaskEditor>

export { taskEditorOptions as TaskEditorOptions }
