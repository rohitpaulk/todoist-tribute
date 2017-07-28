class PagesController < ApplicationController
  def home
    render layout: false
  end
end