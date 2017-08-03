class TasksController < ApplicationController
  def index
    render json: Task.includes(:labels).where(is_completed: false).order(sort_order: :asc).all
  end

  def create
    title = params[:title]
    project_id = params[:project_id]

    unless title
      render json: {'msg' => 'title param missing'}, status: 400 and return
    end

    # TODO: Can be lax here, default to Inbox?
    unless project_id
      render json: {'msg' => 'project_id param missing'}, status: 400 and return
    end

    project = Project.find(project_id)
    task = Task.create_with_next_sort_order!(project, task_params)

    # TODO: Support in-between sort_orders

    render json: task
  end

  def reorder
    task_ids = params[:task_ids]
    project_id = params[:project_id]

    unless task_ids
      render json: {'msg' => 'task_ids param missing'}, status: 400 and return
    end

    unless project_id
      render json: {'msg' => 'project_id param missing'}, status: 400 and return
    end

    # TODO: validate that all tasks belong to the same project, throw 400

    Task.reorder!(task_ids, Project.find(project_id))

    render json: Task.where(is_completed: false).order(sort_order: :asc).all
  end

  def update
    task = Task.find(params[:id])

    task.update!(task_params)

    render json: task
  end

  def task_params
    params.permit(:is_completed, :title, :project_id, label_ids: [])
  end
end
