class CreateTasks < ActiveRecord::Migration[5.1]
  def change
    create_table :tasks do |t|
      t.string :title
      t.integer :sort_order
      t.boolean :is_completed, default: false
      t.integer :indent_level, default: 1

      t.timestamps
    end

    enable_extension "intarray"
  end
end
