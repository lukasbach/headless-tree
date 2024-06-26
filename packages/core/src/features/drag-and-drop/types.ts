import { ItemInstance, SetStateFn } from "../../types/core";

export type DndDataRef = {
  lastDragCode?: string;
};

export type DndState<T> = {
  draggedItems?: ItemInstance<T>[]; // TODO not used anymore?
  draggingOverItem?: ItemInstance<T>;
  dragTarget?: DropTarget<T>;
};

export type DragLineData = {
  intend: number;
  top: number;
  left: number;
  right: number;
};

export type DropTarget<T> =
  | {
      item: ItemInstance<T>;
      childIndex: number;
      insertionIndex: number;
    }
  | {
      item: ItemInstance<T>;
      childIndex: null;
      insertionIndex: null;
    };

export enum DropTargetPosition {
  Top = "top",
  Bottom = "bottom",
  Item = "item",
}

export type DragAndDropFeatureDef<T> = {
  state: {
    dnd?: DndState<T> | null;
  };
  config: {
    setDndState?: SetStateFn<DndState<T> | null>;

    topLinePercentage?: number;
    bottomLinePercentage?: number;
    canDropInbetween?: boolean;

    isItemDraggable?: (item: ItemInstance<T>) => boolean;
    canDrag?: (items: ItemInstance<T>[]) => boolean;
    canDrop?: (items: ItemInstance<T>[], target: DropTarget<T>) => boolean;

    createForeignDragObject?: (items: ItemInstance<T>[]) => {
      format: string;
      data: any;
    };
    canDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: DropTarget<T>,
    ) => boolean;
    onDrop?: (items: ItemInstance<T>[], target: DropTarget<T>) => void;
    onDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: DropTarget<T>,
    ) => void;

    /** Runs in the onDragEnd event, if `ev.dataTransfer.dropEffect` is not `none`, i.e. the drop
     * was not aborted. No target is provided as parameter since the target may be a foreign drop target.
     * This is useful to seperate out the logic to move dragged items out of their previous parents.
     * Use `onDrop` to handle drop-related logic.
     *
     * This ignores the `canDrop` handler, since the drop target is unknown in this handler.
     */
    // onSuccessfulDragEnd?: (items: ItemInstance<T>[]) => void;

    onCompleteForeignDrop?: (items: ItemInstance<T>[]) => void;
  };
  treeInstance: {
    getDropTarget: () => DropTarget<T> | null;
    getDragLineData: () => DragLineData | null;
  };
  itemInstance: {
    isDropTarget: () => boolean;
    isDropTargetAbove: () => boolean;
    isDropTargetBelow: () => boolean;
    isDraggingOver: () => boolean;
  };
  hotkeys: never;
};
