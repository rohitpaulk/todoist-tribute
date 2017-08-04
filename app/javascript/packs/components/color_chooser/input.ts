import Vue, { ComponentOptions } from 'vue';


interface ColorChooser extends Vue {
    // data
    isDropdownOpen: boolean

    // props
    colorHex: string

    // methods
    toggleDropdown(): void
    openDropdown(): void
    closeDropdown(): void
    handleClickOutsideDropdown(event)
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
            if (this.isDropdownOpen) {
                this.closeDropdown();
            } else {
                this.openDropdown();
            }
        },

        handleClickOutsideDropdown: function(event) {
            let dropdownHTMLElement = (this.$refs['dropdown'] as Vue).$el;
            if (!dropdownHTMLElement.contains(event.target)) {
                this.closeDropdown();
            }
        },

        openDropdown: function(): void {
            document.addEventListener('click', this.handleClickOutsideDropdown, false);
            this.isDropdownOpen = true;
        },

        closeDropdown() {
            document.removeEventListener('click', this.handleClickOutsideDropdown, false);
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
                 @click.stop="toggleDropdown()">

                 <slot name="icon" :colorHex="colorHex"></slot>
            </div>
            <color-chooser-dropdown v-if="isDropdownOpen"
                                    ref="dropdown"
                                    @select="colorSelected">
            </color-chooser-dropdown>
        </div>
    `
} as ComponentOptions<ColorChooser>;


export { ColorChooserOptions }