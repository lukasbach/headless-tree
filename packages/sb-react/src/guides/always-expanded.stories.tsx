import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Guides/Always Expanded",
} satisfies Meta;

export default meta;

// story-start
const { data, syncDataLoader } = createDemoData();

export const AlwaysExpanded = () => {
  const [expandedItems] = useState<string[]>(() => Object.keys(data));
  const tree = useTree<DemoItem>({
    state: { expandedItems },
    setExpandedItems: () => {},
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: syncDataLoader,
    indent: 20,
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <div {...tree.getContainerProps()} className="tree">
      {tree.getItems().map((item) => (
        <button
          {...item.getProps()}
          key={item.getId()}
          style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <div
            className={cn("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
            })}
          >
            {item.getItemName()}
          </div>
        </button>
      ))}
    </div>
  );
};
