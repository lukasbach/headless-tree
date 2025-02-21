import type { Meta } from "@storybook/react";
import React from "react";
import {
  FeatureImplementation,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Plugins/Simple Plugin",
  tags: ["guide/plugin", "basic"],
} satisfies Meta;

export default meta;

// story-start

declare module "@headless-tree/core" {
  export interface ItemInstance<T> {
    alertChildren: () => void;
  }
}

const customFeature: FeatureImplementation = {
  itemInstance: {
    alertChildren: ({ item }) => {
      alert(
        item
          .getChildren()
          .map((child) => child.getItemName())
          .join(", "),
      );
    },
  },
};

export const SimplePlugin = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
    indent: 20,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-1item`,
        `${itemId}-2item`,
      ],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      customFeature,
    ],
  });

  return (
    <div {...tree.getContainerProps()} className="tree">
      {tree.getItems().map((item) => (
        <div className="outeritem" key={item.getId()}>
          <button
            {...item.getProps()}
            key={item.getId()}
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
          <button onClick={item.alertChildren}>alert</button>
        </div>
      ))}
    </div>
  );
};
