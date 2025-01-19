import type { Meta } from "@storybook/react";
import React, { HTMLProps, forwardRef, memo } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { action } from "@storybook/addon-actions";
import cx from "classnames";

const meta = {
  title: "React/Guides/Render Performance/Memoized Slow Item Renderers",
} satisfies Meta;

export default meta;

// story-start
const SlowItem = forwardRef<
  HTMLButtonElement,
  HTMLProps<HTMLButtonElement> & {
    level: number;
    innerClass: string;
    title: string;
  }
>(({ level, innerClass, title, ...props }, ref) => {
  const start = Date.now();
  while (Date.now() - start < 20); // force the component to take 20ms to render
  action("renderItem")();
  return (
    <button
      {...(props as any)}
      ref={ref}
      style={{ paddingLeft: `${level * 20}px` }}
    >
      <div className={innerClass}>{title}</div>
    </button>
  );
});

const MemoizedItem = memo(SlowItem);

export const MemoizedSlowItemRenderers = () => {
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
    <div ref={tree.registerElement} className="tree">
      {tree.getItems().map((item) => (
        <MemoizedItem
          {...item.getProps()}
          ref={item.registerElement}
          key={item.getId()}
          level={item.getItemMeta().level}
          innerClass={cx("treeitem", {
            focused: item.isFocused(),
            expanded: item.isExpanded(),
            selected: item.isSelected(),
            folder: item.isFolder(),
          })}
          title={item.getItemName()}
        />
      ))}
    </div>
  );
};
