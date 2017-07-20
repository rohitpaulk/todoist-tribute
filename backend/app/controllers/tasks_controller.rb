class TasksController < ApplicationController
  skip_before_action :verify_authenticity_token # API, no CSRF required.

  before_action :allow_cors

  def allow_cors
    headers['Access-Control-Allow-Origin'] = '*'
  end

  def index
    render json: Task.where(is_completed: false).order(sort_order: :asc).all
  end

  def create
    title = params[:title]

    unless title
      render json: {'msg' => 'title param missing'}, status: 400 and return
    end

    task = Task.create_with_next_sort_order!(title: title)

    # TODO: Support in-between sort_orders

    render json: task
  end

  def reorder
    task_ids = params[:task_ids]

    unless task_ids
      render json: {'msg' => 'task_ids param missing'}, status: 400 and return
    end

    Task.reorder!(task_ids)

    render json: Task.where(is_completed: false).order(sort_order: :asc).all
  end

  def preflight
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT'
  end

  def update
    is_completed = params[:is_completed]
    task_id = params[:task_id]

    task = Task.find(task_id)
    task.update!(is_completed: is_completed)

    render json: task
  end
end
