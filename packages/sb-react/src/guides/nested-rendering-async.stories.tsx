import type { Meta } from "@storybook/react";
import React, { type FC, useState } from "react";
import {
  type ItemInstance,
  asyncDataLoaderFeature,
  dragAndDropFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { type DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Guides/Nested Rendering Async",
  tags: ["guide/nested-rendering", "homepage"],
} satisfies Meta;

export default meta;

const { asyncDataLoader } = createDemoData();

// story-start
const Item: FC<{ item: ItemInstance<DemoItem> }> = ({ item }) => {
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

export const NestedRenderingAsync = () => {
  const [state, setState] = useState({});
  const tree = useTree<DemoItem>({
    state,
    setState,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    createLoadingItemData: () => ({
      name: "Loading...",
    }),
    hotkeys: {
      customEvent: {
        hotkey: "Escape",
        handler: () => alert("Hello!"),
      },
    },
    dataLoader: asyncDataLoader,
    indent: 20,
    features: [
      asyncDataLoaderFeature,
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
