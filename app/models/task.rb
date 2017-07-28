class Task < ApplicationRecord
  include Orderable

  validates :title, presence: true
  belongs_to :project

  def self.reorder!(task_ids, project)
    # Pulled from Orderable
    self.reorder_within_scope!(task_ids, {project_id: project.id})
  end

  def self.create_with_next_sort_order!(project, properties)
    properties[:project_id] = project.id
    # Pulled from Orderable
    self.create_ordered_within_scope!({project: project}, properties)
  end
end
