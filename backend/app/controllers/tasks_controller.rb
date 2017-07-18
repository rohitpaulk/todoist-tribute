class TasksController < ApplicationController
  skip_before_action :verify_authenticity_token # API, no CSRF required.

  def index
    headers['Access-Control-Allow-Origin'] = '*'

    render json: Task.order(sort_order: :asc).all
  end

  def create
    headers['Access-Control-Allow-Origin'] = '*'

    title = params[:title]
    sort_order = params[:sort_order]

    unless title
      render json: {'msg' => 'title param missing'}, status: 400 and return
    end

    unless sort_order
      render json: {'msg' => 'sort_order param missing'}, status: 400 and return
    end

    task = Task.create!(title: title, sort_order: sort_order)

    # TODO: Catch sort_order uniqueness error

    render json: task
  end
end
