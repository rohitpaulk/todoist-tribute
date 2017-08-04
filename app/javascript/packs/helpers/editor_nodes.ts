import * as _ from 'lodash';

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
// - All pill nodes must be surrounded by text input nodes on both sides. Some
//   of these inputs might be empty, they're used to display cursors as
//   feedback when navigating using cursor keys.
// - Consecutive text input nodes aren't allowed\
// - Only one project node must be present (since a task can only belong to one
//   project)
// - Multiple label nodes may be present, even if they have duplicate labels.

type EditorNodeList = {
    nodes: EditorNode[]
    activeNodeIndex: number
};

type EditorNode = ProjectPillNode | LabelPillNode | TextInputNode;

type PillResource = {
    id: string,
    name: string,
    colorHex: string
};

interface TextInputNode {
    type: 'TextInputNode',
    data: {
        text: string
    }
}

interface ProjectPillNode {
    type: 'ProjectPillNode'
    data: {
        project: PillResource
    }
}

interface LabelPillNode {
    type: 'LabelPillNode'
    data: {
        label: PillResource
    }
}

let Constructors = {
    pillNodeFromProject(project: PillResource): ProjectPillNode {
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

    pillNodeFromLabel(label: PillResource): LabelPillNode {
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
        let firstInputPosition = pillNodePosition - 1;
        let secondInputPosition = pillNodePosition + 1;

        let firstInputNode = newNodes[firstInputPosition];
        let pillNode = newNodes[pillNodePosition];
        let secondInputNode = newNodes[secondInputPosition];

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

        // Remove both pill & second input node
        newNodes.splice(pillNodePosition, 2);

        // Concatenate text from both input nodes
        firstInputNode.data.text += secondNodeText

        nodeList.activeNodeIndex = firstInputPosition;
        nodeList.nodes = newNodes;

        return nodeList;
    },

    addLabelNode(nodeList: EditorNodeList, pos: number, node: LabelPillNode): EditorNodeList {
        let newNodes = nodeList.nodes.slice();

        // Inserted in reverse order, will appear as [PILL_NODE] [EMPTY_TEXT_NODE]
        newNodes.splice(pos, 0, Constructors.inputNodeFromText(''));
        newNodes.splice(pos, 0, node);

        nodeList.nodes = newNodes;

        nodeList.activeNodeIndex = pos + 1;

        return nodeList;
    },

    addOrReplaceProjectNode(nodeList: EditorNodeList, pos: number, node: ProjectPillNode): EditorNodeList {
        let hasProjectNode = !!Accessors.getProjectNode(nodeList);

        let newNodes = nodeList.nodes.slice();
        if (hasProjectNode) {
            let projectNodeIndex = _.findIndex(nodeList.nodes, (x) => x.type === 'ProjectPillNode');
            newNodes[projectNodeIndex] = node;
        } else {
            newNodes.splice(pos, 0, Constructors.inputNodeFromText(''));
            newNodes.splice(pos, 0, node);

            nodeList.activeNodeIndex = pos + 1;
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