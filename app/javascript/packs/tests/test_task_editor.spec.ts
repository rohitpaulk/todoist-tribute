import assert = require('assert');
import Vue from 'vue/dist/vue.common.js';
import Vuex from 'vuex';
import 'mocha';

import { TaskEditor, TaskEditorOptions } from '../components/task_editor';
import { SelfAdjustingInputOptions } from '../components/self_adjusting_input';
import { TextInputNode } from '../helpers/editor_nodes';
import { fakeTask } from './factory.spec';
import { TuduStoreOptions } from '../store';

describe('Task Editor', function() {
    // TODO: Find a way to make this a generic function.
    function getComponentInstance(propsData: {[key: string]: any}): TaskEditor {
        Vue.component('self-adjusting-input', SelfAdjustingInputOptions);

        Vue.use(Vuex);
        let store = new Vuex.Store(TuduStoreOptions);
        let Component = Vue.extend(TaskEditorOptions);
        propsData.initialProject = null;
        return new Component({propsData: propsData, store: store}) as TaskEditor;
    }

    it('should initialize with a single empty editorNode', function() {
        let taskEditor = getComponentInstance({});
        let editorNodes = taskEditor.editorNodes.nodes;
        assert.equal(editorNodes.length, 1);
        assert.equal(editorNodes[0].type, "TextInputNode");
        assert.equal((editorNodes[0] as TextInputNode).data.text, '');
    });

    it ('should populate task title in editor node if editing', function() {
        let taskEditor = getComponentInstance({
            taskToEdit: fakeTask({title: 'Dummy'})
        });
        let editorNodes = taskEditor.editorNodes.nodes;

        assert.equal(editorNodes.length, 1);
        assert.equal(editorNodes[0].type, "TextInputNode");
        assert.equal((editorNodes[0] as TextInputNode).data.text, 'Dummy');
    });

    it ('should render', function() {
        let taskEditor = getComponentInstance({});
        taskEditor.$mount();
    });
});
