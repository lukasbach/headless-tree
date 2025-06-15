import type { Meta } from "@storybook/react";
import React from "react";
import {
  asyncDataLoaderFeature,
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Checkboxes/Async",
  tags: ["feature/checkbox", "feature/async-data-loader", "checkbox"],
} satisfies Meta;

export default meta;

const { asyncDataLoader } = createDemoData();

// story-start
export const Async = () => {
  const tree = useTree<DemoItem>({
    initialState: { expandedItems: ["fruit"], checkedItems: ["banana"] },
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: asyncDataLoader,
    createLoadingItemData: () => ({ name: "Loading..." }),
    indent: 20,
    features: [
      asyncDataLoaderFeature,
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
