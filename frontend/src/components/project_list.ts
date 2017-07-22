import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';
import { API } from '../API';
import * as _ from 'lodash';

interface ProjectList extends Vue {
    // computed
    projects: Project[] // Pulled from global store
}

let projectListOptions = {
    data: function() {
        return {
            dragState: null
        }
    },

    computed: {
        projects(): Project[] {
            return this.$store.state.projects;
        },
    },

    created: function() {
        this.$store.dispatch('refreshProjects');
    },

    methods: {},

    template: `
        <div>
            <ul class="project-list resource-item-list">
                <li v-for="project in projects">
                    <span class="icon-holder">
                        <span class="project-icon">
                        </span>
                    </span>
                    <span class="text-holder">
                        <span class="project-title">
                            {{ project.name }}
                        </span>
                    </span>
                </li>
            </ul>
        </div>
    ` // TODO: Add project editor!
} as ComponentOptions<ProjectList>

export { projectListOptions as ProjectListOptions }