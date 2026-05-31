import type { Meta } from "@storybook/react";
import React, { Fragment } from "react";
import {
  type FeatureImplementation,
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

const renameOnRightClickFeature: FeatureImplementation = {
  itemInstance: {
    getProps: ({ prev, item }) => {
      const props = prev?.() ?? {};

      return {
        ...props,
        onContextMenu: (event: MouseEvent) => {
          event.preventDefault();
          props.onContextMenu?.(event);
          item.startRenaming();
        },
      };
    },
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
      selectionFeature,
      hotkeysCoreFeature,
      renamingFeature,
      renameOnRightClickFeature,
    ],
  });

  return (
    <>
      <p className="description">
        Double click any item button or right click it to start renaming.
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
                onDoubleClick={() => item.startRenaming()}
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
