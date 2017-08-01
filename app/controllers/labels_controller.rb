# TODO: Avoid code duplication wrt projects controller
class LabelsController < ApplicationController
  def index
    render json: Label.order(sort_order: :asc).all
  end

  def reorder
    label_ids = params[:label_ids]

    unless label_ids
      render json: {'msg' => 'label_ids param missing'}, status: 400 and return
    end

    Label.reorder!(label_ids)

    render json: Label.order(sort_order: :asc).all
  end

  def create
    name = params[:name]
    color_hex = params[:color_hex]

    unless name
      render json: {'msg' => 'name param missing'}, status: 400 and return
    end

    # TODO: Can be lax here, use a default color?
    unless color_hex
      render json: {'msg' => 'color_hex param missing'}, status: 400 and return
    end

    label = Label.create_with_next_sort_order!(name: name, color_hex: color_hex)

    # TODO: Support in-between sort_orders

    render json: label
  end

  def update
    label = Label.find(params[:id])
    label.update!(label_params)

    render json: label
  end

  def destroy
    Label.find(params[:id]).delete

    render json: {}
  end

  def label_params
    params.permit(:name, :color_hex)
  end
end
