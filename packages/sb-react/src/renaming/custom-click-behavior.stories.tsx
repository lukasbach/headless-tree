import type { Meta } from "@storybook/react";
import React, { Fragment } from "react";
import {
  type FeatureImplementation,
  type TreeInstance,
  hotkeysCoreFeature,
  renamingFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";

const meta = {
  title: "React/Renaming/Custom Click Behavior",
  tags: ["feature/renaming"],
} satisfies Meta;

export default meta;

const doubleClickDelay = 200;

type CustomClickBehaviorDataRef = {
  pendingExpansionTimers?: Map<string, ReturnType<typeof setTimeout>>;
};

const getExpansionTimers = (tree: TreeInstance<any>) => {
  const dataRef = tree.getDataRef<CustomClickBehaviorDataRef>();
  if (!dataRef.current.pendingExpansionTimers) {
    dataRef.current.pendingExpansionTimers = new Map();
  }
  return dataRef.current.pendingExpansionTimers;
};

const customClickBehaviorFeature: FeatureImplementation = {
  itemInstance: {
    getProps: ({ prev, item, tree }) => {
      const props = prev?.() ?? {};
      const expansionTimers = getExpansionTimers(tree);
      const itemId = item.getId();
      const cancelPendingExpansion = () => {
        const timer = expansionTimers.get(itemId);
        if (timer) {
          clearTimeout(timer);
          expansionTimers.delete(itemId);
        }
      };

      return {
        ...props,
        onClick: (event: MouseEvent) => {
          if (
            !item.isFolder() ||
            event.ctrlKey ||
            event.shiftKey ||
            event.metaKey
          ) {
            props.onClick?.(event);
            return;
          }

          if (expansionTimers.has(itemId)) {
            cancelPendingExpansion();
            return;
          }

          (event as MouseEvent & { persist?: () => void }).persist?.();
          expansionTimers.set(
            itemId,
            setTimeout(() => {
              expansionTimers.delete(itemId);
              props.onClick?.(event);
            }, doubleClickDelay),
          );
        },
        onDoubleClick: (event: MouseEvent) => {
          cancelPendingExpansion();
          props.onDoubleClick?.(event);
          item.setFocused();
          item.startRenaming();
        },
        onContextMenu: (event: MouseEvent) => {
          event.preventDefault();
          props.onContextMenu?.(event);
          item.startRenaming();
        },
      };
    },
  },
  onTreeUnmount: (tree: TreeInstance<any>) => {
    const dataRef = tree.getDataRef<CustomClickBehaviorDataRef>();
    dataRef.current.pendingExpansionTimers?.forEach(clearTimeout);
    delete dataRef.current.pendingExpansionTimers;
  },
};

// story-start
export const CustomClickBehavior = () => {
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
    initialState: {
      expandedItems: ["root-1", "root-1-1"],
    },
    features: [
      syncDataLoaderFeature,
      customClickBehaviorFeature,
      selectionFeature,
      hotkeysCoreFeature,
      renamingFeature,
    ],
  });

  return (
    <>
      <p className="description">
        Click an item to select it and toggle folders. Double click any item or
        right click it to start renaming.
      </p>
      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <Fragment key={item.getId()}>
            {item.isRenaming() ? (
              <div
                className="renaming-item"
                style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}
              >
                <input {...item.getRenameInputProps()} />
              </div>
            ) : (
              <button
                {...item.getProps()}
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
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
};
