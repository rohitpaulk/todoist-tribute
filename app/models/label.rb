class Label < ApplicationRecord
  include Orderable

  validates :name, presence: true
  has_and_belongs_to_many :tasks

  def self.reorder!(label_ids)
    self.reorder_within_scope!(label_ids, {})
  end

  def self.create_with_next_sort_order!(properties)
    # Pulled from Orderable
    self.create_ordered_within_scope!({}, properties)
  end
end
