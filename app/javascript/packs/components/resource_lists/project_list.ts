import Vue, { ComponentOptions } from 'vue';

import { Project } from '../../models';


interface ProjectList extends Vue {
    // props
    projects: Project[],
    selectedProject: Project,
    projectTaskCounts: {[key: string]: number}
}

let ProjectListOptions = {
    props: {
        projects: {required: true},
        selectedProject: {required: true},
        projectTaskCounts: {required: true}
    },

    methods: {
        setActiveScope(project: Project) {
            this.$store.commit('setActiveScope', {
                type: "project",
                resource: project
            });
        }
    },

    template: `
        <base-resource-list
            editor-component="project-editor"
            @click="setActiveScope"
            :resources="projects"
            :selected-resource="selectedProject"
            :resource-task-counts="projectTaskCounts"
            resource-name="Project"
            :resource-actions="{
                reorder: 'reorderProjects',
                delete: 'deleteProject'
            }">

            <template scope="props" slot="icon">
                <span class="project-icon"
                      :style="{ 'background-color': '#' + props.resource.colorHex }">
                </span>
            </template>
        </base-resource-list>
    `
} as ComponentOptions<ProjectList>;


export { ProjectListOptions }