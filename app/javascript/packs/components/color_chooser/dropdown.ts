import Vue, { ComponentOptions } from 'vue';


interface ColorChooserDropdown extends Vue {
    colors: string[]
    emitSelect(colorHex: string): void
}

let ColorChooserDropdownOptions = {
    props: {
        colors: {
            default(): string[] {
                return [
                    '95EF63', 'FF8581', 'FFC471', 'F9EC75', 'A8C8E4', 'D2B8A3',
                    'E2A8E4', 'CCCCCC', 'FB886E', 'FFCC00', '74E8D3', '3BD5FB',
                    'DC4FAD', 'AC193D', 'D24726', '82BA00', '03B3B2', '008299',
                    '5DB2FF', '0072C6', '000000', '777777'
                ]
            }
        }
    },

    methods: {
        emitSelect(colorHex: string) {
            this.$emit('select', colorHex);
        }
    },

    template: `
        <div class="color-chooser-dropdown">
            <ul class="color-list">
                <li v-for="colorHex in colors"
                    class="color-list-item"
                    @click.prevent="emitSelect(colorHex)"
                    :style="{'background-color': '#' + colorHex }">
                </li>
            </ul>
        </div>
    `,


} as ComponentOptions<ColorChooserDropdown>;

export { ColorChooserDropdownOptions }