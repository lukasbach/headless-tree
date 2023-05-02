import { FeatureImplementation } from "../../types/core";
import { DndDataRef, DragAndDropFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";
import { SelectionFeatureDef } from "../selection/types";

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
    }),
  }),
};
