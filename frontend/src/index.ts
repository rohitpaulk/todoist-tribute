import './scss/style.scss';

import * as Vue from 'vue';
import Vuex from 'vuex'

import { TaskListOptions } from "./components/task_list";
import { TaskEditorOptions } from "./components/task_editor";
import { ProjectListOptions } from "./components/project_list";
import { ProjectEditorOptions } from "./components/project_editor";
import { ViewListOptions } from "./components/view_list";
import { AutocompleteBoxOptions } from "./components/autocomplete_box";
import { TuduStoreOptions } from "./store";

Vue.component('task-list', TaskListOptions);
Vue.component('task-editor', TaskEditorOptions);
Vue.component('autocomplete-box', AutocompleteBoxOptions);

Vue.component('project-list', ProjectListOptions);
Vue.component('project-editor', ProjectEditorOptions);

Vue.component('view-list', ViewListOptions);

Vue.use(Vuex);
let store = new Vuex.Store(TuduStoreOptions);

new Vue({
    el: '#vue-root',
    store
});