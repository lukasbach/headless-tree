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
): DropTarget<T> | undefined => {
  const state = tree.getState().dnd;
  const direction = isUp ? 0 : 1;
  if (!state?.dragTarget) return undefined;
  console.log("!!!!!!!!!!!!!!!!!!!!!");
  console.log("!!!dragTarget.item", state.dragTarget.item.getId());

  if ("childIndex" in state.dragTarget) {
    const parent = state.dragTarget.item.getParent();
    // const targetedItem = // item above dragline
    //   state.dragTarget.item.getChildren()[state.dragTarget.childIndex - 1];
    const targetedItem = tree.getItems()[state.dragTarget.dragLineLevel + 1];
    const targetCategory = getItemDropCategory(targetedItem);
    const maxLevel = state.dragTarget.item.getItemMeta().level ?? 0;
    const minLevel =
      state.dragTarget.item.getItemBelow()?.getItemMeta().level ?? 0;
    console.log("!!!targetedItem", targetedItem.getId(), targetCategory);
    console.log("!!!parent", parent?.getId());

    if (targetCategory === ItemDropCategory.LastInGroup) {
      if (isUp && state.dragTarget.dragLineLevel < maxLevel) {
        return getReparentTarget(
          targetedItem, // .getItemAbove()!,
          state.dragTarget.dragLineLevel + 1,
        );
        // console.log("REPARENT UP");
        // return {
        //   ...state.dragTarget,
        //   // TODO insert all correct values, maybe consolidate with dnd utils
        //   // item: state.dragTarget.item.getChildren().at(-1)!,
        //   // childIndex: parent.getChildren().length - 1,
        //   // insertionIndex: parent.getChildren().length - 1,
        //   // dragLineIndex: state.dragTarget.dragLineIndex,
        //   dragLineLevel: state.dragTarget.dragLineLevel + 1,
        // };
      }
      if (!isUp && state.dragTarget.dragLineLevel >= minLevel && parent) {
        return getReparentTarget(
          targetedItem, // .getItemAbove()!,
          state.dragTarget.dragLineLevel - 1,
        );
        // console.log("REPARENT DOWN", state.dragTarget.dragLineLevel, {
        //   minLevel,
        // });
        // return {
        //   item: parent,
        //   childIndex: parent.getChildren().length - 1,
        //   insertionIndex: parent.getChildren().length - 1,
        //   dragLineIndex: state.dragTarget.dragLineIndex,
        //   dragLineLevel: state.dragTarget.dragLineLevel - 1,
        // };
      }
    }

    // const newIndex = targetedItem.getItemMeta().index + direction;
    const newIndex = state.dragTarget.dragLineIndex - 1 + direction;
    return { item: tree.getItems()[newIndex] };
  }

  if (
    getItemDropCategory(state.dragTarget.item) === "ExpandedFolder" &&
    !isUp
  ) {
    return {
      item: state.dragTarget.item,
      childIndex: 0,
      insertionIndex: 0, // TODO everywhere!
      dragLineIndex: state.dragTarget.item.getItemMeta().index + direction,
      dragLineLevel: state.dragTarget.item.getItemMeta().level + 1,
    };
  }

  // currently hovering over item
  return {
    item: state.dragTarget.item.getParent()!,
    childIndex: state.dragTarget.item.getIndexInParent() + direction,
    insertionIndex: state.dragTarget.item.getIndexInParent() + direction, // TODO everywhere!
    dragLineIndex: state.dragTarget.item.getItemMeta().index + direction,
    dragLineLevel: state.dragTarget.item.getItemMeta().level,
  };
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
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        // console.log(tree.getState().dnd);
        tree.applySubStateUpdate("dnd", {
          draggedItems: tree.getState().dnd?.draggedItems,
          dragTarget: getNextDropTarget(tree, true),
        });
      },
    },
    dragDown: {
      hotkey: "ArrowDown",
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        // console.log(tree.getState().dnd);
        tree.applySubStateUpdate("dnd", {
          draggedItems: tree.getState().dnd?.draggedItems,
          dragTarget: getNextDropTarget(tree, false),
        });
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
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: async (e, tree) => {
        e.preventDefault();
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
