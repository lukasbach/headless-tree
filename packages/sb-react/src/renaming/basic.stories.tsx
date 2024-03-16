import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  renamingFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Renaming/Basic",
  tags: ["feature/renaming", "basic"],
} satisfies Meta;

export default meta;

// story-start
export const Basic = () => {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
    onRename: (item, value) => {
      alert(`Renamed ${item.getItemName()} to ${value}`);
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      renamingFeature,
    ],
  });

  return (
    <>
      <p className="description">
        <button onClick={() => tree.startRenamingItem("root-2")}>
          Rename root-2
        </button>{" "}
        or press F2 when an item is focused.
      </p>
      <div ref={tree.registerElement} className="tree">
        {tree.getItems().map((item) => (
          <div
            key={item.getId()}
            className="treeitem-parent"
            style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
          >
            {item.isRenaming() ? (
              <div className="treeitem">
                <input
                  {...item.getRenameInputProps()}
                  ref={(i) => i?.focus()}
                />
              </div>
            ) : (
              <button
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
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
