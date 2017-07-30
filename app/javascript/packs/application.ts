import * as Vue from 'vue';
import Vuex from 'vuex'

import { TaskListOptions } from "./components/task_list";
import { TaskListSwitcherOptions } from "./components/task_list_switcher";
import { TaskEditorOptions } from "./components/task_editor";
import { ProjectListOptions } from "./components/project_list";
import { ProjectEditorOptions } from "./components/project_editor";
import { ViewListOptions } from "./components/view_list";
import { AutocompleteBoxOptions } from "./components/autocomplete_box";
import { TuduStoreOptions } from "./store";

Vue.component('task-list', TaskListOptions);
Vue.component('task-list-switcher', TaskListSwitcherOptions);
Vue.component('task-editor', TaskEditorOptions);
Vue.component('autocomplete-box', AutocompleteBoxOptions);

Vue.component('project-list', ProjectListOptions);
Vue.component('project-editor', ProjectEditorOptions);

Vue.component('view-list', ViewListOptions);

Vue.use(Vuex);

let apiUrl = document.head.querySelector("[property=apiUrl]")!["content"];
// Hack around ts bug! An imported object can be undefined?
// View: https://github.com/Microsoft/TypeScript/issues/13369
(TuduStoreOptions as {state: any}).state.apiUrl = apiUrl;
let store = new Vuex.Store(TuduStoreOptions);

new Vue({
    el: '#vue-root',
    store
});