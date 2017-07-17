import './scss/style.scss';

import * as $ from "jquery";

let wireUpTaskCreator = function(addTaskSelector, taskCreatorSelector) {
    let $addTask = $(addTaskSelector);
    let $taskCreator = $(taskCreatorSelector);

    var closeTaskCreator = function() {
        $taskCreator.hide();
        $addTask.show();
    }

    var registerEscKey = function() {
        $taskCreator.find('input').keydown(function(e) {
            if (e.which == 27) { closeTaskCreator(); }
        });
    }

    var openTaskCreator = function() {
        $addTask.hide();
        $taskCreator.show();
        registerEscKey();
        $taskCreator.find('input').focus();
    }

    $addTask.click(function(e) {
        e.preventDefault();
        openTaskCreator();
    })

    $taskCreator.find('button[type="submit"]').click(function(e) {
        e.preventDefault();
        alert('Submitting task...'); // TODO: Submit task
    });

    $taskCreator.find('a.cancel-link').click(function(e) {
        e.preventDefault();
        closeTaskCreator();
    });
}

$(document).ready(function() {
    wireUpTaskCreator('.task-list .add-task', '.task-list .task-creator');
});