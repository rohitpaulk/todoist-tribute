import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';
import { API } from '../API';
import * as _ from 'lodash';

interface ProjectList extends Vue {
    // props
    projects: Project[],
    selectedProject: Project,
    projectTaskCounts: {[key: string]: number}
}

let projectListOptions = {
    data: function() {
        return {
            dragState: null
        }
    },

    props: {
        projects: { required: true },
        selectedProject: { required: true }, // Should this be required?
        projectTaskCounts: { required: true }
    },

    computed: {
        projectItemClasses: function() {
            let classObjectMap = {};
            let selectedProject = this.selectedProject;

            // TODO: Is there a more functional way to do this?
            //       i.e. return [task_id, {}] and then turn into a Map?
            _.forEach(this.projects, function(project: Project) {
                classObjectMap[project.id] = {
                    'project-item': true,
                    'resource-item': true,
                    'is-selected': project.id === selectedProject.id
                };
            });

            return classObjectMap;
        }
    },

    created: function() {
        this.$store.dispatch('refreshProjects');
    },

    methods: {
        setProject: function(project: Project) {
            this.$store.commit('setActiveProject', project);
        }
    },

    template: `
        <div>
            <ul class="project-list resource-list">
                <li v-for="project in projects"
                    :class="projectItemClasses[project.id]"
                    @click="setProject(project)">
                    <span class="icon-holder">
                        <span class="project-icon"
                            :style="{ 'background-color': '#' + project.colorHex }">
                        </span>
                    </span>
                    <span class="text-holder">
                        <span class="project-title">
                            {{ project.name }}
                            <span class="counter">
                                {{ projectTaskCounts[project.id] }}
                            </span>
                        </span>
                    </span>
                </li>
            </ul>
        </div>
    ` // TODO: Add project editor!
} as ComponentOptions<ProjectList>

export { projectListOptions as ProjectListOptions }