Rails.application.routes.draw do
  match '*any_path', to: 'cors#preflight', via: :options

  get 'api/v1/tasks', to: 'tasks#index'
  post 'api/v1/tasks', to: 'tasks#create'
  post 'api/v1/tasks/reorder', to: 'tasks#reorder'
  put 'api/v1/tasks/:task_id', to: 'tasks#update'

  get 'api/v1/projects', to: 'projects#index'
  post 'api/v1/projects/reorder', to: 'projects#reorder'
  post 'api/v1/projects', to: 'projects#create'
  put 'api/v1/projects/:project_id', to: 'projects#update'
  delete 'api/v1/projects/:project_id', to: 'projects#delete'

  get '', to: 'pages#home'
end
