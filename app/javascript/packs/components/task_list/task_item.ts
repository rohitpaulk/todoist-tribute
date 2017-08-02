import Vue, { ComponentOptions } from 'vue';
import { Label, Task, Project } from '../../models';


interface TaskItem extends Vue {
    // props
    task: Task

    // In some views (project view, for example), we don't want to show the
    // project pill on task items.
    showProjectTag: boolean

    // methods
    emitIntentToComplete(task: Task): void
    emitIntentToEdit(task: Task): void
}


let TaskItemOptions = {
    props: {
        task: { required: true },
        showProjectTag: { default: true }
    },

    computed: {
        project(): Project | null {
            return this.$store.getters.projectFromId(this.task.projectId);
        },

        labels(): Label[] {
            return this.$store.getters.labelsFromIds(this.task.labelIds);
        }
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

            <span class="icon-holder">
                <span class="checkbox"
                      @click.stop="emitIntentToComplete(task)">
                </span>
            </span>
            <span class="text-holder">
                <span class="task-title">
                    {{ task.title }}
                </span>
                <span class="label-tags" v-if="labels.length != 0">
                    <span class="label-tag" v-for="(label, index) in labels">
                        <span class="label-name"
                              :style="{'color': '#' + label.colorHex }"
                              v-text="label.name">
                        </span><span class="label-separator"
                                     v-if="index != (labels.length-1)">,
                        </span>
                    </span>
                </span>
            </span>
            <span class="right-holder">
                <span class="project-tag" v-if="showProjectTag">
                    <span class="project-title">
                        {{ project.name }}
                    </span>
                    <span class="icon-wrapper">
                        <span class="project-icon"
                            :style="{ 'background-color': '#' + project.colorHex }">
                        </span>
                    </span>
                </span>
            </span>
        </div>
    `
} as ComponentOptions<TaskItem>;


export { TaskItemOptions }