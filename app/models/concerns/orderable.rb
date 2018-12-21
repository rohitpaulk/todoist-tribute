module Orderable
  extend ActiveSupport::Concern

  class_methods do
    # Updates the sort_order column to be in the same order as item_ids.
    #
    # `scope` can be used to restrict the reordering to records that match
    # specific criteria. An empty scope means all records will be reordered.
    #
    # Usage:
    #
    # ```
    # OrderableClass.reorder!([1, 2, 3], {project_id: 1})
    # ```
    def reorder_within_scope!(item_ids, scope)
      # TODO: Not atomic
      all_ids_in_scope = self.where(scope).pluck(:id)
      if Set.new(all_ids_in_scope) != Set.new(item_ids)
        item_ids += (Set.new(all_ids_in_scope) - Set.new(item_ids)).to_a
      end

      # UPDATE orderable_class AS t
      #    SET sort_order = v.sort_order
      #   FROM (
      #     VALUES (1, 2), (2, 3)
      #   ) AS v(id, sort_order)
      #   WHERE t.id = v.id
      values = item_ids.each_with_index.map { |id, index|
        "(#{ActiveRecord::Base.connection.quote(id)}, #{index + 1})"
      }

      self.connection.execute <<-SQL
        UPDATE #{self.table_name} AS t
           SET sort_order = v.sort_order
          FROM (
            VALUES #{values.join(",")}
          ) AS v(id, sort_order)
          WHERE t.id = v.id
      SQL
    end

    def create_ordered_within_scope!(scope, properties)
      # TODO: Make this atomic
      properties[:sort_order] = (self.where(scope).maximum(:sort_order) || 0) + 1;
      self.create!(properties)
    end
  end
end
