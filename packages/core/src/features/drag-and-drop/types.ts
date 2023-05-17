import { ItemInstance, SetStateFn } from "../../types/core";

export type DndDataRef = {
  lastDragCode?: string;
};

export type DndState<T> = {
  draggedItems?: ItemInstance<T>[];
  draggingOverItem?: ItemInstance<T>;
  dragTarget?: DropTarget<T>;
};

export type DropTarget<T> = {
  item: ItemInstance<T>;
  childIndex: number | null;
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
      target: DropTarget<T>
    ) => boolean;

    onDrop?: (items: ItemInstance<T>[], target: DropTarget<T>) => void;
    onDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: DropTarget<T>
    ) => void;
  };
  treeInstance: {
    getDropTarget: () => DropTarget<T> | null;
  };
  itemInstance: {
    isDropTarget: () => boolean;
    isDropTargetAbove: () => boolean;
    isDropTargetBelow: () => boolean;
    isDraggingOver: () => boolean;
  };
  hotkeys: never;
};
