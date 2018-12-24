import Vue from 'vue';
import Vuex from 'vuex'

import { TaskListOptions } from "./components/task_list/task_list";
import { TaskItemOptions } from "./components/task_list/task_item";
import { SimpleTaskListOptions } from "./components/task_list/simple_task_list";
import { TaskListSwitcherOptions } from "./components/task_list/task_list_switcher";
import { SelfAdjustingInputOptions } from "./components/self_adjusting_input";
import { TaskEditorOptions } from "./components/task_editor";
import { AutocompleteBoxOptions } from "./components/autocomplete_box";
import { ViewListOptions } from "./components/view_list";
import { TabSwitcherOptions } from "./components/tab_switcher";
import { ResourceListOptions } from "./components/resource_lists/base_resource_list";
import { ProjectListOptions } from "./components/resource_lists/project_list";
import { LabelListOptions } from "./components/resource_lists/label_list";

import { ProjectEditorOptions } from "./components/project_editor";
import { LabelEditorOptions } from "./components/label_editor";
import { ColorChooserOptions } from "./components/color_chooser/input";
import { ColorChooserDropdownOptions } from "./components/color_chooser/dropdown";
import { TuduStoreOptions } from "./store";

Vue.component('task-list', TaskListOptions);
Vue.component('simple-task-list', SimpleTaskListOptions);
Vue.component('task-list-switcher', TaskListSwitcherOptions);
Vue.component('task-item', TaskItemOptions);
Vue.component('task-editor', TaskEditorOptions);
Vue.component('autocomplete-box', AutocompleteBoxOptions);
Vue.component('self-adjusting-input', SelfAdjustingInputOptions);

Vue.component('view-list', ViewListOptions);
Vue.component('tab-switcher', TabSwitcherOptions);
Vue.component('base-resource-list', ResourceListOptions);
Vue.component('project-list', ProjectListOptions);
Vue.component('label-list', LabelListOptions);
Vue.component('project-editor', ProjectEditorOptions);
Vue.component('label-editor', LabelEditorOptions);
Vue.component('color-chooser', ColorChooserOptions);
Vue.component('color-chooser-dropdown', ColorChooserDropdownOptions);

Vue.use(Vuex);

let apiUrl = document.head.querySelector("[property=apiUrl]")!["content"];
// Hack around ts bug! An imported object can be undefined?
// View: https://github.com/Microsoft/TypeScript/issues/13369
(TuduStoreOptions as {state: any}).state.apiUrl = apiUrl;
let store = new Vuex.Store(TuduStoreOptions);

new Vue({
    el: '#vue-root',
    store,
    created: function() {
        // TODO: Move to a single init function
        let vueInstance = this;
        var refresh = function () {
            vueInstance.$store.dispatch('refreshTasks');
            vueInstance.$store.dispatch('refreshProjects');
            vueInstance.$store.dispatch('refreshLabels');
        };

        // Reload state when tab is focused
        window.addEventListener("focus", refresh);

        refresh();
    }
});
