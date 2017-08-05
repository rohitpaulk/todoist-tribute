import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models'


interface AutocompleteBox extends Vue {
    // props
    suggestions: Project[] // TODO: Make this generic in the future
    selectionIndex: number

    // TODO: Should autocompleteQuery be moved in here?
}

let AutocompleteBoxOptions = {
    props: {
        suggestions: { required: true },
        selectionIndex: { required: true }
    },

    computed: {
        projectClasses(): any[] {
            let autocompleteBox = this;
            return _.map(autocompleteBox.suggestions, function(project: Project, index: number) {
                return {
                    'autocomplete-item': true,
                    'is-selected': (index === autocompleteBox.selectionIndex)
                }
            });
        }
    },

    methods: {
        emitSelect(index): void {
            this.$emit('select', index);
        }
    },

    template: `
        <div class="autocomplete-container">
            <div v-if="suggestions.length === 0" class="autocomplete-message">
                No items found.
            </div>
            <template v-for="(project, index) in suggestions">
                <div :class="projectClasses[index]" @click="emitSelect(index)">
                    <span class="icon-holder">
                        <span class="project-icon"
                            :style="{ 'background-color': '#' + project.colorHex }">
                        </span>
                    </span>
                    <span class="text-holder">
                        {{ project.name }}
                    </span>
                </div>
            </template>
        </div>
    `
} as ComponentOptions<AutocompleteBox>;

export { AutocompleteBoxOptions }