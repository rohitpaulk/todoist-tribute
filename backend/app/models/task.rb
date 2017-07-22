class Task < ApplicationRecord
  validates :title, presence: true
  belongs_to :project

  def self.create_with_next_sort_order!(project, properties)
    # TODO: Make this atomic
    properties[:sort_order] = (project.tasks.maximum(:sort_order) || 0) + 1;
    properties[:project_id] = project.id
    self.create!(properties)
  end

  def self.reorder!(task_ids, project)
    quoted_ids = task_ids.map {|x| ActiveRecord::Base.connection.quote(x) }
    pg_array = "ARRAY[#{quoted_ids.join(', ')}]::int[]"
    project_id = ActiveRecord::Base.connection.quote(project.id)

    # TODO: Make this work with bigint!
    Task.connection.execute <<-SQL
      UPDATE tasks
         SET sort_order = (
           idx(#{pg_array} + (ARRAY(SELECT id::int FROM tasks WHERE project_id = #{project_id}) - #{pg_array}), tasks.id::int)
         )
       WHERE project_id = #{project_id}
    SQL
  end
end
