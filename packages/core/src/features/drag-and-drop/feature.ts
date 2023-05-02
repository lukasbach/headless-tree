import {
  FeatureImplementation,
  ItemInstance,
  TreeInstance,
} from "../../types/core";
import { DndDataRef, DragAndDropFeatureDef, DropTarget } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";
import { SelectionFeatureDef } from "../selection/types";

const getDropTarget = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>
) => {
  const config = tree.getConfig();
  const bb = item.getElement()?.getBoundingClientRect();
  const verticalPos = bb ? (e.pageY - bb.top) / bb.height : 0.5;
  const pos =
    // eslint-disable-next-line no-nested-ternary
    verticalPos < (config.topLinePercentage ?? 0.2)
      ? DropTarget.Top
      : verticalPos > (config.bottomLinePercentage ?? 0.8)
      ? DropTarget.Bottom
      : DropTarget.Item;

  if (config.canDropInbetween) {
    return { item, index: null };
  }

  // TODO it's much more complicated than this..
  return {
    item: pos === DropTarget.Item ? item : item.getParent(),
    index:
      pos === DropTarget.Item
        ? null
        : item.getIndexInParent() + (pos === DropTarget.Top ? 0 : 1),
  };
};

const canDrop = (e: any, item: ItemInstance<any>, tree: TreeInstance<any>) => {
  const { draggedItems } = tree.getDataRef<DndDataRef<any>>().current;
  const config = tree.getConfig();
  const target = getDropTarget(e, item, tree);

  if (
    draggedItems &&
    !(config.canDrop?.(draggedItems, target.item, target.index) ?? true)
  ) {
    return false;
  }

  if (
    !draggedItems &&
    !config.canDropForeignDragObject?.(e.dataTransfer, item)
  ) {
    return false;
  }

  return true;
};

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
        if (!canDrop(e, item, tree)) {
          return;
        }

        e.preventDefault();

        // TODO store drag position, but only if actual drag position changed
      },

      onDrop: (e) => {
        if (!canDrop(e, item, tree)) {
          return;
        }

        e.preventDefault();
        const config = tree.getConfig();
        const { draggedItems } = tree.getDataRef<DndDataRef<any>>().current;
        const target = getDropTarget(e, item, tree);
        console.log(target);

        if (draggedItems) {
          config.onDrop?.(draggedItems, target.item, target.index);
        } else {
          config.onDropForeignDragObject?.(
            e.dataTransfer,
            target.item,
            target.index
          );
        }
      },
    }),
  }),
};
