import * as _ from 'lodash';

import { Label, Project } from '../models';

// This is the data structure that powers the task editor. The task editor
// supports entering projects/labels inline with the help of autocomplete. If
// a user accepts an autocomplete suggestion, a 'pill' node is added to the list.
//
// x-------------------------------------------------------------------------x
// | x--------------x x---------x x---------x                                |
// | | Project Name | | Label 1 | | Label 2 | Text input for user is here |  |
// | x--------------x x---------x x---------x                                |
// x-------------------------------------------------------------------------x
//
// [ ProjectPillNode, LabelPillNode, LabelPillNode, TextInputNode ]
//
// Constraints
//
// - One text input must always be present at the last position.
// - Multiple 'interstitial' text input nodes can be present between pill nodes,
//   this allows the user to navigate with the cursor.
// - Consecutive text input nodes aren't allowed, merge contents if needed
// - Only one project node must be present (since a task can only belong to one
//   project)
// - Multiple label nodes may be present, but only one with the same 'id'.

interface TextInputNode {
    type: 'TextInputNode',
    data: {
        text: string
    }
}

interface ProjectPillNode {
    type: 'ProjectPillNode'
    data: {
        project: Project
    }
}

interface LabelPillNode {
    type: 'LabelPillNode'
    data: {
        label: Label
    }
}

type EditorNode = ProjectPillNode | LabelPillNode | TextInputNode;

let Constructors = {
    pillNodeFromProject(project: Project): ProjectPillNode {
        return {
            type: 'ProjectPillNode',
            data: {
                project: project
            }
        };
    },

    inputNodeFromText(text: string): TextInputNode {
        return {
            type: 'TextInputNode',
            data: {
                text: text
            }
        };
    },

    pillNodeFromLabel(label: Label): LabelPillNode {
        return {
            type: 'LabelPillNode',
            data: {
                label: label
            }
        };
    }
};

let Mutators = {
    removeNonInputNodeBefore(editorNodes: EditorNode[], nodePosition: number): EditorNode[] {
        if (nodePosition === 0) {
            return editorNodes; // No nodes before
        }

        let newNodes = editorNodes.slice();
        if (editorNodes[nodePosition - 1].type !== 'TextInputNode') {
            newNodes.splice(nodePosition - 1, 1);
        }

        // TODO: If there was a text element before both, merge that with this!

        return newNodes;
    },

    insertTextNode(editorNodes: EditorNode[], nodePosition: number, textNode: TextInputNode): EditorNode[] {
        // If nodePosition is last, not allowed!
        // If nodePosition is adjacent to a textNode, not allowed!

        // If nodePosition is adjacent to a textNode, not allowed!
        return []; // TODO
    },

    upsertLabelNode(editorNodes: EditorNode[], nodePosition: number, labelNode: LabelPillNode): EditorNode[] {
        return []; // TODO
    },

    addOrReplaceProjectNode(editorNodes: EditorNode[], projectNode: ProjectPillNode): EditorNode[] {
         // TODO: Revisit when other node types are added
        if (editorNodes.length > 2) {
            throw "AssertionError: Expected 2 nodes at max"
        }
        let hasProjectNode = (editorNodes.length == 2);
        let newNodes = editorNodes.slice();

        if (hasProjectNode) {
            newNodes[0] = projectNode;
        } else {
            newNodes.unshift(projectNode);
        }

        return newNodes;
    },

    replaceTextNodeAt(editorNodes: EditorNode[], nodePosition: number, newNode: TextInputNode): EditorNode[] {
        let newNodes = editorNodes.slice();
        let oldNode = (newNodes[nodePosition]);

        if (oldNode.type !== "TextInputNode") {
            throw "AssertionError: Expected node to be a text node, got: " + oldNode.type;
        }

        newNodes[nodePosition] = newNode;
        return newNodes;
    }
};

let Accessors = {
    getProjectNode(editorNodes: EditorNode[]): ProjectPillNode | null {
        let projectPillNode = _.find(editorNodes, (x) => x.type === 'ProjectPillNode');

        if (projectPillNode) {
            return projectPillNode as ProjectPillNode;
        } else {
            return null;
        }
    },

    getLabelNodes(editorNodes: EditorNode[]): LabelPillNode[] {
        return _.filter(editorNodes, (x) => x.type === 'LabelPillNode') as LabelPillNode[];
    },

    getTextNodes(editorNodes: EditorNode[]): TextInputNode[] {
        return _.filter(editorNodes, (x) => x.type === 'TextInputNode') as TextInputNode[];
    },

    getTextNodeAt(editorNodes: EditorNode[], nodePosition: number) {
        let node = editorNodes[nodePosition];

        if (node.type !== "TextInputNode") {
            throw "AssertionError: Expected node to be a text node, got: " + node.type;
        }

        return node;
    }
};

export { ProjectPillNode, TextInputNode, EditorNode, LabelPillNode };
export { Constructors, Mutators, Accessors }