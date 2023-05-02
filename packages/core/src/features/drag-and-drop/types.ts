import { ItemInstance } from "../../types/core";

export type DndDataRef<T> = {
  draggedItems?: ItemInstance<T>[];
  draggedForeignObject?: any;
};

export type DragAndDropFeatureDef<T> = {
  state: {};
  config: {
    isItemDraggable?: (item: ItemInstance<T>) => boolean;
    canDrag?: (items: ItemInstance<T>[]) => boolean;
    canDrop?: (items: ItemInstance<T>[], target: ItemInstance<T>) => boolean;
    canDropInbetween?: boolean;
    createForeignDragObject?: (items: ItemInstance<T>[]) => {
      format: string;
      data: any;
    };
    canDropForeignDragObject?: (
      dataTransfer: DataTransfer,
      target: ItemInstance<T>
    ) => boolean;
  };
  treeInstance: {};
  itemInstance: {};
  hotkeys: never;
};
