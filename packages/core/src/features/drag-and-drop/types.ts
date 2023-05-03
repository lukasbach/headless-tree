import { ItemInstance } from "../../types/core";

export type DndDataRef<T> = {
  draggedItems?: ItemInstance<T>[];
  draggedForeignObject?: any;
  lastDragCode?: string;
  dragTarget?: DropTarget<T>;
};

export type DropTarget<T> = {
  item: ItemInstance<T> | "root";
  index: number | null;
};

export enum DropTargetPosition {
  Top = "top",
  Bottom = "bottom",
  Item = "item",
}

export type DragAndDropFeatureDef<T> = {
  state: {};
  config: {
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

    onUpdateDragPosition?: (target: DropTarget<T> | null) => void;

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
  };
  hotkeys: never;
};
