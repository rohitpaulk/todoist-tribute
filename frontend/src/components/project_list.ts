import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';
import { API } from '../API';
import { DragEventHandlers, DragState, getOrderedItems } from '../helpers/drag_state';

interface ProjectList extends Vue {
    // props
    projects: Project[],
    selectedProject: Project,
    projectTaskCounts: {[key: string]: number}

    // data
    dragState?: DragState
    dragOperationInProgress: boolean
}

let projectListOptions = {
    data: function() {
        return {
            dragState: undefined,
            dragOperationInProgress: false
        }
    },

    props: {
        projects: { required: true },
        selectedProject: { required: true }, // Should this be required?
        projectTaskCounts: { required: true }
    },

    computed: {
        localProjects(): Project[] {
            if (this.dragState === undefined) {
                return this.projects;
            } else {
                return getOrderedItems(this.projects, this.dragState) as Project[];
            }
        },

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
        },

        onDragStart: function(event, draggedProject: Project): boolean {
            event.dataTransfer.setData('tudu/x-task', draggedProject.id);
            event.dataTransfer.setDragImage(event.target.parentNode, 0, 0);

            this.dragState = DragEventHandlers.dragStart(this.projects, draggedProject);

            return false;
        },

        onDragEnter: function(event, currentProject: Project): boolean {
            let taskList = this;
            if (!_.includes(event.dataTransfer.types, 'tudu/x-task')) {
                return true;
            }

            this.dragState = DragEventHandlers.dragEnter(this.dragState!, currentProject);

            return false;
        },

        onDrop(event) {
            let projectList = this;
            let order = this.dragState!.currentOrder;

            projectList.dragOperationInProgress = true;
            this.$store.dispatch('reorderProjects', order).then(function() {
                projectList.dragState = undefined;
                projectList.dragOperationInProgress = false;
            });
        },

        onDragEnd: function() {
            if ((this.dragState === undefined) || (this.dragOperationInProgress)) {
                // The drop either sucessfully happened, or is in progress.
            } else {
                // The drag was aborted halfway
                this.dragState = undefined;
            }
        }
    },

    template: `
        <div>
            <ul class="project-list resource-list">
                <li v-for="project in localProjects"
                    :class="projectItemClasses[project.id]"
                    @click="setProject(project)"
                    @drop="onDrop($event)"
                    @dragover.prevent
                    @dragenter="onDragEnter($event, project)">

                    <span class="dragbars-holder"
                          draggable="true"
                          @dragstart="onDragStart($event, project)"
                          @dragend="onDragEnd()">
                        <i class="fa fa-bars drag-bars"></i>
                    </span>

                    <span class="icon-holder">
                        <span class="project-icon"
                            :style="{ 'background-color': '#' + project.colorHex }">
                        </span>
                    </span>
                    <span class="text-holder">
                        <span class="project-title">
                            {{ project.name }}
                        </span>
                        <span class="counter" v-if="projectTaskCounts[project.id] !== 0">
                            {{ projectTaskCounts[project.id] }}
                        </span>
                    </span>
                </li>
            </ul>
        </div>
    ` // TODO: Add project editor!
} as ComponentOptions<ProjectList>

export { projectListOptions as ProjectListOptions }