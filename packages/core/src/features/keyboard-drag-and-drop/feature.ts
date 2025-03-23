import { FeatureImplementation } from "../../types/core";
import { DndDataRef } from "../drag-and-drop/types";
import { canDrop } from "../drag-and-drop/utils";

export const keyboardDragAndDropFeature: FeatureImplementation = {
  key: "keyboard-drag-and-drop",
  deps: ["drag-and-drop"],

  hotkeys: {
    startDrag: {
      hotkey: "Control+Shift+D",
      isEnabled: (tree) => !tree.getState().dnd,
      handler: (_, tree) => {
        const focusedItem = tree.getFocusedItem();
        tree.applySubStateUpdate("dnd", {
          draggedItems: tree.getSelectedItems(),
          dragTarget: {
            item: focusedItem.getParent()!, // TODO
            childIndex: focusedItem.getIndexInParent(),
            insertionIndex: focusedItem.getIndexInParent(),
            dragLineIndex: focusedItem.getIndexInParent(),
            dragLineLevel: focusedItem.getItemMeta().level,
          },
        });
      },
    },
    cancelDrag: {
      hotkey: "Escape",
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        tree.applySubStateUpdate("dnd", null);
      },
    },
    completeDrag: {
      hotkey: "Enter",
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: async (_, tree) => {
        // TODO copied from keyboard onDrop, unify them
        const dataRef = tree.getDataRef<DndDataRef>();
        const target = tree.getDropTarget();

        if (!target || !canDrop(null, target, tree)) {
          return;
        }

        const config = tree.getConfig();
        const draggedItems = tree.getState().dnd?.draggedItems;

        dataRef.current.lastDragCode = undefined;
        tree.applySubStateUpdate("dnd", null);

        if (draggedItems) {
          await config.onDrop?.(draggedItems, target);
        } // TODO else if foreign drag
      },
    },
  },
};
