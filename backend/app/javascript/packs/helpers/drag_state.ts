import * as _ from 'lodash';

interface DraggableItem {
    id: string
}

interface DragState {
    draggedItem: DraggableItem
    orderBeforeDrag: string[] // Array of IDs
    currentOrder: string[] // Array of IDs
}

function getOrderedItems(items: DraggableItem[], dragState: DragState): DraggableItem[] {
    return _.sortBy(items, function (item: DraggableItem) {
        return _.indexOf(dragState.currentOrder, item.id);
    });
}

let dragEventHandlers = {
    dragStart(items: DraggableItem[], draggedItem: DraggableItem): DragState {
        let initialOrder = items.map(x => x.id);

        return {
            draggedItem: draggedItem,
            orderBeforeDrag: initialOrder,
            currentOrder: initialOrder,
        };
    },

    dragEnter(oldDragState: DragState, item: DraggableItem): DragState {
        let oldOrder = oldDragState.currentOrder;

        let currentItemPosition = _.indexOf(oldOrder, item.id);
        let draggedItemPosition = _.indexOf(oldOrder, oldDragState.draggedItem.id);

        let cp = currentItemPosition;
        let dp = draggedItemPosition;

        // Swap positions
        let newOrder = oldOrder.slice();
        [newOrder[cp], newOrder[dp]] = [oldOrder[dp], oldOrder[cp]];

        return {
            draggedItem: oldDragState.draggedItem,
            orderBeforeDrag: oldDragState.orderBeforeDrag,
            currentOrder: newOrder,
        };
    }
}

export { dragEventHandlers as DragEventHandlers, DragState, getOrderedItems };