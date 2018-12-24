import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../models';
import { API } from '../API';
import { SelfAdjustingInput } from './self_adjusting_input';
import { CreateTaskPayload, UpdateTaskPayload } from '../store';
import { EditorNode, EditorNodeList, LabelPillNode, TextInputNode } from '../helpers/editor_nodes'
import { Constructors as EditorNodeConstructors } from '../helpers/editor_nodes'
import { Mutators as EditorNodeMutators } from '../helpers/editor_nodes'
import { Accessors as EditorNodeAccessors } from '../helpers/editor_nodes'
import { AutocompleteState, AutocompleteDefinition, AutocompleteSuggestion } from '../helpers/autocomplete';
import { getAutocompleteSuggestions } from '../helpers/autocomplete';
import { AutocompleteEventHandlers } from '../helpers/autocomplete';
import { EventHandlerAction } from '../helpers/event_handler_actions';

interface TaskEditor extends Vue {
    // data
    editorNodes: EditorNodeList
    autocompleteState: AutocompleteState | null

    // prop
    initialProject: Project
    taskToEdit: Task | null
    autocompleteDefinitions: AutocompleteDefinition[]

    // computed
    taskProjectId: string
    textFromEditor: string
    projectIdFromEditor: string | null
    labelIdsFromEditor: string[]
    isAutocompleting: boolean
    autocompleteSelection: AutocompleteSuggestion
    autocompleteSuggestions: AutocompleteSuggestion[]

    // methods
    emitClose: () => void,
    emitCloseAndOpenBelow: () => void,
    cancelAutocomplete: () => void
    completeAutocomplete: () => void
    removeAutocompleteTextFromInput: () => void
    submitChanges: () => void
    shiftAutocompleteSelectionDown: () => void
    shiftAutocompleteSelectionUp: () => void
    focusActiveNode: () => void
    runEventHandlerActions: (actions: EventHandlerAction[]) => void
    getInputWidth: (nodePosition: number) => number
    setInputWidth: (nodePosition: number, width: number) => void
}

let emptyEditorNodes = function(): EditorNode[] {
    return [EditorNodeConstructors.inputNodeFromText('')];
}

let editorNodesFromTask = function(task: Task, store): EditorNode[] {
    let labels = store.getters.labelsFromIds(task.labelIds);
    let nodes: EditorNode[] = _.flatMap(labels, function(label) {
        return [
            EditorNodeConstructors.inputNodeFromText(''),
            EditorNodeConstructors.pillNodeFromLabel(label),
        ];
    });

    nodes.push(EditorNodeConstructors.inputNodeFromText(task.title));

    return nodes;
}

let taskEditorOptions = {
    name: 'task-editor',

    data: function() {
        let nodes: EditorNode[];

        if (this.taskToEdit !== null) {
            // TODO: Find way around passing store
            nodes = editorNodesFromTask(this.taskToEdit, this.$store);
        } else {
            nodes = emptyEditorNodes();
        }

        return {
            editorNodes: {nodes: nodes, activeNodeIndex: nodes.length - 1},
            autocompleteState: null
        }
    },

    props: {
        initialProject: { },
        taskToEdit: { default: null },
        autocompleteDefinitions: { default: () => [] }
    },

    computed: {
        isAutocompleting: function(): boolean {
            return (this.autocompleteState !== null)
        },

        autocompleteSuggestions: function(): AutocompleteSuggestion[] {
            if (!this.autocompleteState) {
                throw "AssertionError: autocompleteSuggestions() called when not active"
            }

            return getAutocompleteSuggestions(this.autocompleteDefinitions, this.autocompleteState, this.editorNodes)
        },

        autocompleteSelection: function(): AutocompleteSuggestion {
            if (this.autocompleteState === null) {
                throw "autocompleteSelection called when not autocompleting!"
            }

            let index = this.autocompleteState.activeSuggestionIndex;
            return this.autocompleteSuggestions[index]; // What if this is null?
        },

        taskProjectId: function(): string {
            // We consider three sources with decreasing precedence:
            //
            // 1. A project the user specified via the editor
            // 2. A project that the task already belongs to. Valid only when
            //    editing tasks.
            // 2. The initialProject prop passed in. Valid only when creating
            //    a new task.
            if (this.projectIdFromEditor) {
                return this.projectIdFromEditor;
            } else if (this.taskToEdit) {
                return this.taskToEdit.projectId;
            } else {
                return this.initialProject.id;
            }
        },

        projectIdFromEditor: function(): string | null {
            let projectNode = EditorNodeAccessors.getProjectNode(this.editorNodes);

            if (projectNode) {
                return projectNode.data.project.id;
            } else {
                return null;
            }
        },

        labelIdsFromEditor: function(): string[] {
            let labelNodes = EditorNodeAccessors.getLabelNodes(this.editorNodes);

            return labelNodes.map((x) => x.data.label.id);
        },

        textFromEditor: function(): String {
            let textNodes = EditorNodeAccessors.getTextNodes(this.editorNodes);

            return textNodes.map((x) => x.data.text).join(' ');
        },

        buttonText(): string {
            if (this.taskToEdit === null) {
                return 'Add Task';
            } else {
                return 'Save';
            }
        }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
        },

        emitCloseAndOpenBelow: function() {
            this.$emit('closeAndOpenBelow');
        },

        submitChanges: function() {
            let taskTitle = _.trim(this.textFromEditor);

            // Validate task properties
            if (taskTitle === '') {
                alert('empty!');
                return;
            }

            if (this.taskToEdit) {
                this.$store.dispatch('updateTask', {
                    id: this.taskToEdit.id,
                    title: taskTitle,
                    projectId: this.taskProjectId,
                    labelIds: this.labelIdsFromEditor
                });

                // TODO: Only after promise resolves!
                this.emitClose();
            } else {
                this.$store.dispatch('createTask', {
                    title: taskTitle,
                    projectId: this.taskProjectId,
                    labelIds: this.labelIdsFromEditor
                });

                // TODO: Only after promise resolves!
                this.emitCloseAndOpenBelow();
            }
        },

        completeAutocomplete(): void {
            let actions = AutocompleteEventHandlers.onIntentToComplete(
                this.autocompleteDefinitions,
                this.autocompleteState!,
                this.editorNodes
            )

            this.runEventHandlerActions(actions);
        },

        runEventHandlerActions(actions: EventHandlerAction[]): void {
            let taskEditor = this;
            _.each(actions, function(action) {
                if (action.type === 'cancel_autocomplete') {
                    taskEditor.cancelAutocomplete();
                }

                if (action.type === 'update_autocomplete_state') {
                    taskEditor.autocompleteState = action.state;
                }

                if (action.type === 'update_editor_nodes') {
                    taskEditor.editorNodes = action.editorNodes;
                }
            });
        },

        onSelectFromAutocompleteBox(index): void {
            this.autocompleteState!.activeSuggestionIndex = index;
            this.completeAutocomplete();
        },

        keyPressOnTextInput: function(event, nodePosition: number) {
            let actions: EventHandlerAction[] = [];

            if (this.isAutocompleting) {
                actions = AutocompleteEventHandlers.onKeyPressWhileAutocompleting(
                    event,
                    this.autocompleteState!
                );
            } else {
                actions = AutocompleteEventHandlers.onKeyPress(
                    event,
                    this.autocompleteDefinitions,
                    nodePosition,
                    this.editorNodes
                );
            }

            this.runEventHandlerActions(actions);
        },

        backspaceOnTextInput: function(event, nodePosition: number) {
            let caretPosition = (event.target.selectionStart);
            let hasActiveSelection = (caretPosition != event.target.selectionEnd);
            let cursorIsAtStart = (caretPosition === 0);
            let isDeletingPreviousElement = cursorIsAtStart && !hasActiveSelection;
            if (isDeletingPreviousElement) {
                event.preventDefault();
                this.editorNodes = EditorNodeMutators.removePillNodeBefore(this.editorNodes, nodePosition);
            }

            let node = (this.editorNodes[nodePosition] as TextInputNode);
            let nextCaretPosition = caretPosition - 1;

            if (this.isAutocompleting && (nextCaretPosition <= this.autocompleteState!.triggerPosition)) {
                this.cancelAutocomplete();
            }
        },

        leftOnTextInput: function(event, nodePosition: number) {
            let caretPosition = (event.target.selectionStart);
            let isMovingToPreviousElement = (caretPosition === 0);

            // TODO: Move to mutators
            if (this.editorNodes.activeNodeIndex !== 0 && isMovingToPreviousElement) {
                event.preventDefault();
                this.editorNodes.activeNodeIndex -= 2;
                this.focusActiveNode();
            }
        },

        rightOnTextInput: function(event, nodePosition: number) {
            // TODO: Move to mutators
            let caretPosition = (event.target.selectionStart);
            let isMovingToNextElement = (caretPosition === event.target.value.length);

            if (this.editorNodes.activeNodeIndex !== this.editorNodes.nodes.length - 1 && isMovingToNextElement) {
                event.preventDefault();
                this.editorNodes.activeNodeIndex += 2;
                this.focusActiveNode();
            }
        },

        enterOnTextInput: function() {
            if (this.isAutocompleting) {
                this.completeAutocomplete();
            } else {
                this.submitChanges();
            }
        },

        tabOnTextInput: function(event, nodePosition) {
            if (this.isAutocompleting) {
                event.preventDefault();
                this.completeAutocomplete();
            }
        },

        cancelAutocomplete() {
            this.autocompleteState = null;
        },

        shiftAutocompleteSelectionUp() {
            if (this.autocompleteState!.activeSuggestionIndex > 0) {
                this.autocompleteState!.activeSuggestionIndex--;
            }
        },

        shiftAutocompleteSelectionDown() {
            if (this.autocompleteState!.activeSuggestionIndex < (this.autocompleteSuggestions.length - 1)) {
                this.autocompleteState!.activeSuggestionIndex++;
            }
        },

        focusLastCharacter(): void {
            this.editorNodes.activeNodeIndex = this.editorNodes.nodes.length - 1;
            this.focusActiveNode();

            // Set selection to last character?
        },

        focusActiveNode(): void {
            let input = this.$refs['text-input-' + this.editorNodes.activeNodeIndex][0] as SelfAdjustingInput
            input.focus();
        },

        setActiveNode(nodePosition: number): void {
            this.editorNodes.activeNodeIndex = nodePosition;
        },

        testClick(): void {
            console.log("clicked");
        }
    },

    mounted: function() {
        this.$forceUpdate(); // Trigger updated
    },

    updated: function() {
        this.focusActiveNode();
    },

    // TODO: binding size is a hack. Better ways?
    // Only expand to 50 if this is the last input + extra space is present
    template: `
        <div class="task-editor">
            <div class="task-form">
                <form @submit.prevent="submitChanges()" @keydown.esc="emitClose()">
                    <div class="input-nodes-container" @click="focusLastCharacter()">
                        <template v-for="(editorNode, nodePosition) in editorNodes.nodes">
                            <template v-if="editorNode.type === 'TextInputNode'">
                                <self-adjusting-input
                                    :ref="'text-input-' + nodePosition"
                                    v-model="editorNode.data.text"
                                    v-bind:pixelsAhead="(nodePosition == editorNodes.activeNodeIndex) ? 8 : 2"
                                    @click.stop="setActiveNode(nodePosition)"
                                    @keydown.delete="backspaceOnTextInput($event, nodePosition)"
                                    @keydown.enter.prevent="enterOnTextInput($event, nodePosition)"
                                    @keydown.tab="tabOnTextInput($event, nodePosition)"
                                    @keydown.left="leftOnTextInput($event, nodePosition)"
                                    @keydown.right="rightOnTextInput($event, nodePosition)"
                                    @keydown.down.prevent="shiftAutocompleteSelectionDown()"
                                    @keydown.up.prevent="shiftAutocompleteSelectionUp()"
                                    @keypress="keyPressOnTextInput($event, nodePosition)" />
                            </template><!--
                            --><div class="project-pill" v-if="editorNode.type === 'ProjectPillNode'">
                                <i class="fa fa-folder-o"></i> {{ editorNode.data.project.name }}
                            </div><!--
                            --><div class="project-pill" v-if="editorNode.type === 'LabelPillNode'">
                                @{{ editorNode.data.label.name }}
                            </div>
                        </template>

                        <autocomplete-box
                            v-if="isAutocompleting"
                            :suggestions="autocompleteSuggestions"
                            :selection-index="autocompleteState.activeSuggestionIndex"
                            @select="onSelectFromAutocompleteBox(index)">
                        </autocomplete-box>
                    </div>

                    <button type="submit">{{ buttonText }}</button>
                    <a href="#" class="cancel-link" @click="emitClose()">Cancel</a>
                </form>
            </div>
        </div>
    `
} as ComponentOptions<TaskEditor>

export { taskEditorOptions as TaskEditorOptions }
export { TaskEditor }
