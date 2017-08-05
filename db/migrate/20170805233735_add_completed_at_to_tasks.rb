class AddCompletedAtToTasks < ActiveRecord::Migration[5.1]
  def change
    add_column :tasks, :completed_at, :timestamp
  end
end
