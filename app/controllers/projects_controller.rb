# TODO: Avoid code duplication wrt labels controller
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
    project = Project.find(params[:id])

    if project.is_inbox
      render json: {'msg' => 'Cannot update default inbox project'}, status: 400 and return
    end

    project.update!(project_params)

    render json: project
  end

  def destroy
    project = Project.find(params[:id])

    if project.is_inbox
      render json: {'msg' => 'Cannot delete default inbox project'}, status: 400 and return
    end

    project.delete

    render json: {}
  end

  def project_params
    params.permit(:name, :color_hex)
  end
end
