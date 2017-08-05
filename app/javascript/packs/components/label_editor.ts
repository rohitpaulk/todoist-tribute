import Vue, { ComponentOptions } from 'vue';
import * as _ from 'lodash';

import { Label } from '../models';
import { CreateLabelPayload, UpdateLabelPayload } from '../store';


interface LabelEditor extends Vue {
    // data
    label: {
        name: string
        colorHex: string
    }

    // props
    resourceToEdit: Label | null

    // computed
    buttonText: string

    // methods
    emitClose: () => void
    submitChanges: () => void
}


let LabelEditorOptions = {
    data: function() {
        return {
            label: {
                name: (this.resourceToEdit === null) ? '' : this.resourceToEdit.name,
                colorHex: (this.resourceToEdit === null) ? 'a8c8e4' : this.resourceToEdit.colorHex,
            }
        };
    },

    computed: {
        buttonText(): string {
            if (this.resourceToEdit === null) {
                return 'Add Label';
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
            if (_.trim(this.label.name) === '') {
                return; // Nothing to be done
            }

            if (this.resourceToEdit) {
                this.$store.dispatch('updateLabel', {
                    id: this.resourceToEdit.id,
                    name: this.label.name,
                    colorHex: this.label.colorHex
                } as UpdateLabelPayload);
            } else {
                this.$store.dispatch('createLabel', {
                    name: this.label.name,
                    colorHex: this.label.colorHex
                } as CreateLabelPayload);
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
                        <color-chooser v-model="label.colorHex">

                            <template scope="props" slot="icon">
                                <i class="fa fa-tag label-icon"
                                    :style="{'color': '#' + props.colorHex}">
                                </i>
                            </template>

                        </color-chooser>

                        <input type="text"
                               v-model="label.name"
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
} as ComponentOptions<LabelEditor>;

export { LabelEditorOptions };