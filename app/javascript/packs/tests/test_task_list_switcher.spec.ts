import assert = require('assert');
import 'mocha';
import Vue from 'vue';

import { Project } from '../models';
import { Scope } from '../store';
import { TaskListSwitcher, TaskListSwitcherOptions } from '../components/task_list/task_list_switcher';
import { fakeProject } from './factory.spec';

describe('Task List Switcher', function() {
    // TODO: Find a way to make this a generic function.
    function getComponentInstance(propsData: {[key: string]: any}): TaskListSwitcher {
        let Component = Vue.extend(TaskListSwitcherOptions);
        return new Component({propsData: propsData}) as TaskListSwitcher;
    }

    function getScopeFromProject(project: Project): Scope {
        return {type: "project", resource: project};
    }

    it('should initialize with a single scopeId', function() {
        let project = fakeProject({name: "Fake This"});
        let switcher = getComponentInstance({
            scope: getScopeFromProject(project),
            tasks: []
        });
        assert.equal(switcher.scopeIds.size, 1);
        assert.equal(Array.from(switcher.scopeIds)[0].type, 'project');
        assert.equal(Array.from(switcher.scopeIds)[0].id, project.id);
    });

    it ('should add projectIds when a new projectId is added', function(done) {
        let first_project = fakeProject({id: '240'});
        let second_project = fakeProject({id: '360'});
        let switcher = getComponentInstance({
            scope: getScopeFromProject(first_project),
            tasks: []
        });

        switcher.scope = getScopeFromProject(second_project);

        // Watchers are run async, so we queue the assertion for the nextTick
        Vue.nextTick(function() {
            assert.equal(switcher.scopeIds.size, 2);
            done();
        });
    });

    it ('should switch retain previous project state');
});
