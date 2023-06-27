import { ItemInstance } from "../types/core";

export const removeItemsFromParents = <T>(
  movedItems: ItemInstance<T>[],
  onChangeChildren: (
    item: ItemInstance<T>,
    newChildrenIds: ItemInstance<T>[]
  ) => void
) => {
  // TODO bulk sibling changes together
  for (const item of movedItems) {
    const siblings = item.getParent()?.getChildren();
    if (siblings) {
      onChangeChildren(
        item.getParent(),
        siblings.filter((sibling) => sibling.getId() !== item.getId())
      );
    }
  }

  movedItems[0].getTree().rebuildTree();
};
