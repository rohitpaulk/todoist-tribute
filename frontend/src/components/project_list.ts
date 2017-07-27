import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';
import { API } from '../API';
import { DragEventHandlers, DragState, getOrderedItems } from '../helpers/drag_state';

interface ProjectList extends Vue {
    // props
    projects: Project[]
    selectedProject: Project
    projectTaskCounts: {[key: string]: number}

    // data
    dragState?: DragState
    dragOperationInProgress: boolean
    isAddingProject: boolean
    dropdownActiveOn: Project | null

    // methods
    showProjectForm(): void
    hideProjectForm(): void
    resetDropdown(): void
}

let projectListOptions = {
    data: function() {
        return {
            dragState: undefined,
            dragOperationInProgress: false,
            isAddingProject: false,
            dropdownActiveOn: null
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
        },

        showProjectForm: function() {
            this.isAddingProject = true;
        },

        hideProjectForm: function() {
            this.isAddingProject = false;
        },

        deleteProject(project: Project) {
            this.resetDropdown();
            alert('Deleting project');
        },

        editProject(project: Project) {
            this.resetDropdown();
            alert('Editing project');
        },

        toggleDropdown: function(project: Project) {
            if (this.dropdownActiveOn) {
                this.resetDropdown();
            } else {
                this.dropdownActiveOn = project;
            }
        },

        resetDropdown: function(): void {
            this.dropdownActiveOn = null;
        }
    },

    template: `
        <div>
            <ul class="project-list resource-list">
                <li v-for="(project, index) in localProjects"
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

                    <span class="dropdown-container" @click.stop="toggleDropdown(project)">
                        <span :class="{'dropdown-toggle': true, 'is-active': dropdownActiveOn && (dropdownActiveOn.id == project.id)}">
                            <i class="fa fa-ellipsis-h"></i>
                        </span>
                        <div class="dropdown" v-if="dropdownActiveOn && (dropdownActiveOn.id == project.id)">
                            <ul class="dropdown-options">
                                <li class="dropdown-option" @click.stop="editProject(project)">
                                    Edit Project
                                </li>
                                <li class="dropdown-option" @click.stop="deleteProject(project)">
                                    Delete Project
                                </li>
                            </ul>
                        </div>
                    </span>

                </li>
            </ul>

            <project-editor
                v-if="isAddingProject"
                @close="hideProjectForm()">
            </project-editor>
            <div v-else class="add-project" @click="showProjectForm()">
                <span class="icon-holder">
                    <span class="add-icon">
                        +
                    </span>
                </span>
                <span class="text-holder">
                    <a href="#" class="add-project-link">Add Project</a>
                </span>
            </div>
        </div>
    `
} as ComponentOptions<ProjectList>

export { projectListOptions as ProjectListOptions }