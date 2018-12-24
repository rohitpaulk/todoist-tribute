import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';
import { API } from '../API';
import * as _ from 'lodash';

// TODO: When implementing views, avoid project terminology.
interface ViewList extends Vue {
    // props
    inboxProject: Project,
    inboxProjectTaskCount: number,
    selectedProjectId: string
}

let viewListOptions = {
    data: function() {
        return {}
    },

    props: {
        inboxProject: { required: true },
        inboxProjectTaskCount: { required: true },
        selectedProjectId: { required: true } // Should this be required?
    },

    computed: {
        inboxItemClass: function() {
            return {
                'view-link': true,
                'is-selected': this.inboxProject.id === this.selectedProjectId
            };
        }
    },

    methods: {
        setInboxAsActiveProject() {
            this.$store.commit('setActiveScope', {
                type: "project",
                resource: this.inboxProject
            });
        }
    },

    template: `
        <div>
            <a v-if="inboxProject"
                :class="inboxItemClass"
                href="#"
                @click="setInboxAsActiveProject()">
                <span class="icon">
                    <i class="fa fa-envelope-o"></i>
                </span>
                <span class="title">
                    <span class="text">{{ inboxProject.name }}</span>
                    <span class="counter" v-if="inboxProjectTaskCount !== 0">
                        {{ inboxProjectTaskCount }}
                    </span>
                </span>
            </a>
        </div>
    ` // TODO: Add project editor!
} as ComponentOptions<ViewList>

export { viewListOptions as ViewListOptions }
