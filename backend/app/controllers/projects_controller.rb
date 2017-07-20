class ProjectsController < ApplicationController
  def index
    return json: Project.all
  end
end
