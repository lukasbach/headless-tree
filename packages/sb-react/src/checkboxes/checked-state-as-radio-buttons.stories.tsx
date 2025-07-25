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
  title: "React/Checkboxes/Custom Behavior/Checked State As Radio Buttons",
  tags: ["feature/checkbox", "checkbox", "checkbox/customizability"],
} satisfies Meta;

export default meta;

const { syncDataLoader } = createDemoData();

// story-start
const getAllLoadedDescendants = <T,>(
  tree: TreeInstance<T>,
  itemId: string,
): string[] => {
  if (!tree.getConfig().isItemFolder(tree.buildItemInstance(itemId))) {
    return [itemId];
  }
  return tree
    .retrieveChildrenIds(itemId)
    .map((child) => getAllLoadedDescendants(tree, child))
    .flat();
};

const checkboxOverride: FeatureImplementation<DemoItem> = {
  itemInstance: {
    toggleCheckedState: ({ item }) => {
      if (item.getCheckedState() === CheckedState.Checked) {
        item.setUnchecked();
      } else {
        // uncheck all siblings
        item
          .getParent()
          ?.getChildren()
          .forEach((child) => child.setUnchecked());

        item.setChecked();
      }
    },
  },
};

export const CheckedStateAsRadioButtons = () => {
  const tree = useTree<DemoItem>({
    rootItemId: "root",
    initialState: {
      expandedItems: ["fruit", "berries", "red"],
      checkedItems: ["fruit", "banana", "berries", "strawberry"],
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
        In this sample, a custom "toggleCheckedState" implementation is used to
        enforce that for each folder, only one child can be checked.
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
