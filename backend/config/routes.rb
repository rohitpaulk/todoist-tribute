Rails.application.routes.draw do
  get 'api/v1/tasks', to: 'tasks#index'
  post 'api/v1/tasks', to: 'tasks#create'
  post 'api/v1/tasks/reorder', to: 'tasks#reorder'
  put 'api/v1/tasks/:task_id', to: 'tasks#update'
  match 'api/v1/tasks/reorder', to: 'cors#preflight', via: :options
  match 'api/v1/tasks', to: 'cors#preflight', via: :options
  match 'api/v1/tasks/:id', to: 'cors#preflight', via: :options

  get 'api/v1/projects', to: 'projects#index'
end
