/* eslint-disable jsx-a11y/label-has-associated-control */
import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import cx from "classnames";
import { DemoItem, createDemoData } from "../utils/data";

const meta = {
  title: "React/Checkboxes/Configurability",
  tags: ["feature/checkbox", "checkbox"],
} satisfies Meta;

export default meta;

const { syncDataLoader } = createDemoData();

// story-start
export const Configurability = () => {
  const [canCheckFolders, setCanCheckFolders] = useState(false);
  const [propagateCheckedState, setPropagateCheckedState] = useState(true);
  const tree = useTree<DemoItem>({
    rootItemId: "root",
    initialState: { expandedItems: ["fruit", "berries"] },
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => !!item.getItemData().children,
    dataLoader: syncDataLoader,
    indent: 20,
    canCheckFolders,
    propagateCheckedState,
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
    ],
  });

  return (
    <>
      <div>
        <label>
          <input
            type="checkbox"
            checked={canCheckFolders}
            onChange={(e) => setCanCheckFolders(e.target.checked)}
          />
          Can check folders
        </label>
        <label>
          <input
            type="checkbox"
            checked={propagateCheckedState}
            onChange={(e) => setPropagateCheckedState(e.target.checked)}
          />
          Propagate checked state
        </label>
      </div>
      <div {...tree.getContainerProps()} className="tree">
        {tree.getItems().map((item) => (
          <div className="outeritem" key={item.getId()}>
            <button
              {...item.getProps()}
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
            <input type="checkbox" {...item.getCheckboxProps()} />
          </div>
        ))}
      </div>
      <pre>{JSON.stringify(tree.getState().checkedItems)}</pre>
    </>
  );
};
