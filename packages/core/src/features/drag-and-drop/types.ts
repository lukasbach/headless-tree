import { ItemInstance } from "../../types/core";

export type DragAndDropFeatureDef<T> = {
  state: {};
  config: {
    canDrag?: (items: ItemInstance<T>[]) => boolean;
    canDrop?: (items: ItemInstance<T>[], target: ItemInstance<T>) => boolean;
    canDropInbetween?: boolean;
    createForeignDragObject?: (items: ItemInstance<T>[]) => any;
    canDropForeignDragObject?: (
      dragObject: any,
      target: ItemInstance<T>
    ) => boolean;
  };
  treeInstance: {};
  itemInstance: {};
  hotkeys: never;
};
