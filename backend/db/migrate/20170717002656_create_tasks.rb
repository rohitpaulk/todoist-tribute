class CreateTasks < ActiveRecord::Migration[5.1]
  def change
    create_table :tasks do |t|
      t.string :title
      t.integer :sort_order
      t.boolean :is_completed, default: false

      t.timestamps
    end

    add_index :tasks, :sort_order, unique: true
  end
end
