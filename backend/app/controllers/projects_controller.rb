class ProjectsController < ApplicationController
  def index
    render json: Project.all
  end

  def reorder
    project_ids = params[:project_ids]

    unless project_ids
      render json: {'msg' => 'task_ids param missing'}, status: 400 and return
    end

    Project.reorder!(project_ids)

    render json: Project.all
  end
end
