import './scss/style.scss';

import Vue from 'vue';

import * as $ from "jquery";
import { Task } from "./models";
import TaskList from "./components/task_list";
import { TaskCreator } from "./components/task_creator";
import { Store } from "./store"

Vue.component('task-list', TaskList)

new Vue({
    el: '#vue-root'
});

$(document).ready(function() {
    // let store = new Store('http://localhost:3000/');

    // store.getTasks(function (tasks) {
    //     taskList.setTasks(tasks);
    // });

    // let $taskCreatorContainer = $('.task-creator');
    // let createTask = function(title, sortOrder, cb) {
    //     store.createTask(title, sortOrder, cb);
    // }
    // let taskCreator = new TaskCreator(createTask);
    // taskCreator.render($taskCreatorContainer);

    // store.getTasks(function (tasks) {
    //     taskList.setTasks(tasks);
    // });
});