import './scss/style.scss';

import Vue from 'vue';
import Vuex from 'vuex'

import { TaskListOptions } from "./components/task_list";
import { TaskEditorOptions } from "./components/task_editor";
import { TuduStoreOptions } from "./store";

Vue.use(Vuex);

let store = new Vuex.Store(TuduStoreOptions);

Vue.component('task-editor', TaskEditorOptions);
Vue.component('task-list', TaskListOptions);

let vueInstance = new Vue({
    el: '#vue-root',
    store
});
