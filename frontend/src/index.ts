import './scss/style.scss';

import Vue from 'vue';

import * as $ from "jquery";
import { Task } from "./models";
import TaskList from "./components/task_list";
import { Store } from "./store"

Vue.component('task-list', TaskList)

new Vue({
    el: '#vue-root'
});