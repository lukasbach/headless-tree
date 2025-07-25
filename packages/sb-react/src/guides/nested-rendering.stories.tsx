import type { Meta } from "@storybook/react";
import React, { type FC, useState } from "react";
import {
  type ItemInstance,
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/General/Nested Rendering",
} satisfies Meta;

export default meta;

// story-start
const Item: FC<{ item: ItemInstance<string> }> = ({ item }) => {
  return (
    <li
      style={{ paddingLeft: `20px` }}
      role="treeitem"
      aria-selected={item.isSelected()}
      aria-expanded={item.isExpanded()}
    >
      <button {...item.getProps()}>
        <div
          className={cn("treeitem", {
            focused: item.isFocused(),
            expanded: item.isExpanded(),
            selected: item.isSelected(),
            folder: item.isFolder(),
            drop: item.isDragTarget(),
          })}
        >
          {item.getItemName()}
        </div>
      </button>
      {item.isExpanded() && item.getChildren().length > 0 && (
        <ul role="group">
          {item.getChildren().map((child) => (
            <Item key={child.getKey()} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const NestedRendering = () => {
  const [state, setState] = useState({});
  const tree = useTree<string>({
    state,
    setState,
    rootItemId: "folder",
    getItemName: (item) => item.getItemData(),
    isItemFolder: (item) => !item.getItemData().endsWith("item"),
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
    indent: 20,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      dragAndDropFeature,
    ],
  });

  return (
    <div {...tree.getContainerProps()} className="tree">
      <ul role="group" {...tree.getContainerProps()} className="tree">
        {tree
          .getRootItem()
          ?.getChildren()
          .map((item) => <Item key={item.getKey()} item={item} />)}
      </ul>
      <div style={tree.getDragLineStyle()} className="dragline" />
      <style>
        {`
        .tree ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        `}
      </style>
    </div>
  );
};
