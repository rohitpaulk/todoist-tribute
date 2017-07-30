import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

interface ComponentProps {
    tabs: string[]
}

interface ComponentData {
    activeTab: string
}

interface TabSwitcher extends Vue, ComponentProps, ComponentData {}

let TabSwitcherOptions = {
    props: {
        tabs: {required: true}
    },

    data: function() {
        return {
            activeTab: this.tabs[0]
        };
    },

    computed: {
        tabClasses() {
            let activeTab = this.activeTab;

            // TODO: Is there a more functional way to do this?
            //       i.e. return [tab, {}] and then turn into a Map?
            let classObjectMap = {};
            _.forEach(this.tabs, function(tab: string) {
                classObjectMap[tab] = {
                    'tab': true,
                    'is-selected': tab === activeTab
                };
            });

            return classObjectMap;
        }
    },

    methods: {
        setActiveTab(tab: string) {
            this.activeTab = tab;
        }
    },

    template: `
        <div>
            <div class="tabs-container">
                <div v-for="tab in tabs"
                    :class="tabClasses[tab]"
                    @click="setActiveTab(tab)">
                    {{ tab }}
                </div>
            </div>

            <slot :name="activeTab"></slot>
        </div>
    `

} as ComponentOptions<TabSwitcher>;


export { TabSwitcherOptions }