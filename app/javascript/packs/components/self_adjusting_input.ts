import Vue, { ComponentOptions } from 'vue';


interface SelfAdjustingInput extends Vue {
    // props
    value: string

    // data
    lastKnownWidth: number | null
}

let selfAdjustingInputOptions = {
    props: {
        value: { required: true }
    },

    data: function() {
        return {
            lastKnownWidth: null
        }
    },

    methods: {
        updateLastKnownWidth: function() {
            let fakeEl = this.$refs['fake-text-input'] as Element;
            this.lastKnownWidth = fakeEl
                .getBoundingClientRect()
                .width;
        }
    },

    computed: {
        inputStyles: function() {
            return {
                width: (this.lastKnownWidth || 2) + "px"
            }
        }
    },

    mounted: function() {
        this.updateLastKnownWidth()
    },

    updated: function() {
        this.updateLastKnownWidth()
    },

    template: `
        <div class="self-adjusting-input">
            <input
                class="text-input"
                type="text"
                v-model="value"
                v-bind:style="inputStyles" />

            <div
                class="fake-text-input"
                ref="fake-text-input"
                v-text="value">
            </div>
        </div>
    `
} as ComponentOptions<SelfAdjustingInput>;


export { selfAdjustingInputOptions as SelfAdjustingInputOptions }
export { SelfAdjustingInput };
