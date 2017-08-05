require 'test_helper'

class TaskTest < ActiveSupport::TestCase
  test "#create_with_next_sort_order works with zero elements present" do
    task = Task.create_with_next_sort_order!(FactoryGirl.create(:project),
      title: 'Testing'
    )
    assert task
    assert_equal('Testing', task.title)
    assert_equal(1, task.sort_order)
  end

  test "#create_with_next_sort_order picks max sort order" do
    task = FactoryGirl.create(:task, sort_order: 20)
    task = Task.create_with_next_sort_order!(task.project, title: 'Testing')
    assert task
    assert_equal(21, task.sort_order)
  end

  test "#create_with_next_sort_order is scoped to project" do
    first_project = FactoryGirl.create(:project)
    FactoryGirl.create(:task, sort_order: 20, project: first_project)
    FactoryGirl.create(:task, sort_order: 21, project: first_project)
    second_project = FactoryGirl.create(:project)
    FactoryGirl.create(:task, sort_order: 1, project: second_project)
    task = Task.create_with_next_sort_order!(second_project, title: 'Testing')

    assert_equal(2, task.sort_order)
  end

  test "#reorder reorders tasks" do
    first_task = FactoryGirl.create(:task)
    second_task = FactoryGirl.create(:task)

    Task.reorder!([second_task.id, first_task.id], first_task.project)
    assert_equal 1, Task.find(second_task.id).sort_order
    assert_equal 2, Task.find(first_task.id).sort_order
  end

  test "#reorder handles missing tasks?" do
    first_task = FactoryGirl.create(:task, sort_order: 1)
    second_task = FactoryGirl.create(:task, sort_order: 2)
    third_task = FactoryGirl.create(:task, sort_order: 3)
    fourth_task = FactoryGirl.create(:task, sort_order: 4)

    Task.reorder!([third_task.id, fourth_task.id], third_task.project)
    assert_equal 1, Task.find(third_task.id).sort_order
    assert_equal 2, Task.find(fourth_task.id).sort_order

    # The tasks that weren't mentioned appear at the end
    assert_equal 3, Task.find(first_task.id).sort_order
    assert_equal 4, Task.find(second_task.id).sort_order
  end

  test "#reorder is scoped to project" do
    first_project = FactoryGirl.create(:project)
    first_task = FactoryGirl.create(:task, sort_order: 1, project: first_project)
    second_task = FactoryGirl.create(:task, sort_order: 2, project: first_project)
    second_project = FactoryGirl.create(:project)
    third_task = FactoryGirl.create(:task, sort_order: 1, project: second_project)
    fourth_task = FactoryGirl.create(:task, sort_order: 2, project: second_project)

    Task.reorder!([fourth_task.id, third_task.id], second_project)
    assert_equal 2, Task.find(third_task.id).sort_order
    assert_equal 1, Task.find(fourth_task.id).sort_order

    # Tasks from different project must remain untouched.
    assert_equal 1, Task.find(first_task.id).sort_order
    assert_equal 2, Task.find(second_task.id).sort_order
  end

  test "Updating #project_id picks next sort_order automatically" do
    first_project = FactoryGirl.create(:project)
    first_task = FactoryGirl.create(:task, sort_order: 1, project: first_project)
    second_project = FactoryGirl.create(:project)
    second_task = FactoryGirl.create(:task, sort_order: 1, project: second_project)
    first_task.update(project_id: second_project.id)

    assert_equal(2, first_task.sort_order)
  end

  test "Updating is_completed sets completed_at" do
    task = FactoryGirl.create(:task)

    assert_nil task.completed_at
    task.update!(is_completed: true)

    refute_nil task.completed_at
    assert (task.completed_at - Time.now).abs < 5
  end
end
