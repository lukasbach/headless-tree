import {
  FeatureImplementation,
  ItemInstance,
  TreeInstance,
} from "../../types/core";
import { DndDataRef, DragTarget } from "../drag-and-drop/types";
import {
  ItemDropCategory,
  canDrop,
  getInsertionIndex,
  getItemDropCategory,
  getReparentTarget,
} from "../drag-and-drop/utils";
import { makeStateUpdater } from "../../utils";
import { AssistiveDndState, KDndDataRef } from "./types";

const getNextDragTarget = <T>(
  tree: TreeInstance<T>,
  isUp: boolean,
  dragTarget: DragTarget<T>,
): DragTarget<T> | undefined => {
  const direction = isUp ? 0 : 1;
  const draggedItems = tree.getState().dnd?.draggedItems;

  // currently hovering between items
  if ("childIndex" in dragTarget) {
    // TODO move check in reusable function
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
        return getReparentTarget(
          targetedItem,
          dragTarget.dragLineLevel + 1,
          draggedItems,
        );
      }
      if (!isUp && dragTarget.dragLineLevel > minLevel && parent) {
        return getReparentTarget(
          targetedItem,
          dragTarget.dragLineLevel - 1,
          draggedItems,
        );
      }
    }

    const newIndex = dragTarget.dragLineIndex - 1 + direction;
    const item = tree.getItems()[newIndex];
    return item ? { item } : undefined;
  }

  // moving upwards outside of an open folder
  const targetingExpandedFolder =
    getItemDropCategory(dragTarget.item) === ItemDropCategory.ExpandedFolder;
  if (targetingExpandedFolder && !isUp) {
    return {
      item: dragTarget.item,
      childIndex: 0,
      insertionIndex: getInsertionIndex(
        dragTarget.item.getChildren(),
        0,
        draggedItems,
      ),
      dragLineIndex: dragTarget.item.getItemMeta().index + direction,
      dragLineLevel: dragTarget.item.getItemMeta().level + 1,
    };
  }

  // currently hovering over item
  const childIndex = dragTarget.item.getIndexInParent() + direction;
  return {
    item: dragTarget.item.getParent()!,
    childIndex,
    insertionIndex: getInsertionIndex(
      dragTarget.item.getParent()!.getChildren(),
      childIndex,
      draggedItems,
    ),
    dragLineIndex: dragTarget.item.getItemMeta().index + direction,
    dragLineLevel: dragTarget.item.getItemMeta().level,
  };
};

const getNextValidDragTarget = <T>(
  tree: TreeInstance<T>,
  isUp: boolean,
  previousTarget = tree.getState().dnd?.dragTarget,
): DragTarget<T> | undefined => {
  if (!previousTarget) return undefined;
  const nextTarget = getNextDragTarget(tree, isUp, previousTarget);
  const dataTransfer =
    tree.getDataRef<KDndDataRef>().current.kDndDataTransfer ?? null;
  if (!nextTarget) return undefined;
  if (canDrop(dataTransfer, nextTarget, tree)) {
    return nextTarget;
  }
  return getNextValidDragTarget(tree, isUp, nextTarget);
};

const updateScroll = <T>(tree: TreeInstance<T>) => {
  const state = tree.getState().dnd;
  if (!state?.dragTarget || "childIndex" in state.dragTarget) return;
  state.dragTarget.item.scrollTo({ block: "nearest", inline: "nearest" });
};

const initiateDrag = <T>(
  tree: TreeInstance<T>,
  draggedItems?: ItemInstance<T>[],
  dataTransfer?: DataTransfer,
) => {
  const focusedItem = tree.getFocusedItem();
  const { canDrag } = tree.getConfig();

  if (draggedItems && canDrag && !canDrag(draggedItems)) {
    return;
  }

  if (draggedItems) {
    tree.applySubStateUpdate("dnd", { draggedItems });
    // getNextValidDragTarget->canDrop needs the draggedItems in state
    tree.getConfig().onStartKeyboardDrag?.(draggedItems);
  } else if (dataTransfer) {
    tree.getDataRef<KDndDataRef>().current.kDndDataTransfer = dataTransfer;
  }

  const dragTarget = getNextValidDragTarget(tree, false, {
    item: focusedItem,
  });
  if (!dragTarget) return;

  tree.applySubStateUpdate("dnd", {
    draggedItems,
    dragTarget,
  });
  tree.applySubStateUpdate("assistiveDndState", AssistiveDndState.Started);
  updateScroll(tree);
};

const moveDragPosition = <T>(tree: TreeInstance<T>, isUp: boolean) => {
  const dragTarget = getNextValidDragTarget(tree, isUp);
  if (!dragTarget) return;
  tree.applySubStateUpdate("dnd", {
    draggedItems: tree.getState().dnd?.draggedItems,
    dragTarget,
  });
  tree.applySubStateUpdate("assistiveDndState", AssistiveDndState.Dragging);
  if (!("childIndex" in dragTarget)) {
    dragTarget.item.setFocused();
  }
  updateScroll(tree);
};

export const keyboardDragAndDropFeature: FeatureImplementation = {
  key: "keyboard-drag-and-drop",
  deps: ["drag-and-drop"],

  getDefaultConfig: (defaultConfig, tree) => ({
    setAssistiveDndState: makeStateUpdater("assistiveDndState", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    assistiveDndState: "setAssistiveDndState",
  },

  treeInstance: {
    startKeyboardDrag: ({ tree }, draggedItems) => {
      initiateDrag(tree, draggedItems, undefined);
    },
    startKeyboardDragOnForeignObject: ({ tree }, dataTransfer) => {
      initiateDrag(tree, undefined, dataTransfer);
    },
    stopKeyboardDrag: ({ tree }) => {
      tree.getDataRef<KDndDataRef>().current.kDndDataTransfer = undefined;
      tree.applySubStateUpdate("dnd", null);
      tree.applySubStateUpdate("assistiveDndState", AssistiveDndState.None);
    },
  },

  hotkeys: {
    startDrag: {
      hotkey: "Control+Shift+D",
      preventDefault: true,
      isEnabled: (tree) => !tree.getState().dnd,
      handler: (_, tree) => {
        tree.startKeyboardDrag(tree.getSelectedItems());
      },
    },
    dragUp: {
      hotkey: "ArrowUp",
      preventDefault: true,
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        moveDragPosition(tree, true);
      },
    },
    dragDown: {
      hotkey: "ArrowDown",
      preventDefault: true,
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        moveDragPosition(tree, false);
      },
    },
    cancelDrag: {
      hotkey: "Escape",
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: (_, tree) => {
        tree.stopKeyboardDrag();
      },
    },
    completeDrag: {
      hotkey: "Enter",
      preventDefault: true,
      isEnabled: (tree) => !!tree.getState().dnd,
      handler: async (e, tree) => {
        e.stopPropagation();
        // TODO copied from keyboard onDrop, unify them
        const dataRef = tree.getDataRef<DndDataRef & KDndDataRef>();
        const target = tree.getDragTarget();
        const dataTransfer = dataRef.current.kDndDataTransfer ?? null;

        if (!target || !canDrop(dataTransfer, target, tree)) {
          return;
        }

        const config = tree.getConfig();
        const draggedItems = tree.getState().dnd?.draggedItems;

        dataRef.current.lastDragCode = undefined;
        tree.applySubStateUpdate("dnd", null);

        if (draggedItems) {
          await config.onDrop?.(draggedItems, target);
          tree.getItemInstance(draggedItems[0].getId()).setFocused();
        } else if (dataTransfer) {
          await config.onDropForeignDragObject?.(dataTransfer, target);
        }

        tree.applySubStateUpdate(
          "assistiveDndState",
          AssistiveDndState.Completed,
        );
      },
    },
  },
};
