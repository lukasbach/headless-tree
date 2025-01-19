import type { Meta } from "@storybook/react";
import React from "react";
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";

const meta = {
  title: "React/Hotkeys/Overwriting Hotkeys",
  tags: ["feature/hotkeys"],
} satisfies Meta;

export default meta;

// story-start
export const OverwritingHotkeys = () => {
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
    hotkeys: {
      focusNextItem: {
        hotkey: "ArrowRight",
      },
      focusPreviousItem: {
        hotkey: "ArrowLeft",
      },
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <>
      <p className="description">
        In this example, the hotkeys for moving the focus up and down are bound
        to "ArrowLeft" and "ArrowRight", overwriting the hotkeys for expanding
        and collapsing (by default, the hotkeys are ArrowUp and ArrowDown).
      </p>
      <div ref={tree.registerElement} className="tree">
        {tree.getItems().map((item) => (
          <button
            {...item.getProps()}
            ref={item.registerElement}
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
        ))}
      </div>
    </>
  );
};
