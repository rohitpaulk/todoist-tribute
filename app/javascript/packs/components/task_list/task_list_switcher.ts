import * as _ from 'lodash';
import Vue, { ComponentOptions } from 'vue';

import { TaskList, TaskListOptions } from './task_list';
import { Scope, ScopeType } from '../../store';
import { Project, Task } from '../../models';

interface ComponentData {
    // A set of all the IDs of the scopes that have been rendered. This is used
    // to keep components alive to prevent re-rendering.
    //
    // This value is updated using a watcher whenever the `scope` prop changes.
    scopeIds: Set<{id: string, type: string}>
}

interface ComponentProps {
    scope: Scope
    tasks: Task
}

interface TaskListSwitcher extends Vue, ComponentData, ComponentProps {
    useSimpleTaskList(): boolean
    componentName(): string
    componentKey(): string
}

let TaskListSwitcherOptions = {
    props: {
        scope: { required: true },
        tasks: { required: true }
    },

    computed: {
        componentName: function(): string {
            return this.useSimpleTaskList ? 'simple-task-list' : 'task-list';
        },

        useSimpleTaskList: function(): boolean {
            return this.scope.type !== 'project';
        },

        componentKey: function(): string {
            return this.scope.type + '-' + this.scope.resource.id
        }
    },

    data: function() {
        return {
            scopeIds: new Set([{
                type: this.scope.type,
                id: this.scope.resource.id
            }])
        }
    },

    watch: {
        scope: function(newScope: Scope) {
            this.scopeIds.add({type: this.scope.type, id: this.scope.resource.id});
        },
    },

    template: `
        <div>
            <keep-alive>
                <component :is="componentName"
                    :tasks="tasks"
                    :default-project="scope.type === 'project' ? scope.resource : null"
                    :key="componentKey"
                    v-for="localScope in Array.from(scopeIds)"
                    v-if="(scope.type === localScope.type) && (scope.resource.id === localScope.id)">
                </component>
            </keep-alive>
        </div>
    `
} as ComponentOptions<TaskListSwitcher>;

export { TaskListSwitcherOptions, TaskListSwitcher };