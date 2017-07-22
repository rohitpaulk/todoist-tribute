class CreateProjects < ActiveRecord::Migration[5.1]
  def change
    create_table :projects do |t|
      t.string :name
      t.string :color_hex
      t.boolean :is_inbox, default: false

      t.timestamps
    end

    # Only allow one inbox project
    execute <<-SQL
      CREATE UNIQUE INDEX ON projects (is_inbox) WHERE is_inbox = true
    SQL

    add_column :tasks, :project_id, :integer
    add_foreign_key :tasks, :projects, on_delete: :cascade

    # Alter the sort_order uniqueness to be scoped to project
    execute <<-SQL
      ALTER TABLE tasks DROP CONSTRAINT unique_sort_order;
      ALTER TABLE tasks ADD CONSTRAINT unique_sort_order
                                       UNIQUE (project_id, sort_order)
                                       DEFERRABLE
                                       INITIALLY DEFERRED

    SQL
  end
end
