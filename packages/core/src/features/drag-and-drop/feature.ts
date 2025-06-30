import { FeatureImplementation } from "../../types/core";
import { DndDataRef, DragLineData, DragTarget } from "./types";
import {
  canDrop,
  getDragCode,
  getDragTarget,
  isOrderedDragTarget,
} from "./utils";
import { makeStateUpdater } from "../../utils";

export const dragAndDropFeature: FeatureImplementation = {
  key: "drag-and-drop",
  deps: ["selection"],

  getDefaultConfig: (defaultConfig, tree) => ({
    canDrop: (_, target) => target.item.isFolder(),
    canDropForeignDragObject: () => false,
    setDndState: makeStateUpdater("dnd", tree),
    canReorder: true,
    ...defaultConfig,
  }),

  stateHandlerNames: {
    dnd: "setDndState",
  },

  treeInstance: {
    getDragTarget: ({ tree }) => {
      return tree.getState().dnd?.dragTarget ?? null;
    },

    getDragLineData: ({ tree }): DragLineData | null => {
      const target = tree.getDragTarget();
      const indent = (target?.item.getItemMeta().level ?? 0) + 1;

      const treeBb = tree.getElement()?.getBoundingClientRect();

      if (!target || !treeBb || !isOrderedDragTarget(target)) return null;

      const leftOffset = target.dragLineLevel * (tree.getConfig().indent ?? 1);
      const targetItem = tree.getItems()[target.dragLineIndex];

      if (!targetItem) {
        const bb = tree
          .getItems()
          [target.dragLineIndex - 1]?.getElement()
          ?.getBoundingClientRect();

        if (bb) {
          return {
            indent,
            top: bb.bottom - treeBb.top,
            left: bb.left + leftOffset - treeBb.left,
            width: bb.width - leftOffset,
          };
        }
      }

      const bb = targetItem.getElement()?.getBoundingClientRect();

      if (bb) {
        return {
          indent,
          top: bb.top - treeBb.top,
          left: bb.left + leftOffset - treeBb.left,
          width: bb.width - leftOffset,
        };
      }

      return null;
    },

    getDragLineStyle: ({ tree }, topOffset = -1, leftOffset = -8) => {
      const dragLine = tree.getDragLineData();
      return dragLine
        ? {
            position: "absolute",
            top: `${dragLine.top + topOffset}px`,
            left: `${dragLine.left + leftOffset}px`,
            width: `${dragLine.width - leftOffset}px`,
            pointerEvents: "none", // important to prevent capturing drag events
          }
        : { display: "none" };
    },

    getContainerProps: ({ prev, tree }, treeLabel) => {
      const prevProps = prev?.(treeLabel);
      return {
        ...prevProps,

        onDragOver: (e: DragEvent) => {
          e.preventDefault();
        },

        onDrop: async (e: DragEvent) => {
          // TODO merge implementation with itemInstance.onDrop
          const dataRef = tree.getDataRef<DndDataRef>();
          const target: DragTarget<any> = { item: tree.getRootItem() };

          if (!canDrop(e.dataTransfer, target, tree)) {
            return;
          }

          e.preventDefault();
          const config = tree.getConfig();
          const draggedItems = tree.getState().dnd?.draggedItems;

          dataRef.current.lastDragCode = undefined;
          tree.applySubStateUpdate("dnd", null);

          if (draggedItems) {
            await config.onDrop?.(draggedItems, target);
          } else if (e.dataTransfer) {
            await config.onDropForeignDragObject?.(e.dataTransfer, target);
          }
        },

        style: {
          ...prevProps?.style,
          position: "relative",
        },
      };
    },
  },

  itemInstance: {
    getProps: ({ tree, item, prev }) => ({
      ...prev?.(),

      draggable: true,

      onDragEnter: (e: DragEvent) => e.preventDefault(),

      onDragStart: (e: DragEvent) => {
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

        if (config.setDragImage) {
          const { imgElement, xOffset, yOffset } = config.setDragImage(items);
          e.dataTransfer?.setDragImage(imgElement, xOffset ?? 0, yOffset ?? 0);
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

      onDragOver: (e: DragEvent) => {
        const dataRef = tree.getDataRef<DndDataRef>();
        const nextDragCode = getDragCode(e, item, tree);
        if (nextDragCode === dataRef.current.lastDragCode) {
          if (dataRef.current.lastAllowDrop) {
            e.preventDefault();
          }
          return;
        }
        dataRef.current.lastDragCode = nextDragCode;

        const target = getDragTarget(e, item, tree);

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

      onDragLeave: () => {
        const dataRef = tree.getDataRef<DndDataRef>();
        dataRef.current.lastDragCode = "no-drag";
        tree.applySubStateUpdate("dnd", (state) => ({
          ...state,
          draggingOverItem: undefined,
          dragTarget: undefined,
        }));
      },

      onDragEnd: (e: DragEvent) => {
        const draggedItems = tree.getState().dnd?.draggedItems;
        tree.applySubStateUpdate("dnd", null);

        if (e.dataTransfer?.dropEffect === "none" || !draggedItems) {
          return;
        }

        tree.getConfig().onCompleteForeignDrop?.(draggedItems);
      },

      onDrop: async (e: DragEvent) => {
        e.stopPropagation();
        const dataRef = tree.getDataRef<DndDataRef>();
        const target = getDragTarget(e, item, tree);

        if (!canDrop(e.dataTransfer, target, tree)) {
          return;
        }

        e.preventDefault();
        const config = tree.getConfig();
        const draggedItems = tree.getState().dnd?.draggedItems;

        dataRef.current.lastDragCode = undefined;
        tree.applySubStateUpdate("dnd", null);

        if (draggedItems) {
          await config.onDrop?.(draggedItems, target);
        } else if (e.dataTransfer) {
          await config.onDropForeignDragObject?.(e.dataTransfer, target);
        }
      },
    }),

    isDragTarget: ({ tree, item }) => {
      const target = tree.getDragTarget();
      return target ? target.item.getId() === item.getId() : false;
    },

    isDragTargetAbove: ({ tree, item }) => {
      const target = tree.getDragTarget();

      if (
        !target ||
        !isOrderedDragTarget(target) ||
        target.item !== item.getParent()
      )
        return false;
      return target.childIndex === item.getItemMeta().posInSet;
    },

    isDragTargetBelow: ({ tree, item }) => {
      const target = tree.getDragTarget();

      if (
        !target ||
        !isOrderedDragTarget(target) ||
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
