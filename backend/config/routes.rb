Rails.application.routes.draw do
  get 'api/v1/tasks', to: 'tasks#index'
  post 'api/v1/tasks', to: 'tasks#create'
  match 'api/v1/tasks', to: 'tasks#preflight', via: :options
end
