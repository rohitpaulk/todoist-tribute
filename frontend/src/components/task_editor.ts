import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { Task, Project } from '../models';
import { API } from '../API';
import { CreateTaskPayload, UpdateTaskPayload } from '../store';

interface ProjectPillNode {
    type: 'ProjectPillNode'
    data: {
        project: Project
    }
}

interface TextInputNode {
    type: 'TextInputNode',
    data: {
        text: string,
        autocompleteActive: boolean,
        autocompletePosition: number,
    }
}

type EditorNode = ProjectPillNode | TextInputNode;

interface TaskEditor extends Vue {
    // data
    editorNodes: EditorNode[],

    // prop
    initialProject: Project,
    taskToEdit: Task | null,

    // computed
    taskTitle: string
    taskProject: Project
    isAutocompleting: boolean
    textInputNodes: TextInputNode[]

    // methods
    emitClose: () => void,
    removeEditorNodeBefore: (position: number) => void
    cancelAutocomplete: (node: TextInputNode) => void
    submitChanges: () => void
}

let projectPillNodeFromProject = function(project: Project): ProjectPillNode {
    return {
        type: 'ProjectPillNode',
        data: {
            project: project
        }
    };
}

let textInputNodeFromText = function(text: string): TextInputNode {
    return {
        type: 'TextInputNode',
        data: {
            text: text,
            autocompleteActive: false,
            autocompletePosition: 0
        }
    };
}

let emptyEditorNodes = function(project: Project): EditorNode[] {
    return [
        projectPillNodeFromProject(project),
        textInputNodeFromText('')
    ];
}

let editorNodesFromTask = function(task: Task, project: Project): EditorNode[] {
    return [
        projectPillNodeFromProject(project),
        textInputNodeFromText(task.title)
    ]
}

const CHAR_CODE_POUND_SIGN = 35;
const CHAR_CODE_SPACE = 32;

let taskEditorOptions = {
    name: 'task-editor',

    data: function() {
        if (this.taskToEdit !== null) {
            return { editorNodes: editorNodesFromTask(this.taskToEdit, this.initialProject) };
        } else {
            return { editorNodes: emptyEditorNodes(this.initialProject) };
        }
    },

    props: {
        initialProject: { required: true },
        taskToEdit: { default: null }
    },

    computed: {
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
                this.removeEditorNodeBefore(nodePosition);
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
                this.cancelAutocomplete(node);
            }
        },

        enterOnTextInput: function() {
            if (this.isAutocompleting) {
                alert('Submit autocomplete!');
            } else {
                this.submitChanges();
            }
        },

        removeEditorNodeBefore: function(nodePosition: number) {
            if (nodePosition === 0) {
                return; // No nodes before
            }

            // As long as it isn't a TextInputNode, we can remove it safely.
            if (this.editorNodes[nodePosition - 1].type !== 'TextInputNode') {
                this.editorNodes.splice(nodePosition - 1, 1);
            }

            // TODO: If there was a text element before both, merge that with this!
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
                this.cancelAutocomplete(node);
            }
        },

        cancelAutocomplete(node: TextInputNode) {
            node.data.autocompleteActive = false;
            node.data.autocompletePosition = 0;
        }
    },

    mounted: function() {
        // (this.$refs['input'] as HTMLElement).focus();
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
                                @keydown.delete="backspaceOnTextInput($event, nodePosition)"
                                @keydown.enter="enterOnTextInput($event, nodePosition)"
                                @keypress="keyPressOnTextInput($event, editorNode)">
                            </input>
                            <div class="project-pill"
                                v-if="editorNode.type === 'ProjectPillNode'">
                                <i class="fa fa-folder-o"></i> {{ editorNode.data.project.name }}
                            </div>
                        </template>

                        <div class="autocomplete-container" v-if="isAutocompleting">
                            <div class="autocomplete-item">
                                Testing autocomplete
                            </div>
                        </div>
                    </div>

                    <button type="submit">Add Task</button>
                    <a href="#" class="cancel-link" @click="emitClose()">Cancel</a>
                </form>
            </div>
        </div>
    `
} as ComponentOptions<TaskEditor>

export { taskEditorOptions as TaskEditorOptions }
