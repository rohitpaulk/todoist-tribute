import * as Fuse from 'fuse.js';
import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../models';
import { API } from '../API';
import { CreateTaskPayload, UpdateTaskPayload } from '../store';
import { EditorNode, ProjectPillNode, TextInputNode } from '../helpers/editor_nodes'
import { Constructors as EditorNodeConstructors } from '../helpers/editor_nodes'
import { Mutators as EditorNodeMutators } from '../helpers/editor_nodes'
import { Accessors as EditorNodeAccessors } from '../helpers/editor_nodes'

interface TaskEditor extends Vue {
    // data
    editorNodes: EditorNode[]
    autocompleteState: {
        nodePosition: number
        caretPosition: number
        activeSuggestionIndex: number
    } | null

    // prop
    initialProject: Project
    taskToEdit: Task | null

    // computed
    taskProjectId: string
    textFromEditor: string
    projectFromEditor: Project | null
    allProjects: Project[]
    isAutocompleting: boolean
    autocompleteSelection: Project // Revisit when different types are added
    autocompleteSuggestions: Project[]
    autocompleteQuery: string

    // methods
    emitClose: () => void,
    cancelAutocomplete: () => void
    completeAutocomplete: () => void
    removeAutocompleteTextFromInput: () => void
    submitChanges: () => void
    shiftAutocompleteSelectionDown: () => void
    shiftAutocompleteSelectionUp: () => void
}

let emptyEditorNodes = function(): EditorNode[] {
    return [EditorNodeConstructors.inputNodeFromText('')];
}

let editorNodesFromTask = function(task: Task): EditorNode[] {
    return [EditorNodeConstructors.inputNodeFromText(task.title)];
}

const CHAR_CODE_POUND_SIGN = 35;
const CHAR_CODE_SPACE = 32;

let taskEditorOptions = {
    name: 'task-editor',

    data: function() {
        let editorNodes: EditorNode[] = [];

        if (this.taskToEdit !== null) {
            editorNodes = editorNodesFromTask(this.taskToEdit);
        } else {
            editorNodes = emptyEditorNodes();
        }

        return {
            editorNodes: editorNodes,
            autocompleteState: null
        }
    },

    props: {
        initialProject: { required: true },
        taskToEdit: { default: null }
    },

    computed: {
        isAutocompleting: function(): boolean {
            return (this.autocompleteState !== null)
        },

        autocompleteSuggestions: function(): Project[] {
            if (this.autocompleteQuery === '') {
                return this.allProjects
            } else {
                let fuse = new Fuse(this.allProjects, {keys: ["name"]});

                return fuse.search(this.autocompleteQuery);
            }
        },

        autocompleteSelection: function(): Project {
            if (this.autocompleteState === null) {
                throw "autocompleteSelection called when not autocompleting!"
            }

            let index = this.autocompleteState.activeSuggestionIndex;
            return this.autocompleteSuggestions[index]; // What if this is null?
        },

        autocompleteQuery: function(): string {
            if (this.autocompleteState === null) {
                throw "autocompleteQuery called when not autocompleting!"
            }

            let nodePosition = this.autocompleteState.nodePosition;
            let caretPosition = this.autocompleteState.caretPosition;

            let node = EditorNodeAccessors.getTextNodeAt(this.editorNodes, nodePosition)

            // TODO: Make this better with tracking live current cursor position!
            //       If someone triggers an autocomplete in the middle of a text
            //       box, this will fail.

            return node.data.text.slice(caretPosition);
        },

        allProjects: function(): Project[] {
            return this.$store.state.projects;
        },

        taskProjectId: function(): string {
            // We consider three sources with decreasing precedence:
            //
            // 1. A project the user specified via the editor
            // 2. A project that the task already belongs to. Valid only when
            //    editing tasks.
            // 2. The initialProject prop passed in. Valid only when creating
            //    a new task.
            if (this.projectFromEditor) {
                return this.projectFromEditor.id;
            } else if (this.taskToEdit) {
                return this.taskToEdit.projectId;
            } else {
                return this.initialProject.id;
            }
        },

        projectFromEditor: function(): Project | null {
            // TODO: Revise when new types are added
            if (this.editorNodes.length > 2) {
                throw "AssertionError: More than two editor nodes present!";
            }

            let projectNode = EditorNodeAccessors.getProjectNode(this.editorNodes);

            if (projectNode) {
                return projectNode.data.project;
            } else {
                return null;
            }
        },

        textFromEditor: function(): String {
            // TODO: Revise when new types are added
            if (this.editorNodes.length > 2) {
                throw "AssertionError: More than two editor nodes present!";
            }

            let textNodes = EditorNodeAccessors.getTextNodes(this.editorNodes);

            return textNodes.map((x) => x.data.text).join(' ');
        }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
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
                    projectId: this.taskProjectId
                });
            } else {
                this.$store.dispatch('createTask', {
                    title: taskTitle,
                    projectId: this.taskProjectId
                });
            }

            // TODO: Only after promise resolves!
            this.emitClose();
        },

        backspaceOnTextInput: function(event, nodePosition: number) {
            let caretPosition = (event.target.selectionStart);
            let isDeletingPreviousElement = (caretPosition === 0);
            if (isDeletingPreviousElement) {
                this.editorNodes = EditorNodeMutators.removeNonInputNodeBefore(this.editorNodes, nodePosition);
                return;
            }

            let node = (this.editorNodes[nodePosition] as TextInputNode);
            let nextCaretPosition = caretPosition - 1;

            if (this.isAutocompleting && (nextCaretPosition <= this.autocompleteState!.caretPosition)) {
                this.cancelAutocomplete();
            }
        },

        enterOnTextInput: function() {
            if (this.isAutocompleting) {
                this.completeAutocomplete();
            } else {
                this.submitChanges();
            }
        },

        completeAutocomplete(): void {
            this.removeAutocompleteTextFromInput();

            // TODO: Revise when other types are added.
            let projectNode = EditorNodeConstructors.pillNodeFromProject(this.autocompleteSelection);
            this.editorNodes = EditorNodeMutators.addOrReplaceProjectNode(this.editorNodes, projectNode)

            this.cancelAutocomplete();
        },

        removeAutocompleteTextFromInput(): void {
            let nodePosition = this.autocompleteState!.nodePosition;
            let text = EditorNodeAccessors.getTextNodeAt(this.editorNodes, nodePosition).data.text;
            let caretPosition = this.autocompleteState!.caretPosition;
            let strippedText = text.slice(0, caretPosition - 1);

            let newNode = EditorNodeConstructors.inputNodeFromText(strippedText);
            this.editorNodes = EditorNodeMutators.replaceTextNodeAt(this.editorNodes, nodePosition, newNode);
        },

        onSelectFromAutocompleteBox(index): void {
            this.autocompleteState!.activeSuggestionIndex = index;
            this.completeAutocomplete();
        },

        keyPressOnTextInput: function(event, nodePosition: number) {
            let caretPosition = (event.target.selectionStart);
            let characterBeforeCursor = event.target.value[caretPosition-1];

            let keyIsPoundSign = (event.charCode === CHAR_CODE_POUND_SIGN);
            let previousCharacterIsSpace = (characterBeforeCursor === ' ');
            let isValidStartPoint = previousCharacterIsSpace || (caretPosition === 0);

            if (!this.isAutocompleting && keyIsPoundSign && isValidStartPoint) {
                this.autocompleteState = {
                    nodePosition: nodePosition,
                    caretPosition: caretPosition + 1, // Why the +1?
                    activeSuggestionIndex: 0
                }

                // TODO: Disable cursor movements when autocomplete is active

                return;
            }

            if (this.isAutocompleting) {
                // Reset the active suggestion, because the user pressed a key.
                this.autocompleteState!.activeSuggestionIndex = 0;
            }

            let keyIsSpace = (event.charCode === CHAR_CODE_SPACE);
            if (this.isAutocompleting && keyIsSpace) {
                this.cancelAutocomplete();
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
        }
    },

    mounted: function() {
        (this.$refs['text-input'][0] as HTMLElement).focus();
    },

    // TODO: binding size is a hack. Better ways?
    // Only expand to 50 if this is the last input + extra space is present
    template: `
        <div class="task-editor">
            <div class="task-form">
                <form @submit.prevent="submitChanges()" @keydown.esc="emitClose()">
                    <div class="input-nodes-container">
                        <template v-for="(editorNode, nodePosition) in editorNodes">
                            <input v-if="editorNode.type === 'TextInputNode'"
                                type="text"
                                class="text-input"
                                ref="text-input"
                                v-model="editorNode.data.text"
                                :size="Math.max(editorNode.data.text.length, 50)"
                                @keydown.delete="backspaceOnTextInput($event, nodePosition)"
                                @keydown.enter.prevent="enterOnTextInput($event, nodePosition)"
                                @keydown.down.prevent="shiftAutocompleteSelectionDown()"
                                @keydown.up.prevent="shiftAutocompleteSelectionUp()"
                                @keypress="keyPressOnTextInput($event, nodePosition)">
                            </input>
                            <div class="project-pill"
                                v-if="editorNode.type === 'ProjectPillNode'">
                                <i class="fa fa-folder-o"></i> {{ editorNode.data.project.name }}
                            </div>
                        </template>

                        <autocomplete-box
                            v-if="isAutocompleting"
                            :suggestions="autocompleteSuggestions"
                            :selection-index="autocompleteState.activeSuggestionIndex"
                            @select="onSelectFromAutocompleteBox(index)">
                        </autocomplete-box>
                    </div>

                    <button type="submit">Add Task</button>
                    <a href="#" class="cancel-link" @click="emitClose()">Cancel</a>
                </form>
            </div>
        </div>
    `
} as ComponentOptions<TaskEditor>

export { taskEditorOptions as TaskEditorOptions }
export { TaskEditor }
