class TasksController < ApplicationController
  def index
    render json: Task.where(is_completed: false).order(sort_order: :asc).all
  end

  def create
    title = params[:title]

    unless title
      render json: {'msg' => 'title param missing'}, status: 400 and return
    end

    task = Task.create_with_next_sort_order!(title: title, project: Project.find_by_name('Inbox'))

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

  def update
    is_completed = params[:is_completed]
    task_id = params[:task_id]

    task = Task.find(task_id)
    task.update!(is_completed: is_completed)

    render json: task
  end
end
