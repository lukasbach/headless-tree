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
  title: "React/Renaming/Can Rename Configurability",
  tags: ["feature/renaming"],
} satisfies Meta;

export default meta;

// story-start
export const CanRenameConfigurability = () => {
  const tree = useTree<string>({
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) =>
      item.getId().endsWith("-1") || item.getId().endsWith("-2"),
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [
        `${itemId}-1`,
        `${itemId}-2`,
        `${itemId}-3`,
        `${itemId}-4 (can rename)`,
      ],
    },
    onRename: (item, value) => {
      alert(`Renamed ${item.getItemName()} to ${value}`);
    },
    canRename: (item) => item.getId().includes("can rename"),
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
        <button onClick={() => tree.startRenamingItem("root-4 (can rename)")}>
          Rename root-4
        </button>{" "}
        or press F2 when an item is focused.
      </p>
      <div ref={tree.registerElement} className="tree">
        {tree.getItems().map((item) => (
          <button
            {...item.getProps()}
            ref={item.registerElement}
            key={item.getId()}
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
            )}
          </button>
        ))}
      </div>
    </>
  );
};
