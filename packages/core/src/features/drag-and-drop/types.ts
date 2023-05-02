import { ItemInstance } from "../../types/core";

export type DndDataRef<T> = {
  draggedItems?: ItemInstance<T>[];
  draggedForeignObject?: any;
};

export enum DropTarget {
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
    canDrop?: (
      items: ItemInstance<T>[],
      target: ItemInstance<T>,
      index: number | null
    ) => boolean;

    createForeignDragObject?: (items: ItemInstance<T>[]) => {
      format: string;
      data: any;
    };
    canDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: ItemInstance<T>
    ) => boolean;

    onDrop?: (
      items: ItemInstance<T>[],
      target: ItemInstance<T>,
      index: number | null
    ) => void;
    onDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: ItemInstance<T>,
      index: number | null
    ) => void;
  };
  treeInstance: {};
  itemInstance: {};
  hotkeys: never;
};
