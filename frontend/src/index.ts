import './scss/style.scss';

import * as $ from "jquery";
import { Task } from "./models";
import { TaskList } from "./components/task_list";
import { TaskCreator } from "./components/task_creator";
import { Store } from "./store"

$(document).ready(function() {
    let $taskListContainer = $('.task-list');
    let taskList = new TaskList([], $taskListContainer);
    taskList.render();

    let store = new Store('http://localhost:3000/');

    store.getTasks(function (tasks) {
        taskList.setTasks(tasks);
    });

    let $taskCreatorContainer = $('.task-creator');
    let createTask = function(title, sortOrder, cb) {
        store.createTask(title, sortOrder, cb);
    }
    let taskCreator = new TaskCreator(createTask);
    taskCreator.render($taskCreatorContainer);

    store.getTasks(function (tasks) {
        taskList.setTasks(tasks);
    });
});