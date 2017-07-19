import './scss/style.scss';

import Vue from 'vue';
import * as Mousetrap from 'mousetrap';

import { Task } from "./models";
import { TaskListOptions, TaskList } from "./components/task_list";
import { TaskEditorOptions, TaskEditor } from "./components/task_editor";
import { Store } from "./store"

var app = {
    keyboardShortcuts: new Vue()
};

Vue.component('task-editor', TaskEditorOptions);
Vue.component('task-list', TaskListOptions);

let vueInstance = new Vue({
    el: '#vue-root'
});
