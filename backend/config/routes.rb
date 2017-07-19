Rails.application.routes.draw do
  get 'api/v1/tasks', to: 'tasks#index'
  post 'api/v1/tasks', to: 'tasks#create'
  put 'api/v1/tasks/:task_id', to: 'tasks#update'
  match 'api/v1/tasks', to: 'tasks#preflight', via: :options
end
