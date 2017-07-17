Rails.application.routes.draw do
  get 'api/v1/tasks', to: 'tasks#index'
  post 'api/v1/tasks', to: 'tasks#create'
end
