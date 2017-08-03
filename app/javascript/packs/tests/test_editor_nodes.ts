import assert = require('assert');
import 'mocha';
import * as _ from 'lodash';

import { EditorNode, EditorNodeList } from '../helpers/editor_nodes';
import { Constructors, Mutators, Accessors } from '../helpers/editor_nodes';
import { Project } from '../models';
import { fakeProject } from './factory.spec';

describe('Constructors  - projectPillNodeFromProject', function() {
    it('should return project in data', function() {
        let project = fakeProject({});
        let projectPillNode = Constructors.pillNodeFromProject(project);
        assert.equal(project, projectPillNode.data.project);
    });
});

describe('Mutator - removeNonInputNodeBefore', function() {
    it('does nothing if action is on first node', function() {
        let textInputNode = Constructors.inputNodeFromText('text');
        let nodeList: EditorNodeList = {
            nodes: [textInputNode],
            activeNodeIndex: 0
        };

        let newNodeList = Mutators.removePillNodeBefore(_.cloneDeep(nodeList), 0);

        assert.deepStrictEqual(nodeList, newNodeList);
    });

    it('removes a pill node', function() {
        let firstTextInputNode = Constructors.inputNodeFromText('first');
        let projectPillNode = Constructors.pillNodeFromProject(fakeProject({}));
        let secondTextInputNode = Constructors.inputNodeFromText('');

        let nodeList: EditorNodeList = {
            nodes: [firstTextInputNode, projectPillNode, secondTextInputNode],
            activeNodeIndex: 2
        };

        let newNodeList = Mutators.removePillNodeBefore(_.cloneDeep(nodeList), 2);

        assert.equal(Accessors.getProjectNode(newNodeList), null);
    });

    it('merges the two textInputNodes', function() {
        let firstTextInputNode = Constructors.inputNodeFromText('first ');
        let projectPillNode = Constructors.pillNodeFromProject(fakeProject({}));
        let secondTextInputNode = Constructors.inputNodeFromText('second');

        let nodeList: EditorNodeList = {
            nodes: [firstTextInputNode, projectPillNode, secondTextInputNode],
            activeNodeIndex: 2
        };

        let newNodeList = Mutators.removePillNodeBefore(_.cloneDeep(nodeList), 2);

        assert.equal(newNodeList.nodes.length, 1);
        assert.deepStrictEqual(newNodeList.nodes[0], {
            type: "TextInputNode",
            data: {
                text: 'first second'
            }
        });
    });

    it('sets the previous node as active');
});