> Imitation is the sincerest form of flattery.

This is a clone of the [Todoist](https://todoist.com/) web-app.

Here's how it looks:

![](/app/assets/images/week3.gif)

Visit [a live instance](http://thetuduapp.herokuapp.com/) to check it out!

You can also deploy your own copy to heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/rohitpaulk/todoist-tribute)

### Under the hood

The backend is written in [Ruby](https://www.ruby-lang.org/en/) + [Rails](https://github.com/rails/rails), and the frontend in [Typescript](https://www.typescriptlang.org/) + [Vue.js](https://vuejs.org/).

A few interesting files to look at:

- [editor_nodes.ts]( https://github.com/rohitpaulk/todoist-tribute/blob/master/app/javascript/packs/helpers/editor_nodes.ts)

### Current Status

- [ ] Tasks
  - [x] Creating tasks
  - [x] Editing tasks
  - [x] Completing tasks
  - [x] Re-ordering tasks
  - [ ] Nested/indented tasks
- [x] Projects
  - [x] Switching between project views
  - [x] Creating projects
  - [x] Editing projects
  - [x] Re-ordering projects
  - [x] Deleting projects
  - [x] Color picker
- [x] Labels
  - [x] Creating labels
  - [x] Editing labels
  - [x] Viewing tasks for a label
  - [x] Rendering labels in task-item
  - [x] Assigning labels via task-editor
- [ ] Priorities
- [ ] Due dates
- [ ] Filters
- [ ] Karma
- [ ] Keyboard Shortcuts
    - [ ] Task List
      - [x] `a` to open editor at bottom of list
      - [ ] `A` to open editor at top of list
    - [ ] Task Editor
      - [x] `Enter` to create new task and open editor below
      - [x] `Esc` to cancel
      - [ ] `Shift + Enter` to save and create new one below
      - [ ] `Ctrl + Enter` to save and create new one above