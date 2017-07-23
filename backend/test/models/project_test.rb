require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  test "DB constraint ensures that only one is_inbox project is created" do
    FactoryGirl.create(:project, is_inbox: true)
    assert_raises(ActiveRecord::RecordNotUnique) {
      FactoryGirl.create(:project, is_inbox: true)
    }
  end

  test "#create_with_next_sort_order works" do
    FactoryGirl.create(:project, sort_order: 20)
    project = Project.create_with_next_sort_order!({name: 'Testing'})
    assert project
    assert_equal('Testing', project.name)
    assert_equal(21, project.sort_order)
  end

  test "#reorder works" do
    first_project = FactoryGirl.create(:project)
    second_project = FactoryGirl.create(:project)

    Project.reorder!([second_project.id, first_project.id])
    assert_equal 2, first_project.reload.sort_order
    assert_equal 1, second_project.reload.sort_order
  end
end