import type { Meta } from "@storybook/react";
import React from "react";
import {
  CheckedState,
  type FeatureImplementation,
  type TreeInstance,
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Checkboxes/Custom Behavior/All Items In State",
  tags: ["feature/checkbox", "checkbox", "checkbox/customizability"],
} satisfies Meta;

export default meta;

const { syncDataLoader } = createDemoData();

// story-start
const getAllLoadedDescendants = <T,>(
  tree: TreeInstance<T>,
  itemId: string,
): string[] => {
  if (!tree.getConfig().isItemFolder(tree.getItemInstance(itemId))) {
    return [itemId];
  }
  return tree
    .retrieveChildrenIds(itemId)
    .map((child) => [itemId, ...getAllLoadedDescendants(tree, child)])
    .flat();
};

const checkboxOverride: FeatureImplementation<DemoItem> = {
  itemInstance: {
    getCheckedState: ({ item, tree }) => {
      const { checkedItems } = tree.getState();
      const itemId = item.getId();

      if (item.isFolder()) {
        const descendants = getAllLoadedDescendants(tree, itemId);
        if (descendants.every((d) => checkedItems.includes(d))) {
          return CheckedState.Checked;
        }
        if (descendants.some((d) => checkedItems.includes(d))) {
          return CheckedState.Indeterminate;
        }
      }

      if (checkedItems.includes(itemId)) {
        return CheckedState.Checked;
      }

      return CheckedState.Unchecked;
    },
    toggleCheckedState: ({ item, tree }) => {
      const itemId = item.getId();
      if (item.getCheckedState() === CheckedState.Checked) {
        if (!item.isFolder()) {
          item.setUnchecked();
        } else {
          const descendants = getAllLoadedDescendants(tree, itemId);
          tree.applySubStateUpdate("checkedItems", (items) =>
            items.filter((id) => !descendants.includes(id)),
          );
        }
      } else if (!item.isFolder()) {
        item.setChecked();
      } else {
        tree.applySubStateUpdate("checkedItems", (items) => [
          ...new Set([...items, ...getAllLoadedDescendants(tree, itemId)]),
        ]);
      }
    },
  },
};

export const AllItemsInState = () => {
  const tree = useTree<DemoItem>({
    rootItemId: "root",
    initialState: {
      expandedItems: ["fruit", "berries", "red"],
      // checkedItems: ["red", "strawberry", "raspberry"],
      checkedItems: [],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: syncDataLoader,
    canCheckFolders: true,
    propagateCheckedState: false, // we implement our own propagaton logic in the override feature
    indent: 20,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
      checkboxOverride,
    ],
  });

  return (
    <>
      <p className="description">
        In this sample, custom checkbox state propagation logic is implemented,
        so that the normal item propagation is enabled, but all item IDs
        including folders are kept in the checkbox state.
      </p>

      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <div className="outeritem" key={item.getId()}>
            <button
              {...item.getProps()}
              style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
            >
              <div
                className={cx("treeitem", {
                  focused: item.isFocused(),
                  expanded: item.isExpanded(),
                  selected: item.isSelected(),
                  folder: item.isFolder(),
                })}
              >
                {item.getItemName()}
              </div>
            </button>
            <input type="checkbox" {...item.getCheckboxProps()} />
          </div>
        ))}
      </div>

      <pre>{JSON.stringify(tree.getState().checkedItems)}</pre>
    </>
  );
};
