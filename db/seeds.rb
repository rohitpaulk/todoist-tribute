# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

puts "Creating projects..."

inbox = Project.create!(name: "Inbox", color_hex: "555555")
errands = Project.create!(name: "🛵 Errands", color_hex: "0072C6")
reading = Project.create!(name: "📚 Reading", color_hex: "FFCC00")

puts "Created projects"

puts "Creating labels..."

easy = Label.create!(name: "easy", color_hex: "339966")
medium = Label.create!(name: "medium", color_hex: "A8C8E4")
hard = Label.create!(name: "hard", color_hex: "FFCC00")
super_hard = Label.create!(name: "super-hard", color_hex: "AC193D")

puts "Created labels"

puts "Creating tasks..."

Task.create!(sort_order: 1, title: 'This is a task. Click on it to edit.', project: inbox)
Task.create!(sort_order: 2, title: 'Tasks belong to a single project. This one belongs in the inbox.', project: inbox)
Task.create!(sort_order: 3, title: 'Tasks can also belong to multiple labels. Easy and hard, in this case.', project: inbox, labels: [easy, hard])
Task.create!(sort_order: 4, title: 'When creating/editing a task, use # to assign projects and @ to assign labels.', project: inbox)
Task.create!(sort_order: 5, title: 'Try clicking on different projects in the sidebar to view their tasks.', project: inbox)

Task.create!(sort_order: 1, title: 'Buy milk 🥛', project: errands, labels: [easy])
Task.create!(sort_order: 2, title: 'Buy eggs 🥚', project: errands, labels: [medium])
Task.create!(sort_order: 3, title: 'File taxes 📝', project: errands, labels: [hard])

Task.create!(sort_order: 1, title: 'Code complete by Steve McConnell', project: reading)
Task.create!(sort_order: 2, title: 'Practical Vim by Drew Neil', project: reading)
Task.create!(sort_order: 3, title: 'Beautiful Code by Andy Oram', project: reading)

puts "Tasks created."
