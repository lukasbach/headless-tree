import type { Meta } from "@storybook/react";
import React from "react";
import { hotkeysCoreFeature, selectionFeature } from "@headless-tree/core";
import { syncDataLoaderFeature } from "@headless-tree/core/lib/features/sync-data-loader/feature";
import { useTree } from "../index";

const meta = {
  title: "React/No State Handlers",
} satisfies Meta;

export default meta;

export const NoStateHandlers = () => {
  const tree = useTree<string>({
    state: {},
    rootItemId: "root",
    getItemName: (item) => item,
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <div ref={tree.registerElement} className="tree">
      {tree.getItems().map((item) => (
        <div
          key={item.getId()}
          className="treeitem-parent"
          style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
        >
          <button
            {...item.getProps()}
            ref={item.registerElement}
            className="treeitem"
            data-focused={item.isFocused()}
            data-expanded={item.isExpanded()}
            data-selected={item.isSelected()}
          >
            {item.isExpanded() ? "v " : "> "}
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};
