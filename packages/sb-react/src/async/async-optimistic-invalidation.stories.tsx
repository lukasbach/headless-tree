import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  asyncDataLoaderFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cn from "classnames";
import { PropsOfArgtype } from "../argtypes";

const meta = {
  title: "React/Async/Async Optimistic Invalidation",
  tags: ["feature/async-data-loader"],
  argTypes: {
    optimistic: {
      type: "boolean",
    },
  },
  args: {
    optimistic: true,
  },
} satisfies Meta;

export default meta;

// eslint-disable-next-line no-promise-executor-return
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const random = () => Math.floor(Math.random() * 1000);

// story-start
export const AsyncOptimisticInvalidation = ({
  optimistic,
}: PropsOfArgtype<typeof meta>) => {
  const [loadingItemData, setLoadingItemData] = useState<string[]>([]);
  const [loadingItemChildrens, setLoadingItemChildrens] = useState<string[]>(
    [],
  );
  const tree = useTree<string>({
    state: { loadingItemData, loadingItemChildrens },
    setLoadingItemData,
    setLoadingItemChildrens,
    rootItemId: "root",
    getItemName: (item) => item.getItemData(),
    isItemFolder: () => true,
    createLoadingItemData: () => "Loading...",
    dataLoader: {
      getItem: (itemId) => wait(800).then(() => `${itemId}__${random()}`),
      getChildrenWithData: (itemId) =>
        wait(800).then(() =>
          [
            `${itemId}-${random()}`,
            `${itemId}-${random()}`,
            `${itemId}-${random()}`,
          ].map((id) => ({ id, data: `${id}__${random()}` })),
        ),
    },
    indent: 20,
    features: [asyncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return (
    <>
      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <div className="outeritem" key={item.getId()}>
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
                {item.isLoading() && " (loading...)"}
              </div>
            </button>
            <button onClick={() => item.invalidateItemData(optimistic)}>
              [i1]
            </button>
            <button onClick={() => item.invalidateChildrenIds(optimistic)}>
              [i2]
            </button>
          </div>
        ))}
      </div>
      <p>
        Press [i1] to invalidate item data, or [i2] to invalidate its children
        array.
      </p>
      <p>Loading:</p>
      <pre>
        {JSON.stringify({ loadingItemData, loadingItemChildrens }, null, 2)}
      </pre>
    </>
  );
};
