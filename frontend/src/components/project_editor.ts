import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';


interface ProjectEditor extends Vue {
    // data
    project: {
        name: string
        colorHex: string
    }

    // props
    projectToEdit: Project | null

    // computed
    buttonText: string

    // methods
    emitClose: () => void
    submitChanges: () => void
}


let ProjectEditorOptions = {
    data: function() {
        return {
            project: {
                name: (this.projectToEdit === null) ? '' : this.projectToEdit.name,
                colorHex: (this.projectToEdit === null) ? '000000' : this.projectToEdit.colorHex,
            }
        };
    },

    props: {
        projectToEdit: { default: null }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
        },

        submitChanges: function() {
            alert('Submit changes!');
        }
    },

    mounted: function() {
        (this.$refs['text-input'] as HTMLElement).focus();
    },

    template: `
        <div class="project-editor">
            <div class="project-form">
                <form @submit.prevent="submitChanges()"
                      @keydown.esc="emitClose()">
                    <div class="input-nodes-container">
                        <!-- Color input -->
                        <input type="text"
                               v-model="project.name"
                               ref="text-input"
                               class="text-input" />
                    </div>

                    <button type="submit">
                        Add Project
                    </button>

                    <a href="#" class="cancel-link" @click="emitClose()">Cancel</a>
                </form>
            </div>
        </div>
    `

} as ComponentOptions<ProjectEditor>;

export { ProjectEditorOptions };