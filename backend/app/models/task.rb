class Task < ApplicationRecord
  validates :title, presence: true

  def self.create_with_next_sort_order!(properties)
    # TODO: Make this atomic
    properties[:sort_order] = (Task.maximum(:sort_order) || 0) + 1;
    self.create!(properties)
  end

  def self.reorder!(task_ids)
    quoted_ids = task_ids.map {|x| ActiveRecord::Base.connection.quote(x) }
    pg_array = "ARRAY[#{quoted_ids.join(', ')}]"

    Task.connection.execute <<-SQL
      UPDATE tasks
         SET sort_order = (
           idx(#{pg_array}, tasks.id::int) -- TODO: Make this work with bigint!
         )
    SQL
  end
end
