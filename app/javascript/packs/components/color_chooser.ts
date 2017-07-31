import Vue, { ComponentOptions } from 'vue';


interface ColorChooser extends Vue {
    colors: string[]
    emitSelect(colorHex: string): void
}

let ColorChooserOptions = {
    props: {
        colors: { default: ['555', '630', '396'] }
    },

    methods: {
        emitSelect(colorHex: string) {
            this.$emit('select', colorHex);
        }
    },

    template: `
        <div class="color-chooser">
            <ul class="color-list">
                <li v-for="colorHex in colors"
                    class="color-list-item"
                    @click.prevent="emitSelect(colorHex)"
                    :style="{'background-color': '#' + colorHex }">
                </li>
            </ul>
        </div>
    `,


} as ComponentOptions<ColorChooser>;

export { ColorChooserOptions }