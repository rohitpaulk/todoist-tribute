class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  skip_before_action :verify_authenticity_token # API, no CSRF required.

  before_action :allow_cors

  def allow_cors
    headers['Access-Control-Allow-Origin'] = '*'
  end
end
