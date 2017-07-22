import Vue, { ComponentOptions } from 'vue';

import { Task } from '../models';
import { API } from '../API';
import * as _ from 'lodash';

interface TaskEditor extends Vue {
    // data
    newTask: {
        title: string
    },

    // methods
    emitClose: () => void,
}

let taskEditorOptions = {
    name: 'task-editor',

    data: function() {
        return {
            inputFocusPending: false,
            newTask: {
                title: ''
            },
        }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
        },

        createTask: function() {
            let taskEditor = this;

            this.$store.dispatch('createTask', {title: this.newTask.title});

            // TODO: Only after promise resolves!
            taskEditor.newTask.title = '';
            this.emitClose();
        }
    },

    mounted: function() {
        (this.$refs['input'] as HTMLElement).focus();
    },

    template: `
        <div class="task-editor">
            <div class="task-form">
                <form @submit.prevent="createTask()" @keydown.esc="emitClose()">
                    <input type="text" ref="input" v-model="newTask.title">
                    <button type="submit">Add Task</button>
                    <a href="#" class="cancel-link" @click="emitClose()">Cancel</a>
                </form>
            </div>
        </div>
    `
} as ComponentOptions<TaskEditor>

export { taskEditorOptions as TaskEditorOptions }
