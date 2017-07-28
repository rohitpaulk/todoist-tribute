class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  skip_before_action :verify_authenticity_token # API, no CSRF required.

  before_action :allow_cors
  # before_action :fake_delay

  def fake_delay
    sleep 0.2
  end

  def allow_cors
    headers['Access-Control-Allow-Origin'] = '*'
  end
end
