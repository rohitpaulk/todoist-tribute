require('./scss/style.scss');
$ = require('jquery');
Tudu = {};
Tudu.taskCreator = {};
Tudu.taskCreator.wireUp = function (addTaskSelector, taskCreatorSelector) {
    $addTask = $(addTaskSelector);
    $taskCreator = $(taskCreatorSelector);
    var closeTaskCreator = function () {
        $taskCreator.hide();
        $addTask.show();
    };
    var registerEscKey = function () {
        $taskCreator.find('input').keydown(function (e) {
            if (e.which == 27) {
                closeTaskCreator();
            }
        });
    };
    var openTaskCreator = function () {
        $addTask.hide();
        $taskCreator.show();
        registerEscKey();
        $taskCreator.find('input').focus();
    };
    $addTask.click(function (e) {
        e.preventDefault();
        openTaskCreator();
    });
    $taskCreator.find('button[type="submit"]').click(function (e) {
        e.preventDefault();
        alert('Submitting task...'); // TODO: Submit task
    });
    $taskCreator.find('a.cancel-link').click(function (e) {
        e.preventDefault();
        closeTaskCreator();
    });
};
Tudu.taskCreator.openTaskCreator;
$(document).ready(function () {
    Tudu.taskCreator.wireUp('.task-list .add-task', '.task-list .task-creator');
});
//# sourceMappingURL=index.js.map