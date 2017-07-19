class Task < ApplicationRecord
  validates :title, presence: true

  def self.create_with_next_sort_order!(properties)
    # TODO: Make this atomic
    properties[:sort_order] = (Task.maximum(:sort_order) || 0) + 1;
    self.create!(properties)
  end
end
