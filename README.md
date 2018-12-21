> Imitation is the sincerest form of flattery.

This is a clone of the [Todoist](https://todoist.com/) web-app.

Here's how it looks:

![](/app/assets/images/week3.gif)

Visit [a live instance](http://thetuduapp.herokuapp.com/) to check it out!

You can also deploy your own copy to heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/rohitpaulk/todoist-tribute)

### Installing locally

This is a standard [Rails](https://github.com/rails/rails) app, using [webpacker](https://github.com/rails/webpacker) to manage JS modules.

You'll need [Ruby](https://www.ruby-lang.org/en/), [bundler](http://bundler.io/), [yarn](https://yarnpkg.com/en/) and [Postgres](https://www.postgresql.org/) installed. All the following steps are to be executed in the root directory of this repository.

- Run `bundle install` to install the required Rubygems
- Run `yarn install` to install the required NPM packages
- Run `createdb tudu_development` to create a development database
- Run `rake db:migrate db:seed` to create database schema and sample records
- Run `rails s` to spin up the Rails dev server
- Run `./bin/webpack-dev-server` to spin up the webpack dev server

Hit [localhost:3000](http://localhost:3000/) and you should be ready to go!

### Running tests

- Run `createdb tudu_testing` to create a testing database
- Run `rake test` to run Ruby tests
- Run `yarn test` to run JS tests

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
