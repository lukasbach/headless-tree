import type { Meta } from "@storybook/react";
import React, { forwardRef, HTMLProps, memo } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Guides/Memoized Slow Item Renderers",
} satisfies Meta;

export default meta;

const SlowItem = forwardRef<HTMLButtonElement, HTMLProps<HTMLButtonElement>>(
  (props, ref) => {
    const start = Date.now();
    while (Date.now() - start < 30); // force the component to take 30ms to render
    return <button {...(props as any)} ref={ref} />;
  }
);

// TODO this doesn't work yet
const MemoizedItem = memo(SlowItem);

export const MemoizedSlowItemRenderers = () => {
  const tree = useTree<string>({
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
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
      dragAndDropFeature,
    ],
  });

  return (
    <div ref={tree.registerElement} className="tree">
      {tree.getItems().map((item) => (
        <div
          key={item.getId()}
          className="treeitem-parent"
          style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <MemoizedItem
            {...item.getProps()}
            ref={item.registerElement}
            className={cx("treeitem", {
              focused: item.isFocused(),
              expanded: item.isExpanded(),
              selected: item.isSelected(),
              folder: item.isFolder(),
            })}
          >
            {item.getItemName()}
          </MemoizedItem>
        </div>
      ))}
    </div>
  );
};
