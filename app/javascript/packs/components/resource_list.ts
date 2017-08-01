import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';
import { API } from '../API';
import { DragEventHandlers, DragState, getOrderedItems } from '../helpers/drag_state';

interface Resource {
    id: string
}

interface ResourceList extends Vue {
    // props
    resources: Resource[]
    selectedResource: Resource
    resourceTaskCounts: {[key: string]: number}

    // data
    isAddingResource: boolean
    resourceBeingEdited: Resource | null
    dropdownActiveOn: Project | null
    dragState?: DragState
    dragOperationInProgress: boolean

    // methods
    openEditorForCreate(): void
    closeEditorForCreate(): void
    openEditorForUpdate(resource: Resource): void
    closeEditorForUpdate(): void
    resetDropdown(): void
}

let resourceListOptions = {
    data: function() {
        return {
            isAddingResource: false,
            resourceBeingEdited: null,
            dropdownActiveOn: null,
            dragState: undefined,
            dragOperationInProgress: false
        }
    },

    props: {
        resources: { required: true },
        selectedResource: { required: true }, // Should this be required?
        resourceTaskCounts: { required: true }
    },

    computed: {
        localResources(): Resource[] {
            if (this.dragState === undefined) {
                return this.resources;
            } else {
                return getOrderedItems(this.resources, this.dragState) as Project[];
            }
        },

        projectItemClasses: function() {
            let classObjectMap = {};
            let selectedResource = this.selectedResource;

            // TODO: Is there a more functional way to do this?
            //       i.e. return [task_id, {}] and then turn into a Map?
            _.forEach(this.resources, function(project: Project) {
                classObjectMap[project.id] = {
                    'project-item': true,
                    'resource-item': true,
                    'is-selected': project.id === selectedResource.id
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

            this.dragState = DragEventHandlers.dragStart(this.resources, draggedProject);

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

        openEditorForCreate() {
            this.isAddingResource = true;
        },

        closeEditorForCreate() {
            this.isAddingResource = false;
        },

        openEditorForUpdate(resource: Resource) {
            this.resourceBeingEdited = resource;
        },

        closeEditorForUpdate() {
            this.resourceBeingEdited = null;
        },

        deleteProject(project: Project) {
            this.resetDropdown();
            this.$store.dispatch('deleteProject', project.id);

            // TODO: Switch out TaskList with Inbox?
        },

        editProject(project: Project) {
            this.resetDropdown();

            this.resourceBeingEdited = project;
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
            <ul class="resource-list">
                <template v-for="(project, index) in localResources">
                    <project-editor v-if="resourceBeingEdited && (resourceBeingEdited.id === project.id)"
                                    @close="closeEditorForUpdate()"
                                    :project-to-edit="project">
                    </project-editor>
                    <li v-else
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
                            <span class="counter" v-if="resourceTaskCounts[project.id] !== 0">
                                {{ resourceTaskCounts[project.id] }}
                            </span>
                        </span>

                        <span class="dropdown-container" @click.stop="toggleDropdown(project)">
                            <span :class="{'dropdown-toggle': true, 'is-active': dropdownActiveOn && (dropdownActiveOn.id == project.id)}">
                                <i class="fa fa-ellipsis-h"></i>
                            </span>
                            <div class="dropdown" v-if="dropdownActiveOn && (dropdownActiveOn.id == project.id)">
                                <ul class="dropdown-options">
                                    <li class="dropdown-option" @click.stop="openEditorForUpdate(project)">
                                        Edit Project
                                    </li>
                                    <li class="dropdown-option" @click.stop="deleteProject(project)">
                                        Delete Project
                                    </li>
                                </ul>
                            </div>
                        </span>

                    </li>
                </template>
            </ul>

            <project-editor
                v-if="isAddingResource"
                @close="closeEditorForCreate()">
            </project-editor>
            <div v-else class="add-project" @click="openEditorForCreate()">
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
} as ComponentOptions<ResourceList>

export { resourceListOptions as ResourceListOptions }