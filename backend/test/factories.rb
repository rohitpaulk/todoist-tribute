FactoryGirl.define do
  factory :task do
    title "Test Task"
    sort_order { (Task.maximum(:sort_order) || 0) + 1 }
    project {
        Project.find_or_create_by(is_system: true) { |p| p.name = 'Inbox'}
    }
  end

  factory :project do
    name "Test Project"
    color_hex "000000"
  end
end
