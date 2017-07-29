import assert = require('assert');
import * as Vue from 'vue';
import 'mocha';

import { TaskEditor, TaskEditorOptions } from '../components/task_editor';
import { TextInputNode } from '../helpers/editor_nodes';
import { fakeTask } from './factory.spec';

describe('Task Editor', function() {
    function getComponentInstance(propsData: {[key: string]: any}): TaskEditor {
        let Component = Vue.extend(TaskEditorOptions);
        propsData.initialProject = null;
        return new Component({propsData: propsData}) as TaskEditor;
    }

    it('should initialize with a single empty editorNode', function() {
        let taskEditor = getComponentInstance({});
        let editorNodes = taskEditor.editorNodes;
        assert.equal(editorNodes.length, 1);
        assert.equal(editorNodes[0].type, "TextInputNode");
        assert.equal((editorNodes[0] as TextInputNode).data.text, '');
    });

    it ('should populate task title in editor node if editing', function() {
        let taskEditor = getComponentInstance({
            taskToEdit: fakeTask({title: 'Dummy'})
        });
        let editorNodes = taskEditor.editorNodes;

        assert.equal(editorNodes.length, 1);
        assert.equal(editorNodes[0].type, "TextInputNode");
        assert.equal((editorNodes[0] as TextInputNode).data.text, 'Dummy');
    });
});