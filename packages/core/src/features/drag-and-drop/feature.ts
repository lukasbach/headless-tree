import { FeatureDefs, FeatureImplementation } from "../../types/core";
import { DndDataRef, DragAndDropFeatureDef } from "./types";
import { canDrop, getDragCode, getDropTarget } from "./utils";

export const dragAndDropFeature: FeatureImplementation<
  any,
  DragAndDropFeatureDef<any>,
  FeatureDefs<any>
> = {
  key: "dragAndDrop",
  dependingFeatures: ["main", "tree", "selection"],

  getDefaultConfig: (defaultConfig) => ({
    canDrop: (_, target) => target.item.isFolder(),
    ...defaultConfig,
  }),

  createTreeInstance: (prev, tree) => ({
    ...prev,

    getDropTarget: () => {
      return tree.getDataRef<DndDataRef<any>>().current.dragTarget ?? null;
    },
  }),

  createItemInstance: (prev, item, tree) => ({
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
          tree.setSelectedItems([item.getItemMeta().itemId]);
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
        const target = getDropTarget(e, item, tree);
        const dataRef = tree.getDataRef<DndDataRef<any>>();

        if (
          !dataRef.current.draggedItems &&
          !tree.getConfig().canDropForeignDragObject?.(e.dataTransfer, target)
        ) {
          return;
        }

        if (!canDrop(e, target, tree)) {
          return;
        }

        e.preventDefault();
        const nextDragCode = getDragCode(target);

        if (nextDragCode === dataRef.current.lastDragCode) {
          return;
        }

        dataRef.current.lastDragCode = nextDragCode;
        dataRef.current.dragTarget = target;
        dataRef.current.draggingOverItem = item;
        tree.getConfig().onUpdateDragPosition?.(target);
      },

      onDragLeave: () => {
        const dataRef = tree.getDataRef<DndDataRef<any>>();
        dataRef.current.lastDragCode = "left";
        dataRef.current.dragTarget = undefined;
        dataRef.current.draggingOverItem = undefined;
        tree.getConfig().onUpdateDragPosition?.(null);
      },

      onDrop: (e) => {
        const dataRef = tree.getDataRef<DndDataRef<any>>();
        const target = getDropTarget(e, item, tree);

        if (!canDrop(e, target, tree)) {
          return;
        }

        e.preventDefault();
        const config = tree.getConfig();
        const { draggedItems } = tree.getDataRef<DndDataRef<any>>().current;

        dataRef.current.lastDragCode = undefined;
        dataRef.current.dragTarget = undefined;
        tree.getConfig().onUpdateDragPosition?.(null);

        if (draggedItems) {
          config.onDrop?.(draggedItems, target);
        } else {
          config.onDropForeignDragObject?.(e.dataTransfer, target);
        }
        // TODO rebuild tree?
      },
    }),

    isDropTarget: () => {
      const target = tree.getDropTarget();
      return target ? target.item.getId() === item.getId() : false;
    },

    isDropTargetAbove: () => {
      const target = tree.getDropTarget();

      if (!target || target.childIndex === null) return false;
      const targetIndex = target.item.getItemMeta().index;

      return targetIndex + target.childIndex + 1 === item.getItemMeta().index;
    },

    isDropTargetBelow: () => {
      const target = tree.getDropTarget();

      if (!target || target.childIndex === null) return false;
      const targetIndex = target.item.getItemMeta().index;

      return targetIndex + target.childIndex === item.getItemMeta().index;
    },

    isDraggingOver: () => {
      return (
        tree.getDataRef<DndDataRef<any>>().current.draggingOverItem?.getId() ===
        item.getId()
      );
    },
  }),
};
