import Vue, { ComponentOptions } from 'vue';
import * as _ from 'lodash';

import { Project } from '../models';
import { CreateProjectPayload } from '../store';


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
            if (_.trim(this.project.name) === '') {
                return; // Nothing to be done
            }

            if (this.projectToEdit) {
                alert('Updating project not implemented yet!');
            } else {
                this.$store.dispatch('createProject', {
                    name: this.project.name,
                    colorHex: this.project.colorHex
                } as CreateProjectPayload);
            }

            // TODO: Wait for promise to resolve?
            this.emitClose();
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
                        <!-- TODO: Add color input -->
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