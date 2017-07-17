import './scss/style.scss';

import * as $ from "jquery";
import { Task } from "./models";
import { TaskList } from "./components/task_list";
import { TaskCreator } from "./components/task_creator";

$(document).ready(function() {
    let tasks = [{title: 'Task 3'}, {title: 'Task 4'}];
    let $taskListContainer = $('.task-list');
    new TaskList(tasks).render($taskListContainer);

    let $taskCreatorContainer = $('.task-creator');
    new TaskCreator().render($taskCreatorContainer);
});