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
  title: "React/Checkboxes/General",
} satisfies Meta;

export default meta;

const { syncDataLoader, data } = createDemoData();

// story-start
export const General = () => {
  const tree = useTree<DemoItem>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    hotkeys: {
      customEvent: {
        hotkey: "Escape",
        handler: () => alert("Hello!"),
      },
    },
    dataLoader: syncDataLoader,
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
