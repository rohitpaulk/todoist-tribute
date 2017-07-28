require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

require 'factories'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  self.use_transactional_tests = false
  DatabaseCleaner.strategy = :truncation

  def setup
    super
    DatabaseCleaner.start
  end

  def teardown
    super
    DatabaseCleaner.clean
  end
  # Add more helper methods to be used by all tests here...
end
