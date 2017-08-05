class Task < ApplicationRecord
  include Orderable

  validates :title, presence: true
  belongs_to :project
  has_and_belongs_to_many :labels

  before_update :reset_sort_order_if_project_changed
  before_update :set_completed_at, if: -> { is_completed_changed? && !is_completed_was }

  def set_completed_at
    self.completed_at = Time.now
  end

  def self.reorder!(task_ids, project)
    # Pulled from Orderable
    self.reorder_within_scope!(task_ids, {project_id: project.id})
  end

  def self.create_with_next_sort_order!(project, properties)
    properties[:project_id] = project.id
    # Pulled from Orderable
    self.create_ordered_within_scope!({project: project}, properties)
  end

  def reset_sort_order_if_project_changed
    # TODO: Make this atomic!
    if project_id_was != project_id
      self.sort_order = (Project.find(project_id).tasks.maximum(:sort_order) || 0) + 1
    end
  end

  def as_json(opts)
    super(:methods => [:label_ids])
  end
end
