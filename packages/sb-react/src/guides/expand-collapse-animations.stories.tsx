import type { Meta } from "@storybook/react";
import React, { type FC, useState } from "react";
import {
  type FeatureImplementation,
  type ItemInstance,
  dragAndDropFeature,
  hotkeysCoreFeature,
  makeStateUpdater,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/General/Expand Collapse Animations",
} satisfies Meta;

export default meta;

// story-start
// Define customs for a new state that stores if items are currently expanding or collapsing
declare module "@headless-tree/core" {
  export interface TreeState<T> {
    expandingOrCollapsingItems: string[];
  }
  export interface TreeConfig<T> {
    setExpandingOrCollapsingItems?: (items: string[]) => void;
  }
  export interface ItemInstance<T> {
    isExpandingOrCollapsing: () => boolean;
  }
}

// Custom feature for handling expand/collapse animations
// Storing whether an item is currently expanding or collapsing allows
// us to keep them rendered after collapsing while the animation is happening
const animationFeature: FeatureImplementation<string> = {
  getInitialState: (initialState) => ({
    expandingOrCollapsingItems: [],
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => {
    return {
      setExpandingOrCollapsingItems: makeStateUpdater(
        "expandingOrCollapsingItems",
        tree,
      ),
      ...defaultConfig,
    };
  },

  stateHandlerNames: {
    expandingOrCollapsingItems: "setExpandingOrCollapsingItems",
  },

  itemInstance: {
    // We overwrite the expand and collapse methods to add the expanding/collapsing state
    expand: ({ tree, item, itemId }) => {
      if (!item.isFolder()) {
        return;
      }

      if (tree.getState().loadingItemChildrens?.includes(itemId)) {
        return;
      }

      tree.applySubStateUpdate("expandedItems", (items) => [...items, itemId]);

      tree.applySubStateUpdate("expandingOrCollapsingItems", (items) => [
        ...items,
        itemId,
      ]);
      tree.rebuildTree();

      setTimeout(() => {
        tree.applySubStateUpdate("expandingOrCollapsingItems", (items) =>
          items.filter((id) => id !== itemId),
        );
      }, 0);
    },

    collapse: ({ tree, item, itemId }) => {
      if (!item.isFolder()) {
        return;
      }

      tree.applySubStateUpdate("expandingOrCollapsingItems", (items) => [
        ...items,
        itemId,
      ]);
      setTimeout(() => {
        tree.applySubStateUpdate("expandingOrCollapsingItems", (items) =>
          items.filter((id) => id !== itemId),
        );
        tree.applySubStateUpdate("expandedItems", (items) =>
          items.filter((id) => id !== itemId),
        );
        tree.rebuildTree();
      }, 300);
    },

    isExpandingOrCollapsing: ({ tree, itemId }) =>
      tree.getState().expandingOrCollapsingItems.includes(itemId),
  },
};

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
        <div
          className={cn("expand-container", {
            expandingOrCollapsing: item.isExpandingOrCollapsing(),
          })}
        >
          <ul role="group">
            {item.getChildren().map((child) => (
              <Item key={child.getKey()} item={child} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export const ExpandCollapseAnimations = () => {
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
      animationFeature,
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
        .expand-container {
          overflow: hidden;
        }
        .expand-container ul {
          transition: margin-top 0.3s ease-in-out;
          margin-top: 0;
        }
        .expand-container.expandingOrCollapsing ul {
          margin-top: -100%;
        }
        `}
      </style>
    </div>
  );
};
