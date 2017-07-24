import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../models';
import { API } from '../API';
import { CreateTaskPayload, UpdateTaskPayload } from '../store';

interface TaskEditor extends Vue {
    // data
    task: {
        id: null | string,
        title: string,
        project: Project
    },

    // prop
    project: Project,
    taskToEdit: Task | null,

    // methods
    emitClose: () => void,
}

let taskEditorOptions = {
    name: 'task-editor',

    data: function() {
        if (this.taskToEdit === null) {
            return {
                task: {
                    id: null,
                    title: '',
                    project: this.project
                },
            }
        } else {
            return {
                task: {
                    id: this.taskToEdit.id,
                    title: this.taskToEdit.title,
                    project: this.project
                },
            }
        }
    },

    props: {
        project: { required: true },
        taskToEdit: { default: null }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
        },

        submitChanges: function() {
            let taskEditor = this;

            if (this.task.id) {
                this.$store.dispatch('updateTask', {
                    id: this.task.id,
                    title: this.task.title,
                    project: this.task.project
                });
            } else {
                this.$store.dispatch('createTask', {
                    title: this.task.title,
                    project: this.task.project
                });
            }

            // TODO: Only after promise resolves!
            this.emitClose();
        }
    },

    mounted: function() {
        (this.$refs['input'] as HTMLElement).focus();
    },

    template: `
        <div class="task-editor">
            <div class="task-form">
                <form @submit.prevent="submitChanges()" @keydown.esc="emitClose()">
                    <input type="text" ref="input" v-model="task.title">
                    <button type="submit">Add Task</button>
                    <a href="#" class="cancel-link" @click="emitClose()">Cancel</a>
                </form>
            </div>
        </div>
    `
} as ComponentOptions<TaskEditor>

export { taskEditorOptions as TaskEditorOptions }
