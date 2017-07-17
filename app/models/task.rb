class Task < ApplicationRecord
    validates :sort_order, presence: true, uniqueness: true
    validates :title, presence: true
end
