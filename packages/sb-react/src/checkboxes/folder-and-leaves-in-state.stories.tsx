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
  title: "React/Checkboxes/Custom Behavior/Folders And Leaves In State",
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
    .map((child) => getAllLoadedDescendants(tree, child))
    .flat();
};

const checkboxOverride: FeatureImplementation<DemoItem> = {
  itemInstance: {
    getCheckedState: ({ tree, item }) => {
      const { checkedItems } = tree.getState();
      const itemId = item.getId();

      if (checkedItems.includes(itemId)) {
        return CheckedState.Checked;
      }

      if (item.isFolder()) {
        const descendants = getAllLoadedDescendants(tree, itemId);
        if (descendants.some((d) => checkedItems.includes(d))) {
          return CheckedState.Indeterminate;
        }
      }

      return CheckedState.Unchecked;
    },
  },
};

export const FoldersAndLeavesInState = () => {
  const tree = useTree<DemoItem>({
    rootItemId: "root",
    initialState: {
      expandedItems: ["fruit", "berries", "red"],
      checkedItems: ["strawberry"],
    },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: syncDataLoader,
    canCheckFolders: true,
    propagateCheckedState: false,
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
        In this sample, a custom "getCheckedState" method is used to determine
        what checkbox state an item should have. The checkbox state behaves
        identical to the case with "canCheckFolders=true", where leafes and
        folders can be checked independently of each other, but folders will
        show a "indeterminate" state if they are unchecked and contain at least
        one descendant that is checked.
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
