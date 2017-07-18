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

    let $taskCreatorContainer = $('.task-creator');
    new TaskCreator().render($taskCreatorContainer);

    new Store('fake_url').getTasks(function (tasks) {
        taskList.setTasks(tasks);
    });
});