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
    isColorChooserOpen: boolean

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
            },
            isColorChooserOpen: false
        };
    },

    computed: {
        buttonText(): string {
            if (this.projectToEdit === null) {
                return 'Add Project';
            } else {
                return 'Save';
            }
        }
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
                this.$store.dispatch('updateProject', {
                    id: this.projectToEdit.id,
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
        },

        toggleColorChooser: function() {
            this.isColorChooserOpen = !this.isColorChooserOpen;
        },

        colorSelected: function(colorHex: string) {
            this.isColorChooserOpen = false;
            this.project.colorHex = colorHex;
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
                        <div class="color-chooser-toggle"
                             @click.prevent="toggleColorChooser()">
                            <div class="color-icon color-icon-project"
                                 :style="{'background-color': '#' + project.colorHex}">
                            </div>
                        </div>
                        <color-chooser v-if="isColorChooserOpen"
                            @select="colorSelected">
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