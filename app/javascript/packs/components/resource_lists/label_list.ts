import Vue, { ComponentOptions } from 'vue';

import { Label } from '../../models';


interface LabelList extends Vue {
    // props
    labels: Label[],
    selectedLabel: Label,
    labelTaskCounts: {[key: string]: number}
}

let LabelListOptions = {
    props: {
        labels: {required: true},
        selectedLabel: {required: true},
        labelTaskCounts: {required: true}
    },

    methods: {
        setActiveScope(label: Label) {
            this.$store.commit('setActiveScope', {
                type: "label",
                resource: label
            });
        }
    },

    template: `
        <base-resource-list
            editor-component="label-editor"
            @click="setActiveScope"
            :resources="labels"
            :selected-resource="selectedLabel"
            :resource-task-counts="labelTaskCounts"
            resource-name="Label"
            :resource-actions="{
                reorder: 'reorderLabels',
                delete: 'deleteLabel'
            }">

            <template scope="props" slot="icon">
                <i class="fa fa-tag label-icon"
                    :style="{'color': '#' + props.resource.colorHex}">
                </i>
            </template>
        </base-resource-list>
    `
} as ComponentOptions<LabelList>;


export { LabelListOptions }