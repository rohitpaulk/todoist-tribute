class CorsController < ApplicationController
  def preflight
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE'
  end
end