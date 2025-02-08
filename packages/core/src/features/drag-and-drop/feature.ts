import { FeatureDefs, FeatureImplementation } from "../../types/core";
import { DndDataRef, DragAndDropFeatureDef, DragLineData } from "./types";
import { canDrop, getDragCode, getDropTarget } from "./utils";
import { makeStateUpdater } from "../../utils";

export const dragAndDropFeature: FeatureImplementation<
  any,
  DragAndDropFeatureDef<any>,
  FeatureDefs<any>
> = {
  key: "dragAndDrop",
  deps: ["selection"],

  getDefaultConfig: (defaultConfig, tree) => ({
    canDrop: (_, target) => target.item.isFolder(),
    canDropForeignDragObject: () => false,
    setDndState: makeStateUpdater("dnd", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    dnd: "setDndState",
  },

  treeInstance: {
    getDropTarget: ({ tree }) => {
      return tree.getState().dnd?.dragTarget ?? null;
    },

    getDragLineData: ({ tree }): DragLineData | null => {
      const target = tree.getDropTarget();
      const intend = (target?.item.getItemMeta().level ?? 0) + 1; // TODO rename to indent

      if (!target || target.childIndex === null) return null;

      const leftOffset = target.dragLineLevel * (tree.getConfig().indent ?? 1);
      const targetItem = tree.getItems()[target.dragLineIndex];

      if (!targetItem) {
        const bb = tree
          .getItems()
          [target.dragLineIndex - 1]?.getElement()
          ?.getBoundingClientRect();

        if (bb) {
          return {
            intend,
            top: bb.bottom,
            left: bb.left + leftOffset,
            right: bb.right,
          };
        }
      }

      const bb = targetItem.getElement()?.getBoundingClientRect();

      if (bb) {
        return {
          intend,
          top: bb.top,
          left: bb.left + leftOffset,
          right: bb.right,
        };
      }

      return null;
    },

    getDragLineStyle: ({ tree }, topOffset = -1, leftOffset = -8) => {
      const dragLine = tree.getDragLineData();
      return dragLine
        ? {
            top: `${dragLine.top + topOffset}px`,
            left: `${dragLine.left + leftOffset}px`,
            width: `${dragLine.right - dragLine.left - leftOffset}px`,
            pointerEvents: "none", // important to prevent capturing drag events
          }
        : { display: "none" };
    },
  },

  itemInstance: {
    // TODO instead of individual getMemoizedProp calls, use a wrapped getMemoizedProps or something (getProps: () => getMemoized({...})
    getProps: ({ tree, item, prev }) => ({
      ...prev?.(),

      draggable: tree.getConfig().isItemDraggable?.(item) ?? true,

      onDragStart: item.getMemoizedProp(
        "dnd/onDragStart",
        () => (e: DragEvent) => {
          const selectedItems = tree.getSelectedItems();
          const items = selectedItems.includes(item) ? selectedItems : [item];
          const config = tree.getConfig();

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

          tree.applySubStateUpdate("dnd", {
            draggedItems: items,
            draggingOverItem: tree.getFocusedItem(),
          });
        },
      ),

      onDragOver: item.getMemoizedProp(
        "dnd/onDragOver",
        () => (e: DragEvent) => {
          const dataRef = tree.getDataRef<DndDataRef>();
          const nextDragCode = getDragCode(e, item, tree);
          if (nextDragCode === dataRef.current.lastDragCode) {
            if (dataRef.current.lastAllowDrop) {
              e.preventDefault();
            }
            return;
          }
          dataRef.current.lastDragCode = nextDragCode;

          const target = getDropTarget(e, item, tree);

          if (
            !tree.getState().dnd?.draggedItems &&
            (!e.dataTransfer ||
              !tree
                .getConfig()
                .canDropForeignDragObject?.(e.dataTransfer, target))
          ) {
            dataRef.current.lastAllowDrop = false;
            return;
          }

          if (!canDrop(e.dataTransfer, target, tree)) {
            dataRef.current.lastAllowDrop = false;
            return;
          }

          tree.applySubStateUpdate("dnd", (state) => ({
            ...state,
            dragTarget: target,
            draggingOverItem: item,
          }));
          dataRef.current.lastAllowDrop = true;
          e.preventDefault();
        },
      ),

      onDragLeave: item.getMemoizedProp("dnd/onDragLeave", () => () => {
        const dataRef = tree.getDataRef<DndDataRef>();
        dataRef.current.lastDragCode = "no-drag";
        tree.applySubStateUpdate("dnd", (state) => ({
          ...state,
          draggingOverItem: undefined,
          dragTarget: undefined,
        }));
      }),

      onDragEnd: item.getMemoizedProp("dnd/onDragEnd", () => (e: DragEvent) => {
        const draggedItems = tree.getState().dnd?.draggedItems;
        tree.applySubStateUpdate("dnd", null);

        if (e.dataTransfer?.dropEffect === "none" || !draggedItems) {
          return;
        }

        tree.getConfig().onCompleteForeignDrop?.(draggedItems);
      }),

      onDrop: item.getMemoizedProp("dnd/onDrop", () => (e: DragEvent) => {
        const dataRef = tree.getDataRef<DndDataRef>();
        const target = getDropTarget(e, item, tree);

        if (!canDrop(e.dataTransfer, target, tree)) {
          return;
        }

        e.preventDefault();
        const config = tree.getConfig();
        const draggedItems = tree.getState().dnd?.draggedItems;

        dataRef.current.lastDragCode = undefined;
        tree.applySubStateUpdate("dnd", null);

        if (draggedItems) {
          config.onDrop?.(draggedItems, target);
        } else if (e.dataTransfer) {
          config.onDropForeignDragObject?.(e.dataTransfer, target);
        }
        // TODO rebuild tree?
      }),
    }),

    isDropTarget: ({ tree, item }) => {
      const target = tree.getDropTarget();
      return target ? target.item.getId() === item.getId() : false;
    },

    isDropTargetAbove: ({ tree, item }) => {
      const target = tree.getDropTarget();

      if (
        !target ||
        target.childIndex === null ||
        target.item !== item.getParent()
      )
        return false;
      return target.childIndex === item.getItemMeta().posInSet;
    },

    isDropTargetBelow: ({ tree, item }) => {
      const target = tree.getDropTarget();

      if (
        !target ||
        target.childIndex === null ||
        target.item !== item.getParent()
      )
        return false;
      return target.childIndex - 1 === item.getItemMeta().posInSet;
    },

    isDraggingOver: ({ tree, item }) => {
      return tree.getState().dnd?.draggingOverItem?.getId() === item.getId();
    },
  },
};
