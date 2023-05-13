import { DataAdapterConfig } from "./types";
import { ItemInstance } from "../types/core";
import { DropTarget } from "../features/drag-and-drop/types";

interface NestedDataAdapterProps<T> {
  rootItem: T;
  getItemId: (item: T) => string;
  getChildren: (item: T) => T[] | undefined;
  changeChildren?: (item: T, children: T[]) => void;
}

const createItemMap = <T>(
  props: NestedDataAdapterProps<T>,
  item: T,
  map: Record<string, T> = {}
) => {
  map[props.getItemId(item)] = item;
  props.getChildren(item)?.forEach((child) => {
    createItemMap(props, child, map);
  });
  return map;
};

export const nestedDataAdapter = <T = any>(
  props: NestedDataAdapterProps<T>
): DataAdapterConfig<T> => {
  const itemMap = createItemMap(props, props.rootItem);
  return {
    rootItemId: props.getItemId(props.rootItem),
    dataLoader: {
      getItem: (itemId) => itemMap[itemId],
      getChildren: (itemId) =>
        props.getChildren(itemMap[itemId])?.map(props.getItemId) ?? [],
    },
    onDrop: (items: ItemInstance<T>[], target: DropTarget<T>) => {
      if (!props.changeChildren) {
        return;
      }

      // TODO bulk sibling changes together
      for (const item of items) {
        // TODO breaks at root item; solution: make root item an actual item?
        const siblings = item.getParent()?.getChildren();
        if (siblings) {
          props.changeChildren(
            item.getParent()!.getItemData(),
            siblings
              .filter((sibling) => sibling.getId() !== item.getId())
              .map((i) => i.getItemData())
          );
        }
      }

      const itemToChange =
        target.item === "root" ? props.rootItem : target.item.getItemData();
      const oldChildren = props.getChildren(itemToChange) ?? [];
      const insertChildren = items.map((item) => item.getItemData());
      const newChildren =
        target.childIndex === null
          ? [...oldChildren, ...insertChildren]
          : [
              ...oldChildren.slice(0, target.childIndex),
              ...insertChildren,
              ...oldChildren.slice(target.childIndex),
            ];

      props.changeChildren(itemToChange, newChildren);

      items[0].getTree().rebuildTree();
    },
  };
};
