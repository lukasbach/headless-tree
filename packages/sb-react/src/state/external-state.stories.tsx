import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  TreeState,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/State/External State",
  tags: ["guides/state"],
} satisfies Meta;

export default meta;

// story-start
export const ExternalState = () => {
  const [state, setState] = useState<Partial<TreeState<string>>>({});

  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    dataLoader: {
      getItem: (itemId) => itemId,
      getChildren: (itemId) => [`${itemId}-1`, `${itemId}-2`, `${itemId}-3`],
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <>
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
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <div className="actionbar">
        <button
          className="actionbtn"
          onClick={() => {
            setState({
              expandedItems: ["root-1", "root-2"],
              focusedItem: "root-1-1",
              selectedItems: ["root-1-1", "root-2-2"],
            });
          }}
        >
          Overwrite State
        </button>
      </div>
    </>
  );
};
