class Task < ApplicationRecord
  include Orderable

  validates :title, presence: true
  belongs_to :project

  def self.reorder!(task_ids, project)
    self.reorder_within_scope!(task_ids, {project_id: project.id})
  end

  def self.create_with_next_sort_order!(project, properties)
    # TODO: Make this atomic
    properties[:sort_order] = (project.tasks.maximum(:sort_order) || 0) + 1;
    properties[:project_id] = project.id
    self.create!(properties)
  end
end
