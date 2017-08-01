import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Project } from '../models';
import { API } from '../API';
import { DragEventHandlers, DragState, getOrderedItems } from '../helpers/drag_state';
import { Scope, ScopeType } from '../store';

interface Resource {
    id: string
}

interface ComponentProps {
    // The type of scope that the resources in this list can activate.
    scopeType: ScopeType

    // The component to be used as an editor for creating/updating resources.
    //
    // Must implement the following properties:
    //   - Send a 'close' event when closing.
    //   - Accept a resource-to-edit property.
    editorComponent: string

    resources: Resource[]
    selectedResource: Resource
    resourceTaskCounts: {[key: string]: number}
}

interface ComponentData {
    isAddingResource: boolean
    resourceBeingEdited: Resource | null
    dropdownActiveOn: Project | null
    dragState?: DragState
    dragOperationInProgress: boolean
}

interface ResourceList extends Vue, ComponentProps, ComponentData {
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
        resourceTaskCounts: { required: true },
        editorComponent: { required: true },
        scopeType: { required: true }
    },

    computed: {
        localResources(): Resource[] {
            if (this.dragState === undefined) {
                return this.resources;
            } else {
                return getOrderedItems(this.resources, this.dragState) as Resource[];
            }
        },

        resourceItemClasses: function() {
            let classObjectMap = {};
            let selectedResource = this.selectedResource;

            // TODO: Is there a more functional way to do this?
            //       i.e. return [task_id, {}] and then turn into a Map?
            _.forEach(this.resources, function(resource: Resource) {
                classObjectMap[resource.id] = {
                    'project-item': true, // TODO: Extract?
                    'resource-item': true,
                    'is-selected': resource.id === selectedResource.id
                };
            });

            return classObjectMap;
        }
    },

    created: function() {
        // TODO: Move to parent?
        this.$store.dispatch('refreshProjects');
    },

    methods: {
        setActiveScope: function(resource: Resource) {
            this.$store.commit('setActiveScope', {
                type: this.scopeType,
                resource: resource
            });
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
                <template v-for="(resource, index) in localResources">
                    <component v-if="resourceBeingEdited && (resourceBeingEdited.id === resource.id)"
                               :is="editorComponent"
                               @close="closeEditorForUpdate()"
                               :resource-to-edit="resource">
                    </component>
                    <li v-else
                        :class="resourceItemClasses[resource.id]"
                        @click="setActiveScope(resource)"
                        @drop="onDrop($event)"
                        @dragover.prevent
                        @dragenter="onDragEnter($event, resource)">

                        <span class="dragbars-holder"
                            draggable="true"
                            @dragstart="onDragStart($event, resource)"
                            @dragend="onDragEnd()">
                            <i class="fa fa-bars drag-bars"></i>
                        </span>

                        <span class="icon-holder">
                            <span class="project-icon"
                                :style="{ 'background-color': '#' + resource.colorHex }">
                            </span>
                        </span>
                        <span class="text-holder">
                            <span class="project-title">
                                {{ resource.name }}
                            </span>
                            <span class="counter" v-if="resourceTaskCounts[resource.id] !== 0">
                                {{ resourceTaskCounts[resource.id] }}
                            </span>
                        </span>

                        <span class="dropdown-container" @click.stop="toggleDropdown(resource)">
                            <span :class="{'dropdown-toggle': true, 'is-active': dropdownActiveOn && (dropdownActiveOn.id == resource.id)}">
                                <i class="fa fa-ellipsis-h"></i>
                            </span>
                            <div class="dropdown" v-if="dropdownActiveOn && (dropdownActiveOn.id == resource.id)">
                                <ul class="dropdown-options">
                                    <li class="dropdown-option"
                                        @click.stop="toggleDropdown(resource);
                                                     openEditorForUpdate(resource)">
                                        Edit Project
                                    </li>
                                    <li class="dropdown-option"
                                        @click.stop="toggleDropdown(resource);
                                                     deleteProject(resource)">
                                        Delete Project
                                    </li>
                                </ul>
                            </div>
                        </span>

                    </li>
                </template>
            </ul>

            <component v-if="isAddingResource"
                       :is="editorComponent"
                       @close="closeEditorForCreate()">
            </component>
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