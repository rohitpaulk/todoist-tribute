require 'test_helper'

class TaskTest < ActiveSupport::TestCase
  test "#create_with_next_sort_order works with zero elements present" do
    task = Task.create_with_next_sort_order!(title: 'Testing')
    assert task
    assert_equal('Testing', task.title)
    assert_equal(1, task.sort_order)
  end

  test "#create_with_next_sort_order picks max sort order" do
    Task.create!(title: 'hey', sort_order: 20)
    task = Task.create_with_next_sort_order!(title: 'Testing')
    assert task
    assert_equal(21, task.sort_order)
  end
end
