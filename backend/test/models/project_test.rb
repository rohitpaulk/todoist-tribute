require 'test_helper'

class ProjectTest < ActiveSupport::TestCase
  test "DB constraint ensures that only one is_inbox project is created" do
    FactoryGirl.create(:project, is_inbox: true)
    assert_raises(ActiveRecord::RecordNotUnique) {
      FactoryGirl.create(:project, is_inbox: true)
    }
  end
end