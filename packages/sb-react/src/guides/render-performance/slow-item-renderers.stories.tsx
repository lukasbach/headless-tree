import type { Meta } from "@storybook/react";
import React, { HTMLProps, forwardRef } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { action } from "@storybook/addon-actions";
import cn from "classnames";

const meta = {
  title: "React/Guides/Render Performance/Slow Item Renderers",
  tags: ["feature/propmemoization"],
} satisfies Meta;

export default meta;

// story-start
const SlowItem = forwardRef<HTMLButtonElement, HTMLProps<HTMLButtonElement>>(
  (props, ref) => {
    const start = Date.now();
    while (Date.now() - start < 20); // force the component to take 20ms to render
    action("renderItem")();
    return <button {...(props as any)} ref={ref} />;
  },
);

export const SlowItemRenderers = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    initialState: {
      expandedItems: ["folder-1", "folder-2", "folder-3"],
    },
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
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <div {...tree.getContainerProps()} className="tree">
      {tree.getItems().map((item) => (
        <SlowItem
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
        </SlowItem>
      ))}
    </div>
  );
};
