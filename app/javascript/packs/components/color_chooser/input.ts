import Vue, { ComponentOptions } from 'vue';


interface ColorChooser extends Vue {
    // data
    isDropdownOpen: boolean

    // props
    colorHex: string

    // methods
    toggleDropdown(): void
    closeDropdown(): void
}


let ColorChooserOptions = {
    model: {
        prop: "colorHex",
        event: "change"
    },

    props: {
        colorHex: { required: true }
    },

    data() {
        return {
            isDropdownOpen: false
        }
    },

    methods: {
        toggleDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen;
        },

        closeDropdown() {
            this.isDropdownOpen = false;
        },

        colorSelected(colorHex) {
            this.closeDropdown();
            this.$emit('change', colorHex); // For v-model
        }
    },

    template: `
        <div class="color-chooser">
            <div class="color-chooser-toggle"
                 @click.prevent="toggleDropdown()">

                 <slot name="icon" :colorHex="colorHex"></slot>
            </div>
            <color-chooser-dropdown v-if="isDropdownOpen"
                @select="colorSelected">
            </color-chooser-dropdown>
        </div>
    `
} as ComponentOptions<ColorChooser>;


export { ColorChooserOptions }