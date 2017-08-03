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
// - All pill nodes must be surrounded by text input nodes on both sides.
// - All pill nodes must have interstitial text input nodes. This is needed to
//   allow the user to navigate with the cursor.
// - Consecutive text input nodes aren't allowed, merge contents if needed
// - Only one project node must be present (since a task can only belong to one
//   project)
// - Multiple label nodes may be present, even if they have duplicate labels.

type EditorNodeList = {
    nodes: EditorNode[]
    activeNodeIndex: number
};

type EditorNode = ProjectPillNode | LabelPillNode | TextInputNode;

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
    removePillNodeBefore(nodeList: EditorNodeList, pos: number): EditorNodeList {
        if (pos === 0) {
            return nodeList; // No nodes before
        }

        let newNodes = nodeList.nodes.slice();

        let pillNodePosition = pos - 1;
        let firstInputNode = newNodes[pillNodePosition - 1];
        let pillNode = newNodes[pillNodePosition];
        let secondInputNode = newNodes[pillNodePosition + 1];

        if (firstInputNode.type !== 'TextInputNode') {
            throw "AssertionError: Expected a TextInputNode before the pill node being removed"
        }

        if (pillNode.type === 'TextInputNode') {
            throw "AssertionError: Expected a pill node before TextInputNode"
        }

        if (secondInputNode.type !== 'TextInputNode') {
            throw "AssertionError: Expected a TextInputNode after the pill node being removed"
        }

        let secondNodeText = secondInputNode.data.text;

        // Remove both pill & input node
        newNodes.splice(pillNodePosition, 2);

        // Concatenate text from both input nodes
        firstInputNode.data.text += secondNodeText

        nodeList.nodes = newNodes;
        nodeList.activeNodeIndex = pillNodePosition - 1;

        return nodeList;
    },

    insertTextNode(nodeList: EditorNodeList, pos: number, node: TextInputNode): EditorNodeList {
        // If nodePosition is last, not allowed!
        // If nodePosition is adjacent to a textNode, not allowed!

        // If nodePosition is adjacent to a textNode, not allowed!
        return nodeList; // TODO
    },

    upsertLabelNode(nodeList: EditorNodeList, pos: number, node: LabelPillNode): EditorNodeList {
        return nodeList; // TODO
    },

    addOrReplaceProjectNode(nodeList: EditorNodeList, pos: number, node: ProjectPillNode): EditorNodeList {
        let hasProjectNode = !!Accessors.getProjectNode(nodeList);

        // TODO: Clear these assumptions!
        if (pos != nodeList.nodes.length) {
            throw "AssertionError: Expected autocomplete to be at end of list";
        }

        let newNodes = nodeList.nodes.slice();
        if (hasProjectNode) {
            let projectNodeIndex = _.findIndex(nodeList.nodes, (x) => x.type === 'ProjectPillNode');
            newNodes[projectNodeIndex] = node;
        } else {
            newNodes.push(node);
            newNodes.push(Constructors.inputNodeFromText(''));
            nodeList.activeNodeIndex = newNodes.length - 1;
        }

        nodeList.nodes = newNodes;

        return nodeList;
    },

    replaceTextNodeAt(nodeList: EditorNodeList, pos: number, newNode: TextInputNode): EditorNodeList {
        let newNodes = nodeList.nodes.slice();
        let oldNode = (newNodes[pos]);

        if (oldNode.type !== "TextInputNode") {
            throw "AssertionError: Expected node to be a text node, got: " + oldNode.type;
        }

        newNodes[pos] = newNode;

        nodeList.nodes = newNodes;
        return nodeList;
    }
};

let Accessors = {
    getProjectNode(nodeList: EditorNodeList): ProjectPillNode | null {
        let projectPillNode = _.find(nodeList.nodes, (x) => x.type === 'ProjectPillNode');

        if (projectPillNode) {
            return projectPillNode as ProjectPillNode;
        } else {
            return null;
        }
    },

    getLabelNodes(nodeList: EditorNodeList): LabelPillNode[] {
        return _.filter(nodeList.nodes, (x) => x.type === 'LabelPillNode') as LabelPillNode[];
    },

    getTextNodes(nodeList: EditorNodeList): TextInputNode[] {
        return _.filter(nodeList.nodes, (x) => x.type === 'TextInputNode') as TextInputNode[];
    },

    getTextNodeAt(nodeList: EditorNodeList, nodePosition: number) {
        let node = nodeList.nodes[nodePosition];

        if (node.type !== "TextInputNode") {
            throw "AssertionError: Expected node to be a text node, got: " + node.type;
        }

        return node;
    }
};

export { ProjectPillNode, TextInputNode, EditorNode, LabelPillNode, EditorNodeList };
export { Constructors, Mutators, Accessors }