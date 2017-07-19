import './scss/style.scss';

import Vue from 'vue';
import * as Mousetrap from 'mousetrap';

import { Task } from "./models";
import { TaskListOptions, TaskList } from "./components/task_list";
import { TaskCreatorOptions, TaskCreator } from "./components/task_creator";
import { Store } from "./store"

var app = {
    keyboardShortcuts: new Vue()
};

Vue.component('task-creator', TaskCreatorOptions);
Vue.component('task-list', TaskListOptions);

let vueInstance = new Vue({
    el: '#vue-root',
    components: {
        'task-creator': TaskCreatorOptions,
        'task-list': TaskListOptions
    }
});

Mousetrap.bind('a', function() {
    app.keyboardShortcuts.$emit('key-press-a');
});