# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

puts "Creating projects..."

inbox = Project.create!(name: "Inbox", color_hex: "555555")
disney = Project.create!(name: "Disney", color_hex: "0072C6")
pixar = Project.create!(name: "Pixar", color_hex: "FFCC00")

puts "Created projects"

puts "Creating labels..."

easy = Label.create!(name: "easy", color_hex: "339966")
hard = Label.create!(name: "hard", color_hex: "c14b4b")

puts "Created labels"

puts "Creating tasks..."

Task.create!(sort_order: 1, title: 'First task', project: inbox, labels: [easy])
Task.create!(sort_order: 2, title: 'and the second...', project: inbox)
Task.create!(sort_order: 3, title: 'the 3rd!', project: inbox)

Task.create!(sort_order: 1, title: 'Fire mickey', project: disney, labels: [hard])
Task.create!(sort_order: 2, title: 'Promote donald', project: disney, labels: [easy])

Task.create!(sort_order: 1, title: 'Hire steve', project: pixar)

puts "Tasks created."