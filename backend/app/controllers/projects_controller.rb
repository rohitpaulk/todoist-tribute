class ProjectsController < ApplicationController
  def index
    render json: Project.order(sort_order: :asc).all
  end

  def reorder
    project_ids = params[:project_ids]

    unless project_ids
      render json: {'msg' => 'task_ids param missing'}, status: 400 and return
    end

    Project.reorder!(project_ids)

    render json: Project.order(sort_order: :asc).all
  end

  def create
    name = params[:name]
    color_hex = params[:color_hex]

    unless name
      render json: {'msg' => 'name param missing'}, status: 400 and return
    end

    # TODO: Can be lax here, use a default color?
    unless color_hex
      render json: {'msg' => 'color_hex param missing'}, status: 400 and return
    end

    project = Project.create_with_next_sort_order!(name: name, color_hex: color_hex)

    # TODO: Support in-between sort_orders

    render json: project
  end

  def update
    project = Project.find(params[:project_id])
    project.update!(project_params)

    render json: project
  end

  def delete
    Project.find(params[:project_id]).delete

    render json: {}
  end

  def project_params
    params.permit(:name, :color_hex)
  end
end
