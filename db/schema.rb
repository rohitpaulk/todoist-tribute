# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170805233735) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "intarray"

  create_table "labels", force: :cascade do |t|
    t.string "name"
    t.string "color_hex"
    t.boolean "is_inbox", default: false
    t.integer "sort_order"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sort_order"], name: "labels_unique_sort_order", unique: true
  end

  create_table "labels_tasks", id: false, force: :cascade do |t|
    t.integer "label_id"
    t.integer "task_id"
    t.index ["label_id", "task_id"], name: "index_labels_tasks_on_label_id_and_task_id", unique: true
    t.index ["task_id"], name: "index_labels_tasks_on_task_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name"
    t.string "color_hex"
    t.boolean "is_inbox", default: false
    t.integer "sort_order"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["is_inbox"], name: "projects_is_inbox_idx", unique: true, where: "(is_inbox = true)"
    t.index ["sort_order"], name: "projects_unique_sort_order", unique: true
  end

  create_table "tasks", force: :cascade do |t|
    t.string "title"
    t.integer "sort_order"
    t.boolean "is_completed", default: false
    t.integer "indent_level", default: 1
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "project_id"
    t.datetime "completed_at"
    t.index ["project_id", "sort_order"], name: "tasks_unique_sort_order", unique: true
  end

  add_foreign_key "labels_tasks", "labels", on_delete: :cascade
  add_foreign_key "labels_tasks", "tasks", on_delete: :cascade
  add_foreign_key "tasks", "projects", on_delete: :cascade
end
