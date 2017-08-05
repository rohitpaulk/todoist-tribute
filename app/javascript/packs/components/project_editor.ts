import Vue, { ComponentOptions } from 'vue';
import * as _ from 'lodash';

import { Project } from '../models';
import { CreateProjectPayload, UpdateProjectPayload } from '../store';


interface ProjectEditor extends Vue {
    // data
    project: {
        name: string
        colorHex: string
    }

    // props
    resourceToEdit: Project | null

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
                name: (this.resourceToEdit === null) ? '' : this.resourceToEdit.name,
                colorHex: (this.resourceToEdit === null) ? 'a8c8e4' : this.resourceToEdit.colorHex,
            }
        };
    },

    computed: {
        buttonText(): string {
            if (this.resourceToEdit === null) {
                return 'Add Project';
            } else {
                return 'Save';
            }
        }
    },

    props: {
        resourceToEdit: { default: null }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
        },

        submitChanges: function() {
            if (_.trim(this.project.name) === '') {
                return; // Nothing to be done
            }

            if (this.resourceToEdit) {
                this.$store.dispatch('updateProject', {
                    id: this.resourceToEdit.id,
                    name: this.project.name,
                    colorHex: this.project.colorHex
                } as UpdateProjectPayload);
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
        <div class="resource-editor">
            <div class="resource-form">
                <form @submit.prevent="submitChanges()"
                      @keydown.esc="emitClose()">
                    <div class="input-nodes-container">
                        <color-chooser v-model="project.colorHex">

                            <template scope="props" slot="icon">
                                <div class="color-icon project-icon"
                                     :style="{'background-color': '#' + props.colorHex}">
                                </div>
                            </template>

                        </color-chooser>

                        <input type="text"
                               v-model="project.name"
                               ref="text-input"
                               class="text-input" />
                    </div>

                    <button type="submit">
                        {{ buttonText }}
                    </button>

                    <a href="#" class="cancel-link" @click="emitClose()">Cancel</a>
                </form>
            </div>
        </div>
    `

} as ComponentOptions<ProjectEditor>;

export { ProjectEditorOptions };