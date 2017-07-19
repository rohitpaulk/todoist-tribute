class TasksController < ApplicationController
  skip_before_action :verify_authenticity_token # API, no CSRF required.

  before_action :allow_cors

  def allow_cors
    headers['Access-Control-Allow-Origin'] = '*'
  end

  def index
    render json: Task.order(sort_order: :asc).all
  end

  def create
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

  def preflight
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
  end

  def update
    is_completed = params[:is_completed]
    task_id = params[:task_id]

    Task.find(task_id).update(is_completed: is_completed)
  end
end
