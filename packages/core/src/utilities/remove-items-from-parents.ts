import { ItemInstance } from "../types/core";

export const removeItemsFromParents = <T>(
  movedItems: ItemInstance<T>[],
  onChangeChildren: (item: ItemInstance<T>, newChildrenIds: string[]) => void,
) => {
  const movedItemsIds = movedItems.map((item) => item.getId());
  const uniqueParents = [
    ...new Set(movedItems.map((item) => item.getParent())),
  ];

  for (const parent of uniqueParents) {
    const siblings = parent?.getChildren();
    if (siblings && parent) {
      onChangeChildren(
        parent,
        siblings
          .filter((sibling) => !movedItemsIds.includes(sibling.getId()))
          .map((i) => i.getId()),
      );
    }
  }

  for (const parent of uniqueParents) {
    parent?.invalidateChildrenIds?.();
  }

  movedItems[0].getTree().rebuildTree();
};
