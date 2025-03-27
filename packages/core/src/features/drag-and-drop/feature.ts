import { FeatureImplementation } from "../../types/core";
import { DndDataRef, DragLineData } from "./types";
import { canDrop, getDragCode, getDropTarget } from "./utils";
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
    getDropTarget: ({ tree }) => {
      return tree.getState().dnd?.dragTarget ?? null;
    },

    getDragLineData: ({ tree }): DragLineData | null => {
      const target = tree.getDropTarget();
      const indent = (target?.item.getItemMeta().level ?? 0) + 1;

      const treeBb = tree.getElement()?.getBoundingClientRect();

      if (!target || !treeBb || !("childIndex" in target)) return null;

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
            top: `${dragLine.top + topOffset}px`,
            left: `${dragLine.left + leftOffset}px`,
            width: `${dragLine.width - leftOffset}px`,
            pointerEvents: "none", // important to prevent capturing drag events
          }
        : { display: "none" };
    },

    getContainerProps: ({ prev }, treeLabel) => {
      const prevProps = prev?.(treeLabel);
      return {
        ...prevProps,
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
          await config.onDrop?.(draggedItems, target);
        } else if (e.dataTransfer) {
          await config.onDropForeignDragObject?.(e.dataTransfer, target);
        }
      },
    }),

    isDropTarget: ({ tree, item }) => {
      const target = tree.getDropTarget();
      return target ? target.item.getId() === item.getId() : false;
    },

    isDropTargetAbove: ({ tree, item }) => {
      const target = tree.getDropTarget();

      if (
        !target ||
        !("childIndex" in target) ||
        target.item !== item.getParent()
      )
        return false;
      return target.childIndex === item.getItemMeta().posInSet;
    },

    isDropTargetBelow: ({ tree, item }) => {
      const target = tree.getDropTarget();

      if (
        !target ||
        !("childIndex" in target) ||
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
