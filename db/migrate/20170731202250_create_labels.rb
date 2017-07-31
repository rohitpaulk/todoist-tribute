class CreateLabels < ActiveRecord::Migration[5.1]
  def change
    create_table :labels do |t|
      t.string :name
      t.string :color_hex
      t.boolean :is_inbox, default: false
      t.integer :sort_order

      t.timestamps
    end

    create_table :labels_tasks, id: false do |t|
      t.integer :label_id
      t.integer :task_id

      t.index :task_id
      t.index [:label_id, :task_id], :unique => true
    end

    add_foreign_key :labels_tasks, :labels, on_delete: :cascade
    add_foreign_key :labels_tasks, :tasks, on_delete: :cascade

    execute <<-SQL
      ALTER TABLE labels ADD CONSTRAINT labels_unique_sort_order
                                        UNIQUE (sort_order)
                                        DEFERRABLE
                                        INITIALLY DEFERRED;
    SQL
  end
end
