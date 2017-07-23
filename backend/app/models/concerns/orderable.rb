module Orderable
  extend ActiveSupport::Concern

  class_methods do
    # Updates the sort_order column to be in the same order
    # as item_ids.
    #
    # `scope` can be used to restrict the reordering to records
    # that match specific criteria.
    #
    # Usage:
    #
    # ```
    # OrderableClass.reorder!([1, 2, 3], {project_id: 1})
    # ```
    def reorder_within_scope!(item_ids, scope={})
      quoted_ids = item_ids.map {|x| ActiveRecord::Base.connection.quote(x) }

      if scope.empty?
        where_clause = 'true = true'
      else
        where_clause = scope.map{|k, v|
          "#{k}=#{ActiveRecord::Base.connection.quote(v)}"
        }.join(" AND ")
      end

      pg_array = "ARRAY[#{quoted_ids.join(', ')}]::int[]"
      scoped_tasks_query ="SELECT id::int FROM #{self.table_name} WHERE #{where_clause}"

      # TODO: Make this work with bigint!
      #
      # UPDATE orderable_class
      #    SET sort_order = (idx([3, 4] + ([1, 2, 3, 4, 5] - [3, 4])), klass.id::int)
      #  WHERE scoped_column_name = scoped_value
      Task.connection.execute <<-SQL
        UPDATE #{self.table_name}
          SET sort_order = (
            idx(#{pg_array} + (ARRAY(#{scoped_tasks_query}) - #{pg_array}), #{self.table_name}.id::int)
          )
        WHERE #{where_clause}
      SQL
    end
  end
end