# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

puts "Creating projects..."

inbox = Project.create!(name: "Inbox", color_hex: "000000")
blue_project = Project.create!(name: "Blue project w/o tasks", color_hex: "4286f4")
red_project = Project.create!(name: "Project Red", color_hex: "c14b4b")

puts "Created projects"

puts "Creating tasks..."

Task.create!(sort_order: 1, title: 'This is the first task', project: inbox)
Task.create!(sort_order: 2, title: 'da second task is here', project: inbox)
Task.create!(sort_order: 3, title: '3rd task yo', project: inbox)
Task.create!(sort_order: 1, title: 'First task in red project', project: red_project)
Task.create!(sort_order: 2, title: 'Second task in red project', project: red_project)

puts "Tasks created."