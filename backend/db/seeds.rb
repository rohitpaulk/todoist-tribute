# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

puts "Creating projects..."

inbox = Project.create!(name: "Inbox", color_hex: "000000")
blue_project = Project.create!(name: "Blue project", color_hex: "4286f4")
red_project = Project.create!(name: "Project Red", color_hex: "c14b4b")

puts "Created projects"

puts "Creating tasks..."

Task.create!(sort_order: 1, title: 'This is the first task', project: blue_project)
Task.create!(sort_order: 2, title: 'da second task is here', project: inbox)
# Task.create!(sort_order: 3, indent_level: 2, title: 'Indented under second task')
Task.create!(sort_order: 4, title: '3rd task yo', project: red_project)
# Task.create!(sort_order: 5, indent_level: 2, title: 'Indented under third task')
# Task.create!(sort_order: 6, indent_level: 3, title: 'Indented under the indented task task')

puts "Tasks created."