import Vue, { ComponentOptions } from 'vue';

import { TaskList, TaskListOptions } from './task_list';
import { Project, Task } from '../models';

interface ComponentData {
    // A set of all the projectIds that have been rendered. This is used to keep
    // components alive to prevent re-rendering.
    //
    // This value is updated using a watcher whenever the `project` prop changes.
    projectIds: Set<string>
}

interface ComponentProps {
    project: Project
    tasks: Task
}

interface TaskListSwitcher extends Vue, ComponentData, ComponentProps {}

let TaskListSwitcherOptions = {
    props: {
        project: { required: true },
        tasks: { required: true }
    },

    data: function() {
        return {
            projectIds: new Set([this.project.id])
        };
    },

    watch: {
        project: function(newProject: Project) {
            this.projectIds.add(newProject.id);
        },
    },

    template: `
        <div>
            <keep-alive>
                <component :is="'task-list'"
                    :tasks="tasks"
                    :default-project="project"
                    :key="project.id"
                    v-for="projectId in Array.from(projectIds)"
                    v-if="project.id === projectId">
                </component>
            </keep-alive>
        </div>
    `
} as ComponentOptions<TaskListSwitcher>;

export { TaskListSwitcherOptions, TaskListSwitcher };