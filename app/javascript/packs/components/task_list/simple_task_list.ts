import * as _ from 'lodash';
import * as Mousetrap from 'mousetrap';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../../models';
import { API } from '../../API';
import { ReorderTasksPayload } from '../../store';

interface TaskList extends Vue {
    // data
    taskBeingEdited: Task | null

    // props
    tasks: Task[]

    // computed
    localTasks: Task[]

    openEditor(task: Task): void
    closeEditor(): void
}

let taskListOptions = {
    data: function() {
        return {
            taskBeingEdited: null
        }
    },

    props: {
        tasks: { required: true }
    },

    methods: {
        completeTask: function(task: Task): void {
            this.$store.dispatch('completeTask', task)
        },

        openEditor: function(task: Task) {
            this.taskBeingEdited = task;
        },

        closeEditor: function() {
            this.taskBeingEdited = null;
        },
    },

    template: `
        <div>
            <div class="task-list simple-task-list">
                <template v-for="task in tasks">
                    <task-editor
                        v-if="taskBeingEdited && (taskBeingEdited.id === task.id)"
                        @close="closeEditor()"
                        :task-to-edit="task"
                        :autocomplete-definitions="this.$store.getters.autocompleteDefinitions">
                    </task-editor>
                    <task-item
                        v-else
                        :task="task"
                        @intentToEdit="openEditor"
                        @intentToComplete="completeTask">
                    </task-item>
                </template>
            </div>
        </div>
    `
} as ComponentOptions<TaskList>

export { taskListOptions as SimpleTaskListOptions };