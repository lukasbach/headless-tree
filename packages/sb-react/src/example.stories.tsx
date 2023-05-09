import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  dragAndDropFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";

const meta = {
  title: "React/Example",
} satisfies Meta;

export default meta;

export const Example = () => {
  const [state, setState] = useState({});
  const tree = useTree<string>({
    state,
    onStateChange: setState,
    rootItemId: "folder",
    getItemName: (item) => item,
    isItemFolder: (item) => !item.endsWith("item"),
    hotkeys: {
      customEvent: {
        hotkey: "Escape",
        handler: () => alert("Hello!"),
      },
    },
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-1item`,
        `${itemId}-2item`,
        `${itemId}-3item`,
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
          <button
            {...item.getProps()}
            ref={item.registerElement}
            className="treeitem"
            data-focused={item.isFocused()}
            data-expanded={item.isExpanded()}
            data-selected={item.isSelected()}
          >
            {item.isFolder() && item.isExpanded() ? "v " : ""}
            {item.isFolder() && !item.isExpanded() ? "> " : ""}
            {item.getItemName()}
          </button>
        </div>
      ))}
    </div>
  );
};
