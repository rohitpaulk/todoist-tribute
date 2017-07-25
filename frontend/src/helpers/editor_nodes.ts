import * as _ from 'lodash';

import { Project } from '../models'; // This dependency should not be required?

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

let Constructors = {
    projectPillNodeFromProject(project: Project): ProjectPillNode {
        return {
            type: 'ProjectPillNode',
            data: {
                project: project
            }
        };
    },

    textInputNodeFromText(text: string): TextInputNode {
        return {
            type: 'TextInputNode',
            data: {
                text: text,
                autocompleteActive: false,
                autocompletePosition: 0
            }
        };
    },
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

    replaceTextInTextInputNode(editorNodes: EditorNode[], text): EditorNode[] {
         // TODO: Revisit when other node types are added
        if (editorNodes.length > 2) {
            throw "AssertionError: Expected 2 nodes at max"
        }

        let hasProjectNode = (editorNodes.length == 2);
        let newNodes = editorNodes.slice();

        if (hasProjectNode) {
            (newNodes[1] as TextInputNode).data.text = text;
        } else {
            (newNodes[0] as TextInputNode).data.text = text;
        }

        return newNodes;
    }
};

export { ProjectPillNode, TextInputNode, EditorNode, Constructors, Mutators }