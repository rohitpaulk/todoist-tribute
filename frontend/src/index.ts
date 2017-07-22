import './scss/style.scss';

import Vue from 'vue';
import Vuex from 'vuex'

import { TaskListOptions } from "./components/task_list";
import { TaskEditorOptions } from "./components/task_editor";
import { ProjectListOptions } from "./components/project_list";
import { TuduStoreOptions } from "./store";

Vue.component('task-editor', TaskEditorOptions);
Vue.component('task-list', TaskListOptions);
Vue.component('project-list', ProjectListOptions);

Vue.use(Vuex);
let store = new Vuex.Store(TuduStoreOptions);

new Vue({
    el: '#vue-root',
    store
});