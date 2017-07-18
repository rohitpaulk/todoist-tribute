# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

puts "Creating tasks..."

Task.create!(sort_order: 1, title: 'This is the first task')
Task.create!(sort_order: 2, title: 'da second task is here')
Task.create!(sort_order: 3, title: '3rd task yo')

puts "Tasks created."