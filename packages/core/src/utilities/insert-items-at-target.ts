import { ItemInstance } from "../types/core";
import { DropTarget } from "../features/drag-and-drop/types";

export const insertItemsAtTarget = async <T>(
  itemIds: string[],
  target: DropTarget<T>,
  onChangeChildren: (
    item: ItemInstance<T>,
    newChildrenIds: string[],
  ) => Promise<void> | void,
) => {
  // add moved items to new common parent, if dropped onto parent
  if (!("childIndex" in target)) {
    const newChildren = [
      ...target.item.getChildren().map((item) => item.getId()),
      ...itemIds,
    ];
    await onChangeChildren(target.item, newChildren);
    if (target.item && "updateCachedChildrenIds" in target.item) {
      target.item.updateCachedChildrenIds(newChildren);
    }
    target.item.getTree().rebuildTree();
    return;
  }

  // add moved items to new common parent, if dropped between siblings
  const oldChildren = target.item.getChildren();
  const newChildren = [
    ...oldChildren.slice(0, target.insertionIndex).map((item) => item.getId()),
    ...itemIds,
    ...oldChildren.slice(target.insertionIndex).map((item) => item.getId()),
  ];

  await onChangeChildren(target.item, newChildren);

  if (target.item && "updateCachedChildrenIds" in target.item) {
    target.item.updateCachedChildrenIds(newChildren);
  }
  target.item.getTree().rebuildTree();
};
