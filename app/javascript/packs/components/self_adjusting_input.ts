import Vue, { ComponentOptions } from 'vue';


interface SelfAdjustingInput extends Vue {
    // props
    value: string

    // data
    lastKnownWidth: number | null

    // methods
    focus: () => void
}

let selfAdjustingInputOptions = {
    props: {
        value: { required: true },
        pixelsAhead: { default: 0 }
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
        },

        focus: function() {
            let inputEl = this.$refs['text-input'] as HTMLInputElement;
            inputEl.focus();
        },

        onInput: function(event) {
            this.$emit('input', event.target.value);
        },

        emitEvent: function(eventName, event) {
            this.$emit(eventName, event)
        }
    },

    computed: {
        inputStyles: function() {
            return {
                width: ((this.lastKnownWidth || 2) + this.pixelsAhead) + "px"
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
        <span class="self-adjusting-input">
            <input
                class="text-input"
                type="text"
                ref="text-input"
                v-bind:style="inputStyles"

                v-bind:value="value"
                v-on:input="onInput"

                v-on:keypress="emitEvent('keypress', $event)"
                v-on:click="emitEvent('click', $event)"
                v-on:keydown="emitEvent('keydown', $event)"
                /><!--
            --><div
                class="fake-text-input"
                ref="fake-text-input"
                v-text="value">
            </div>
        </span>
    `
} as ComponentOptions<SelfAdjustingInput>;


export { selfAdjustingInputOptions as SelfAdjustingInputOptions }
export { SelfAdjustingInput };
