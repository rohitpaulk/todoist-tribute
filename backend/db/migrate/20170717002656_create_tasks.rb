class CreateTasks < ActiveRecord::Migration[5.1]
  def change
    create_table :tasks do |t|
      t.string :title
      t.integer :sort_order
      t.boolean :is_completed

      t.timestamps
    end
  end
end
