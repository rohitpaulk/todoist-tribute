import Vue, { ComponentOptions } from 'vue';
import { Task } from '../../models';


interface TaskItem extends Vue {
    // props
    task: Task

    // methods
    emitIntentToComplete(task: Task): void
    emitIntentToEdit(task: Task): void
}


let TaskItemOptions = {
    props: {
        task: { required: true }
    },

    methods: {
        emitIntentToComplete(task: Task) {
            this.$emit('intentToComplete', task);
        },

        emitIntentToEdit(task: Task) {
            this.$emit('intentToEdit', task);
        }
    },

    template: `
        <div class="task-item"
             @click="emitIntentToEdit(task)">

            <!-- TODO: slot for dragbars needed? -->

            <span class="icon-holder">
                <span class="checkbox"
                      @click.stop="emitIntentToComplete(task)">
                </span>
            </span>
            <span class="text-holder">
                <span class="task-title">
                    {{ task.title }}
                </span>
            </span>
        </div>
    `
} as ComponentOptions<TaskItem>;


export { TaskItemOptions }