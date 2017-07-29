import * as Fuse from 'fuse.js';
import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../models';
import { API } from '../API';
import { CreateTaskPayload, UpdateTaskPayload } from '../store';
import { EditorNode, ProjectPillNode, TextInputNode } from '../helpers/editor_nodes'
import { Constructors as EditorNodeConstructors } from '../helpers/editor_nodes'
import { Mutators as EditorNodeMutators } from '../helpers/editor_nodes'

interface TaskEditor extends Vue {
    // data
    editorNodes: EditorNode[]
    autocompleteState: {
        nodePosition: number // Not really needed now, will come in handy later
        caretPosition: number
        activeSuggestionIndex: number
    } | null

    // prop
    initialProject: Project
    taskToEdit: Task | null

    // computed
    taskTitle: string
    taskProject: Project
    textInputNode: TextInputNode
    projectPillNode: ProjectPillNode | null
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

let emptyEditorNodes = function(project: Project): EditorNode[] {
    return [EditorNodeConstructors.textInputNodeFromText('')];
}

let editorNodesFromTask = function(task: Task, project: Project): EditorNode[] {
    return [EditorNodeConstructors.textInputNodeFromText(task.title)];
}

const CHAR_CODE_POUND_SIGN = 35;
const CHAR_CODE_SPACE = 32;

let taskEditorOptions = {
    name: 'task-editor',

    data: function() {
        let editorNodes: EditorNode[] = [];

        if (this.taskToEdit !== null) {
            editorNodes = editorNodesFromTask(this.taskToEdit, this.initialProject);
        } else {
            editorNodes = emptyEditorNodes(this.initialProject);
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

            let node = this.textInputNode;
            let caretPosition = this.autocompleteState.caretPosition;

            // TODO: Make this better with tracking live current cursor position!
            //       If someone triggers an autocomplete in the middle of a text
            //       box, this will fail.

            return this.textInputNode.data.text.slice(caretPosition);
        },

        allProjects: function(): Project[] {
            return this.$store.state.projects;
        },

        taskTitle: function(): String {
            return this.textInputNode.data.text;
        },

        taskProject: function() {
            if (this.projectPillNode !== null) {
                return this.projectPillNode.data.project;
            } else {
                return this.initialProject;
            }
        },

        textInputNode: function(): TextInputNode {
            if (this.editorNodes.length > 2) {
                throw "AssertionError: More than two editor nodes present!";
            }

            if (this.editorNodes.length === 1) {
                return this.editorNodes[0] as TextInputNode;
            } else {
                return this.editorNodes[1] as TextInputNode;
            }
        },

        projectPillNode: function(): ProjectPillNode | null {
            if (this.editorNodes.length > 2) {
                throw "AssertionError: More than two editor nodes present!";
            }

            if (this.editorNodes.length === 2) {
                return this.editorNodes[0] as ProjectPillNode;
            } else {
                return null;
            }
        }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
        },

        submitChanges: function() {
            // Validate task properties
            if (_.trim(this.taskTitle) === '') {
                alert('empty!');
                return;
            }

            if (this.taskToEdit) {
                this.$store.dispatch('updateTask', {
                    id: this.taskToEdit.id,
                    title: this.taskTitle,
                    project: this.taskProject
                });
            } else {
                this.$store.dispatch('createTask', {
                    title: this.taskTitle,
                    project: this.taskProject
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
            let lastChar = _.last(Array.from(node.data.text))
            let nextCaretPosition = caretPosition - 1;

            // If the selection wasn't at the start, then there must be SOME content
            if (typeof(lastChar) === undefined) {
                throw "AssertionError: Expected atleast one character to be present"
            }

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
            // TODO: Revise when other types are added.
            let projectNode = EditorNodeConstructors.projectPillNodeFromProject(this.autocompleteSelection);
            this.editorNodes = EditorNodeMutators.addOrReplaceProjectNode(this.editorNodes, projectNode)

            this.removeAutocompleteTextFromInput();
            this.cancelAutocomplete();
        },

        removeAutocompleteTextFromInput(): void {
            let node = this.textInputNode; // TODO: Revise when other types are added
            let caretPosition = this.autocompleteState!.caretPosition;
            let strippedText = node.data.text.slice(0, caretPosition - 1);

            this.editorNodes = EditorNodeMutators.replaceTextInTextInputNode(this.editorNodes, strippedText);
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
