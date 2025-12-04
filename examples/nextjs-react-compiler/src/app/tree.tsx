"use client";

import { useTree } from "@headless-tree/react";
import {
  asyncDataLoaderFeature,
  hotkeysCoreFeature,
  selectionFeature,
} from "@headless-tree/core";
import cn from "classnames";
import { DemoItem, asyncDataLoader } from "@/data";

import "../style.css";
import { useState } from "react";

const useNoMemo = <const T,>(factory: () => T): T => {
  "use no memo";

  return factory();
};

function useStore<T>(store: T) {
  return () => store;
}

export const Tree = () => {
  "use no memo";

  const [loadingItemData, setLoadingItemData] = useState<string[]>([]);
  const [loadingItemChildrens, setLoadingItemChildrens] = useState<string[]>(
    [],
  );
  const tree = useStore(
    useTree<DemoItem>({
      state: { loadingItemData, loadingItemChildrens },
      setLoadingItemData,
      setLoadingItemChildrens,
      // instanceBuilder: buildProxiedInstance,
      rootItemId: "root",
      getItemName: (item) => item.getItemData()?.name,
      createLoadingItemData: () => ({ name: "Loading..." }),
      isItemFolder: () => true,
      dataLoader: asyncDataLoader,
      indent: 20,
      features: [asyncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
    }),
  );

  console.log(
    "items",
    tree()
      .getItems()
      .map((item) => item.getId()),
  );

  return (
    <>
      <div {...tree().getContainerProps()} className="tree">
        {tree()
          .getItems()
          .map((item) => (
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
      <pre>
        1
        {JSON.stringify(
          tree()
            .getItems()
            .map((item) => item.getItemData()),
        )}
      </pre>
      <pre>
        2
        {tree()
          .getItems()
          .map((item) => item.getId())}
      </pre>
    </>
  );
};
