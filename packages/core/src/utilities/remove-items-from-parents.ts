import { ItemInstance } from "../types/core";

export const removeItemsFromParents = async <T>(
  movedItems: ItemInstance<T>[],
  onChangeChildren: (
    item: ItemInstance<T>,
    newChildrenIds: string[],
  ) => void | Promise<void>,
) => {
  const movedItemsIds = movedItems.map((item) => item.getId());
  const uniqueParents = [
    ...new Set(movedItems.map((item) => item.getParent())),
  ];

  for (const parent of uniqueParents) {
    const siblings = parent?.getChildren();
    if (siblings && parent) {
      const newChildren = siblings
        .filter((sibling) => !movedItemsIds.includes(sibling.getId()))
        .map((i) => i.getId());
      await onChangeChildren(parent, newChildren);
      if (parent && "updateCachedChildrenIds" in parent) {
        parent?.updateCachedChildrenIds(newChildren);
      }
    }
  }

  movedItems[0].getTree().rebuildTree();
};
