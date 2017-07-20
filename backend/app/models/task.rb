class Task < ApplicationRecord
  validates :title, presence: true
  belongs_to :project

  def self.create_with_next_sort_order!(properties)
    # TODO: Make this atomic
    properties[:sort_order] = (Task.maximum(:sort_order) || 0) + 1;
    self.create!(properties)
  end

  def self.reorder!(task_ids)
    quoted_ids = task_ids.map {|x| ActiveRecord::Base.connection.quote(x) }
    pg_array = "ARRAY[#{quoted_ids.join(', ')}]::int[]"

    # TODO: Make this work with bigint!
    Task.connection.execute <<-SQL
      UPDATE tasks
         SET sort_order = (
           idx(#{pg_array} + (ARRAY(SELECT id::int FROM tasks) - #{pg_array}), tasks.id::int)
         )
    SQL
  end
end
