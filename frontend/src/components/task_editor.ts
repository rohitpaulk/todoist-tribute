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
    autocompleteSelectionIndex: number

    // prop
    initialProject: Project
    taskToEdit: Task | null

    // computed
    autocompleteSelection: Project // Revisit when different types are added
    taskTitle: string
    taskProject: Project
    isAutocompleting: boolean
    textInputNodes: TextInputNode[]
    allProjects: Project[]
    autocompleteSuggestions: Project[]

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
    return [
        EditorNodeConstructors.projectPillNodeFromProject(project),
        EditorNodeConstructors.textInputNodeFromText('')
    ];
}

let editorNodesFromTask = function(task: Task, project: Project): EditorNode[] {
    return [
        EditorNodeConstructors.projectPillNodeFromProject(project),
        EditorNodeConstructors.textInputNodeFromText(task.title)
    ];
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
            autocompleteSelectionIndex: 0,
        }
    },

    props: {
        initialProject: { required: true },
        taskToEdit: { default: null }
    },

    computed: {
        autocompleteSuggestions: function(): Project[] {
            return this.allProjects;
        },

        autocompleteSelection: function(): Project {
            return this.autocompleteSuggestions[this.autocompleteSelectionIndex];
        },

        allProjects: function(): Project[] {
            return this.$store.state.projects;
        },

        taskTitle: function(): String {
            return this.textInputNodes.map(function(node: TextInputNode) {
                return node.data.text;
            }).join(' ');
        },

        taskProject: function() {
            return this.initialProject;
        },

        isAutocompleting: function(): boolean {
            let nactive = this.textInputNodes.filter(function(node: TextInputNode) {
                return node.data.autocompleteActive;
            }).length;

            // Use a single outside property instead?
            if (nactive > 1) {
                throw "AssertionError: More than one autocompleting element found"
            }

            return nactive !== 0;
        },

        textInputNodes: function(): TextInputNode[] {
            return this.editorNodes.filter(function(node: EditorNode) {
                return node.type === 'TextInputNode';
            }) as TextInputNode[];
        },

        projectPillNode: function(): ProjectPillNode | null {
            let projectPillNodes =  this.editorNodes.filter(function(node: EditorNode) {
                return node.type === 'ProjectPillNode';
            }) as ProjectPillNode[];

            if (projectPillNodes.length > 1) {
                throw "AssertionError: More than 1 project node found!";
            }

            return projectPillNodes.length == 1 ? projectPillNodes[0] : null;
        }
    },

    methods: {
        emitClose: function() {
            this.$emit('close');
        },

        submitChanges: function() {
            let taskEditor = this;

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

            if (this.isAutocompleting && (nextCaretPosition === node.data.autocompletePosition)) {
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
            // Remove text from text node
        },

        removeAutocompleteTextFromInput(): void {
            let node = this.textInputNodes[0]; // TODO: Revise when other types are added
            let strippedText = node.data.text.slice(0, node.data.autocompletePosition - 1);

            this.editorNodes = EditorNodeMutators.replaceTextInTextInputNode(this.editorNodes, strippedText);
        },

        onSelectFromAutocompleteBox(index): void {
            this.autocompleteSelectionIndex = index;
            this.completeAutocomplete();
        },

        keyPressOnTextInput: function(event, node: TextInputNode) {
            let caretPosition = (event.target.selectionStart);
            let characterBeforeCursor = event.target.value[caretPosition-1];

            let keyIsPoundSign = (event.charCode === CHAR_CODE_POUND_SIGN);
            let previousCharacterIsSpace = (characterBeforeCursor === ' ');
            let isValidStartPoint = previousCharacterIsSpace || (caretPosition === 0);

            if (!this.isAutocompleting && keyIsPoundSign && isValidStartPoint) {
                node.data.autocompleteActive = true;
                node.data.autocompletePosition = caretPosition + 1;
                // TODO: Disable cursor movements when autocomplete is active

                return;
            }

            let keyIsSpace = (event.charCode === CHAR_CODE_SPACE);
            if (this.isAutocompleting && keyIsSpace) {
                this.cancelAutocomplete();
            }
        },

        cancelAutocomplete() {
            let node = this.textInputNodes[0]; // TODO: Revise when other types are added
            node.data.autocompleteActive = false;
            node.data.autocompletePosition = 0;
        },

        shiftAutocompleteSelectionUp() {
            if (this.autocompleteSelectionIndex > 0) {
                this.autocompleteSelectionIndex--;
            }
        },

        shiftAutocompleteSelectionDown() {
            if (this.autocompleteSelectionIndex < (this.autocompleteSuggestions.length - 1)) {
                this.autocompleteSelectionIndex++;
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
                            <input
                                :size="Math.max(editorNode.data.text.length, 50)"
                                class="text-input"
                                v-if="editorNode.type === 'TextInputNode'"
                                type="text"
                                v-model="editorNode.data.text"
                                ref="text-input"
                                @keydown.delete="backspaceOnTextInput($event, nodePosition)"
                                @keydown.enter.prevent="enterOnTextInput($event, nodePosition)"
                                @keydown.down.prevent="shiftAutocompleteSelectionDown()"
                                @keydown.up.prevent="shiftAutocompleteSelectionUp()"
                                @keypress="keyPressOnTextInput($event, editorNode)">
                            </input>
                            <div class="project-pill"
                                v-if="editorNode.type === 'ProjectPillNode'">
                                <i class="fa fa-folder-o"></i> {{ editorNode.data.project.name }}
                            </div>
                        </template>

                        <autocomplete-box
                            v-if="isAutocompleting"
                            :suggestions="autocompleteSuggestions"
                            :selection-index="autocompleteSelectionIndex"
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
