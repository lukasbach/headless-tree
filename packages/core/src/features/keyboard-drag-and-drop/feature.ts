import { FeatureImplementation, TreeInstance } from "../../types/core";
import { DndDataRef, DropTarget } from "../drag-and-drop/types";
import {
  ItemDropCategory,
  canDrop,
  getItemDropCategory,
  getReparentTarget,
} from "../drag-and-drop/utils";

const getNextDropTarget = <T>(
  tree: TreeInstance<T>,
  isUp: boolean,
  dragTarget: DropTarget<T>,
): DropTarget<T> | undefined => {
  const state = tree.getState().dnd;
  const direction = isUp ? 0 : 1;

  // currently hovering between items
  if ("childIndex" in dragTarget) {
    const parent = dragTarget.item.getParent();
    const targetedItem = tree.getItems()[dragTarget.dragLineIndex - 1]; // item above dragline

    const targetCategory = targetedItem
      ? getItemDropCategory(targetedItem)
      : ItemDropCategory.Item;
    const maxLevel = targetedItem?.getItemMeta().level ?? 0;
    const minLevel = targetedItem?.getItemBelow()?.getItemMeta().level ?? 0;

    // reparenting
    if (targetCategory === ItemDropCategory.LastInGroup) {
      if (isUp && dragTarget.dragLineLevel < maxLevel) {
        return getReparentTarget(targetedItem, dragTarget.dragLineLevel + 1);
      }
      if (!isUp && dragTarget.dragLineLevel > minLevel && parent) {
        return getReparentTarget(targetedItem, dragTarget.dragLineLevel - 1);
      }
    }

    const newIndex = dragTarget.dragLineIndex - 1 + direction;
    return { item: tree.getItems()[newIndex] };
  }

  // moving upwards outside of an open folder
  const targetingExpandedFolder =
    getItemDropCategory(dragTarget.item) === ItemDropCategory.ExpandedFolder;
  if (targetingExpandedFolder && !isUp) {
    return {
      item: dragTarget.item,
      childIndex: 0,
      insertionIndex: 0, // TODO everywhere!
      dragLineIndex: dragTarget.item.getItemMeta().index + direction,
      dragLineLevel: dragTarget.item.getItemMeta().level + 1,
    };
  }

  // currently hovering over item
  return {
    item: dragTarget.item.getParent()!,
    childIndex: dragTarget.item.getIndexInParent() + direction,
    insertionIndex: dragTarget.item.getIndexInParent() + direction, // TODO everywhere!
    dragLineIndex: dragTarget.item.getItemMeta().index + direction,
    dragLineLevel: dragTarget.item.getItemMeta().level,
  };
};

const getNextValidDropTarget = <T>(
  tree: TreeInstance<T>,
  isUp: boolean,
  previousTarget = tree.getState().dnd?.dragTarget,
): DropTarget<T> | undefined => {
  if (!previousTarget) return undefined;
  const nextTarget = getNextDropTarget(tree, isUp, previousTarget);
  if (!nextTarget) return undefined;
  if (canDrop(null, nextTarget, tree)) {
    return nextTarget;
  }
  return getNextValidDropTarget(tree, isUp, nextTarget);
};

const updateScroll = <T>(tree: TreeInstance<T>) => {
  const state = tree.getState().dnd;
  if (!state?.dragTarget || "childIndex" in state.dragTarget) return;
  state.dragTarget.item.scrollTo({ block: "nearest", inline: "nearest" });
};

export const keyboardDragAndDropFeature: FeatureImplementation = {
  key: "keyboard-drag-and-drop",
  deps: ["drag-and-drop"],

  hotkeys: {
    startDrag: {
      hotkey: "Control+Shift+D",
      preventDefault: true,
      isEnabled: (tree) => !tree.getState().dnd,
      handler: (_, tree) => {
        const focusedItem = tree.getFocusedItem();
        console.log("!!!!!", focusedItem.getIndexInParent());
        tree.applySubStateUpdate("dnd", {
          draggedItems: tree.getSelectedItems(),
          dragTarget: {
            item: focusedItem.getParent()!, // TODO
            childIndex: focusedItem.getIndexInParent(),
            insertionIndex: focusedItem.getIndexInParent(), // TODO
            dragLineIndex: focusedItem.getItemMeta().index,
            dragLineLevel: focusedItem.getItemMeta().level,
          },
        });
      },
    },
    dragUp: {
      hotkey: "ArrowUp",
      preventDefault: true,
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        // console.log(tree.getState().dnd);
        tree.applySubStateUpdate("dnd", {
          draggedItems: tree.getState().dnd?.draggedItems,
          dragTarget: getNextValidDropTarget(tree, true),
        });
        updateScroll(tree);
      },
    },
    dragDown: {
      hotkey: "ArrowDown",
      preventDefault: true,
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        // console.log(tree.getState().dnd);
        tree.applySubStateUpdate("dnd", {
          draggedItems: tree.getState().dnd?.draggedItems,
          dragTarget: getNextValidDropTarget(tree, false),
        });
        updateScroll(tree);
      },
    },
    cancelDrag: {
      hotkey: "Escape",
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        console.log("!!");
        tree.applySubStateUpdate("dnd", null);
      },
    },
    completeDrag: {
      hotkey: "Enter",
      preventDefault: true,
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: async (e, tree) => {
        e.stopPropagation();
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
