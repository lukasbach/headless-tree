import { FeatureImplementation } from "../../types/core";
import { DndDataRef, DragAndDropFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";
import { SelectionFeatureDef } from "../selection/types";
import { canDrop, getDragCode, getDropTarget } from "./utils";

export const dragAndDropFeature: FeatureImplementation<
  any,
  DragAndDropFeatureDef<any>,
  | MainFeatureDef
  | TreeFeatureDef<any>
  | SelectionFeatureDef<any>
  | DragAndDropFeatureDef<any>
> = {
  key: "dragAndDrop",
  dependingFeatures: ["main", "tree", "selection"],

  createTreeInstance: (prev, tree) => ({
    ...prev,

    getDropTarget: () => {
      return tree.getDataRef<DndDataRef<any>>().current.dragTarget ?? null;
    },
  }),

  createItemInstance: (prev, item, itemMeta, tree) => ({
    ...prev,

    getProps: () => ({
      ...prev.getProps(),

      draggable: tree.getConfig().isItemDraggable?.(item) ?? true,

      onDragStart: (e) => {
        const selectedItems = tree.getSelectedItems();
        const items = selectedItems.includes(item) ? selectedItems : [item];
        const config = tree.getConfig();
        const dataRef = tree.getDataRef<DndDataRef<any>>();

        if (!selectedItems.includes(item)) {
          tree.setSelectedItems([itemMeta.itemId]);
        }

        if (!(config.canDrag?.(items) ?? true)) {
          e.preventDefault();
          return;
        }

        if (config.createForeignDragObject) {
          const { format, data } = config.createForeignDragObject(items);
          e.dataTransfer?.setData(format, data);
        }

        dataRef.current.draggedItems = items;
      },

      onDragOver: (e) => {
        const dataRef = tree.getDataRef<DndDataRef<any>>();

        // TODO factor out target
        if (!canDrop(e, item, tree)) {
          return;
        }

        e.preventDefault();
        const target = getDropTarget(e, item, tree);
        const nextDragCode = getDragCode(target);

        if (nextDragCode === dataRef.current.lastDragCode) {
          return;
        }

        dataRef.current.lastDragCode = nextDragCode;
        dataRef.current.dragTarget = target;
        tree.getConfig().onUpdateDragPosition?.(target);
      },

      onDrop: (e) => {
        const dataRef = tree.getDataRef<DndDataRef<any>>();

        if (!canDrop(e, item, tree)) {
          return;
        }

        e.preventDefault();
        const config = tree.getConfig();
        const { draggedItems } = tree.getDataRef<DndDataRef<any>>().current;
        const target = getDropTarget(e, item, tree);

        dataRef.current.lastDragCode = undefined;
        dataRef.current.dragTarget = undefined;
        tree.getConfig().onUpdateDragPosition?.(null);

        if (draggedItems) {
          config.onDrop?.(draggedItems, target);
        } else {
          config.onDropForeignDragObject?.(e.dataTransfer, target);
        }
      },
    }),

    isDropTarget: () => {
      const target = tree.getDropTarget();
      return target ? target.item.getId() === item.getId() : false;
    },

    isDropTargetAbove: () => {
      const target = tree.getDropTarget();

      if (!target || target.index === null) return false;

      return (
        target.item.getItemMeta().index + target.index + 1 === itemMeta.index
      );
    },

    isDropTargetBelow: () => {
      const target = tree.getDropTarget();
      if (!target || target.index === null) return false;

      return target.item.getItemMeta().index + target.index === itemMeta.index;
    },
  }),
};
