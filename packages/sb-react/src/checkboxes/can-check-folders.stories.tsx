import type { Meta } from "@storybook/react";
import React from "react";
import {
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Checkboxes/Can Check Folders",
  tags: ["feature/checkbox", "checkbox"],
} satisfies Meta;

export default meta;

const { syncDataLoader } = createDemoData();

// story-start
export const CanCheckFolders = () => {
  const tree = useTree<DemoItem>({
    rootItemId: "root",
    initialState: { expandedItems: ["fruit"], checkedItems: ["banana"] },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: syncDataLoader,
    canCheckFolders: true,
    indent: 20,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
    ],
  });

  return (
    <>
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
