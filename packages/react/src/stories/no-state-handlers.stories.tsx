import type { Meta } from "@storybook/react";
import React from "react";
import { hotkeysCoreFeature, selectionFeature } from "@headless-tree/core";
import { useTree } from "../index";

const meta = {
  title: "React/No State Handlers",
} satisfies Meta;

export default meta;

export const NoStateHandlers = () => {
  const tree = useTree<string>({
    state: { rootItemId: "root" },
    getItemName: (item) => item,
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
    features: [selectionFeature, hotkeysCoreFeature],
  });

  return (
    <div ref={tree.registerElement} className="tree">
      {tree.getItems().map((item) => (
        <div
          key={item.getId()}
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
