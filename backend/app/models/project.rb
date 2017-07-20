class Project < ApplicationRecord
    validates :name, presence: true
end
