import assert = require('assert');
import 'mocha';
import * as Vue from 'vue';

import { TaskListSwitcher, TaskListSwitcherOptions } from '../components/task_list_switcher';
import { fakeProject } from './factory.spec';

describe('Task List Switcher', function() {
    // TODO: Find a way to make this a generic function.
    function getComponentInstance(propsData: {[key: string]: any}): TaskListSwitcher {
        let Component = Vue.extend(TaskListSwitcherOptions);
        return new Component({propsData: propsData}) as TaskListSwitcher;
    }

    it('should initialize with a single projectId', function() {
        let project = fakeProject({name: "Fake This"});
        let switcher = getComponentInstance({project: project, tasks: []});
        assert.equal(switcher.projectIds.size, 1);
    });

    it ('should add projectIds when a new projectId is added', function(done) {
        let first_project = fakeProject({id: '240'});
        let second_project = fakeProject({id: '360'});
        let switcher = getComponentInstance({project: first_project, tasks: []});

        switcher.project = second_project;

        // Watchers are run async, so we queue the assertion for the nextTick
        Vue.nextTick(function() {
            assert.equal(switcher.projectIds.size, 2);
            done();
        });
    });

    it ('should switch retain previous project state');
});