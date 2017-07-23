class Project < ApplicationRecord
  include Orderable

  validates :name, presence: true
  has_many :tasks

  def self.reorder!(project_ids)
    self.reorder_within_scope!(project_ids, {})
  end

  def self.create_with_next_sort_order!(properties)
    # Pulled from Orderable
    self.create_ordered_within_scope!({}, properties)
  end
end
