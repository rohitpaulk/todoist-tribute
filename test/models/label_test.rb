require 'test_helper'

class LabelTest < ActiveSupport::TestCase
  test "#create_with_next_sort_order works" do
    FactoryGirl.create(:label, sort_order: 20)
    label = Label.create_with_next_sort_order!({name: 'Testing'})
    assert label
    assert_equal('Testing', label.name)
    assert_equal(21, label.sort_order)
  end

  test "#reorder works" do
    first_label = FactoryGirl.create(:label)
    second_label = FactoryGirl.create(:label)

    Label.reorder!([second_label.id, first_label.id])
    assert_equal 2, first_label.reload.sort_order
    assert_equal 1, second_label.reload.sort_order
  end

  test "habtm relationship with tasks" do
    label = FactoryGirl.create(:label)
    task = FactoryGirl.create(:task)

    task.labels << label
    task.save!

    assert_equal([label], task.labels)
    assert_equal([task], label.tasks)
  end

  test "habtm relationship complains on duplicates" do
    label = FactoryGirl.create(:label)
    task = FactoryGirl.create(:task)

    task.labels << label
    assert_raises(ActiveRecord::RecordNotUnique) {
      task.labels << label
    }
  end
end