Rails.application.routes.draw do
  match '*any_path', to: 'cors#preflight', via: :options

  scope 'api/v1' do
    concern :reorderable do
      post 'reorder', on: :collection
    end

    resources :tasks, only: [:index, :create, :update], concerns: :reorderable
    resources :projects, only: [:index, :create, :update, :destroy], concerns: :reorderable
    resources :labels, only: [:index, :create, :update, :destroy], concerns: :reorderable
  end

  root to: 'pages#home'
end
