import { ItemInstance } from "../types/core";

export const removeItemsFromParents = <T>(
  movedItems: ItemInstance<T>[],
  onChangeChildren: (item: ItemInstance<T>, newChildrenIds: string[]) => void,
) => {
  // TODO bulk sibling changes together
  for (const item of movedItems) {
    const siblings = item.getParent()?.getChildren();
    if (siblings) {
      onChangeChildren(
        item.getParent(),
        siblings
          .filter((sibling) => sibling.getId() !== item.getId())
          .map((i) => i.getId()),
      );
    }
  }

  movedItems[0].getTree().rebuildTree();
};
