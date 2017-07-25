import './scss/style.scss';

import Vue from 'vue';
import Vuex from 'vuex'

import { TaskListOptions } from "./components/task_list";
import { TaskEditorOptions } from "./components/task_editor";
import { ProjectListOptions } from "./components/project_list";
import { ViewListOptions } from "./components/view_list";
import { AutocompleteBoxOptions } from "./components/autocomplete_box";
import { TuduStoreOptions } from "./store";

Vue.component('task-editor', TaskEditorOptions);
Vue.component('task-list', TaskListOptions);
Vue.component('project-list', ProjectListOptions);
Vue.component('view-list', ViewListOptions);
Vue.component('autocomplete-box', AutocompleteBoxOptions);

Vue.use(Vuex);
let store = new Vuex.Store(TuduStoreOptions);

new Vue({
    el: '#vue-root',
    store
});